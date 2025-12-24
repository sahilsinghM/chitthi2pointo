import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { requirePublication, requireUser } from "../../../../lib/auth";
import { renderBodyToHtml, toPreviewText } from "../../../../lib/content";

type Params = {
  params: { campaignId: string };
};

const STATUS_MAP: Record<string, "DRAFT" | "SCHEDULED" | "SENT"> = {
  draft: "DRAFT",
  scheduled: "SCHEDULED",
  sent: "SENT"
};

export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = await requireUser();
    const publication = await requirePublication(user.id);
    const body = await request.json();

    const campaign = await prisma.campaign.findFirst({
      where: {
        id: params.campaignId,
        publicationId: publication.id
      }
    });

    if (!campaign) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const title = body?.title?.trim() ?? campaign.title;
    const subject = body?.subject?.trim() ?? campaign.subject;
    const textBody = typeof body?.body === "string" ? body.body : null;
    const status = body?.status ? STATUS_MAP[body.status] ?? campaign.status : campaign.status;
    const scheduledAt =
      status === "SCHEDULED"
        ? new Date()
        : status === "DRAFT"
          ? null
          : campaign.scheduledAt;

    const updated = await prisma.campaign.update({
      where: { id: campaign.id },
      data: {
        title,
        subject,
        status,
        htmlContent: textBody !== null ? renderBodyToHtml(textBody) : campaign.htmlContent,
        previewText: textBody !== null ? toPreviewText(textBody) : campaign.previewText,
        scheduledAt
      }
    });

    return NextResponse.json({ campaign: updated });
  } catch (error) {
    return NextResponse.json({ error: "Unable to update campaign" }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const user = await requireUser();
    const publication = await requirePublication(user.id);

    const campaign = await prisma.campaign.findFirst({
      where: {
        id: params.campaignId,
        publicationId: publication.id
      }
    });

    if (!campaign) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.campaign.delete({ where: { id: campaign.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Unable to delete campaign" }, { status: 400 });
  }
}
