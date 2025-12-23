import { prisma } from "../lib/prisma";
import { sendEmail } from "../lib/email";
import {
  appendTracking,
  buildTrackingPixelUrl,
  buildUnsubscribeUrl,
  buildClickRedirectUrl,
  replaceLinksWithTracked
} from "../lib/tracking";
import {
  fetchQueuedJobs,
  markJobFailed,
  markJobProcessing,
  markJobSent
} from "../lib/queue";

async function getOrCreateLinkToken(campaignId: string, url: string) {
  const existing = await prisma.campaignLink.findFirst({
    where: { campaignId, url }
  });

  if (existing) {
    return existing.token;
  }

  const created = await prisma.campaignLink.create({
    data: { campaignId, url }
  });

  return created.token;
}

async function buildTrackedHtml({
  html,
  campaignId,
  subscriberId
}: {
  html: string;
  campaignId: string;
  subscriberId: string;
}) {
  const urls = Array.from(html.matchAll(/href="(http[^\"]+)"/g)).map(
    (match) => match[1]
  );
  const uniqueUrls = Array.from(new Set(urls));
  const tokenMap = new Map<string, string>();

  for (const url of uniqueUrls) {
    const token = await getOrCreateLinkToken(campaignId, url);
    tokenMap.set(url, token);
  }

  return replaceLinksWithTracked(html, (url) =>
    buildClickRedirectUrl({
      token: tokenMap.get(url) ?? url,
      subscriberId
    })
  );
}

async function processJob(jobId: string) {
  const job = await prisma.sendJob.findUnique({
    where: { id: jobId },
    include: {
      campaign: { include: { publication: true } },
      subscriber: true
    }
  });

  if (!job) {
    return;
  }

  if (job.subscriber.status !== "ACTIVE") {
    await markJobFailed(job.id, "Subscriber is not active");
    return;
  }

  await markJobProcessing(job.id);

  const pixelUrl = buildTrackingPixelUrl({
    campaignId: job.campaignId,
    subscriberId: job.subscriberId
  });
  const unsubscribeUrl = buildUnsubscribeUrl({
    token: job.subscriber.unsubscribeToken,
    campaignId: job.campaignId
  });

  const trackedHtml = await buildTrackedHtml({
    html: job.campaign.htmlContent,
    campaignId: job.campaignId,
    subscriberId: job.subscriberId
  });

  const html = appendTracking(trackedHtml, { pixelUrl, unsubscribeUrl });

  try {
    const response = await sendEmail({
      to: job.subscriber.email,
      from: job.campaign.publication.fromEmail,
      subject: job.campaign.subject,
      html
    });

    await markJobSent(job.id, response.MessageId);
    await prisma.sendEvent.create({
      data: {
        campaignId: job.campaignId,
        subscriberId: job.subscriberId,
        type: "DELIVERED"
      }
    });
  } catch (error) {
    await markJobFailed(job.id, error instanceof Error ? error.message : "Unknown error");
  }
}

async function workerLoop() {
  const jobs = await fetchQueuedJobs();

  for (const job of jobs) {
    await processJob(job.id);
  }
}

const interval = Number(process.env.QUEUE_WORKER_INTERVAL_MS ?? 30000);

workerLoop();
setInterval(workerLoop, interval);
