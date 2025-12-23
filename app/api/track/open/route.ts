import { prisma } from "../../../../lib/prisma";

const pixel = Buffer.from(
  "R0lGODlhAQABAPAAAP///wAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==",
  "base64"
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const campaignId = searchParams.get("campaignId");
  const subscriberId = searchParams.get("subscriberId");

  if (campaignId && subscriberId) {
    await prisma.sendEvent.create({
      data: {
        campaignId,
        subscriberId,
        type: "OPEN",
        userAgent: request.headers.get("user-agent") ?? undefined,
        ipAddress: request.headers.get("x-forwarded-for") ?? undefined
      }
    });
  }

  return new Response(pixel, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-cache, no-store, must-revalidate"
    }
  });
}
