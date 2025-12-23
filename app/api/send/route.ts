import { NextResponse } from "next/server";
import { enqueueCampaign } from "../../../lib/queue";

export async function POST(request: Request) {
  const body = await request.json();
  const campaignId = body?.campaignId as string | undefined;

  if (!campaignId) {
    return NextResponse.json({ error: "campaignId is required" }, { status: 400 });
  }

  const result = await enqueueCampaign(campaignId);

  return NextResponse.json({ ok: true, ...result });
}
