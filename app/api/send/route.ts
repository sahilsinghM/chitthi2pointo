import { NextResponse } from "next/server";
import { enqueueCampaign } from "../../../lib/queue";
import { prisma } from "../../../lib/prisma";
import { requirePublication, requireUser } from "../../../lib/auth";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const publication = await requirePublication(user.id);
    const body = await request.json();
    const campaignId = body?.campaignId as string | undefined;

    if (!campaignId) {
      return NextResponse.json({ error: "campaignId is required" }, { status: 400 });
    }

    const campaign = await prisma.campaign.findFirst({
      where: { id: campaignId, publicationId: publication.id }
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const result = await enqueueCampaign(campaignId);

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
