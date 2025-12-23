import { prisma } from "./prisma";

const DEFAULT_BATCH_SIZE = 50;

export async function enqueueCampaign(campaignId: string) {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: { publication: true }
  });

  if (!campaign) {
    throw new Error("Campaign not found");
  }

  const subscribers = await prisma.subscriber.findMany({
    where: {
      publicationId: campaign.publicationId,
      status: "ACTIVE"
    },
    select: { id: true }
  });

  if (!subscribers.length) {
    return { enqueued: 0 };
  }

  const jobs = subscribers.map((subscriber) => ({
    campaignId,
    subscriberId: subscriber.id
  }));

  await prisma.sendJob.createMany({
    data: jobs,
    skipDuplicates: true
  });

  return { enqueued: jobs.length };
}

export async function fetchQueuedJobs() {
  const batchSize = Number(process.env.QUEUE_BATCH_SIZE ?? DEFAULT_BATCH_SIZE);

  return prisma.sendJob.findMany({
    where: { status: "QUEUED" },
    take: batchSize,
    include: {
      campaign: {
        include: { publication: true }
      },
      subscriber: true
    }
  });
}

export async function markJobProcessing(id: string) {
  return prisma.sendJob.update({
    where: { id },
    data: { status: "PROCESSING" }
  });
}

export async function markJobSent(id: string, providerMessageId?: string) {
  return prisma.sendJob.update({
    where: { id },
    data: {
      status: "SENT",
      sentAt: new Date(),
      providerMessageId
    }
  });
}

export async function markJobFailed(id: string, error: string) {
  return prisma.sendJob.update({
    where: { id },
    data: {
      status: "FAILED",
      lastError: error,
      attemptCount: { increment: 1 }
    }
  });
}
