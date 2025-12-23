import { prisma } from "../../../../lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const subscriberId = searchParams.get("subscriberId");

  if (!token || !subscriberId) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const link = await prisma.campaignLink.findUnique({
    where: { token }
  });

  if (link) {
    await prisma.sendEvent.create({
      data: {
        campaignId: link.campaignId,
        subscriberId,
        campaignLinkId: link.id,
        type: "CLICK",
        userAgent: request.headers.get("user-agent") ?? undefined,
        ipAddress: request.headers.get("x-forwarded-for") ?? undefined
      }
    });

    return NextResponse.redirect(link.url);
  }

  return NextResponse.redirect(new URL("/", request.url));
}
