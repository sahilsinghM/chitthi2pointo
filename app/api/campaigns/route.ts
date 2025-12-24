import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { requirePublication, requireUser } from "../../../lib/auth";
import { renderBodyToHtml, toPreviewText } from "../../../lib/content";

const STATUS_MAP: Record<string, "DRAFT" | "SCHEDULED" | "SENT"> = {
  draft: "DRAFT",
  scheduled: "SCHEDULED",
  sent: "SENT"
};

export async function GET() {
  try {
    const user = await requireUser();
    const publication = await requirePublication(user.id);
    const campaigns = await prisma.campaign.findMany({
      where: { publicationId: publication.id },
      orderBy: { updatedAt: "desc" }
    });

    return NextResponse.json({ campaigns });
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const publication = await requirePublication(user.id);
    const body = await request.json();
    const title = body?.title?.trim();
    const subject = body?.subject?.trim() || title;
    const textBody = body?.body?.toString() ?? "";
    const status = STATUS_MAP[body?.status] ?? "DRAFT";

    if (!title || !subject) {
      return NextResponse.json({ error: "title and subject are required" }, { status: 400 });
    }

    const scheduledAt = status === "SCHEDULED" ? new Date() : null;

    const campaign = await prisma.campaign.create({
      data: {
        publicationId: publication.id,
        title,
        subject,
        previewText: toPreviewText(textBody),
        htmlContent: renderBodyToHtml(textBody),
        status,
        scheduledAt
      }
    });

    return NextResponse.json({ campaign });
  } catch (error) {
    return NextResponse.json({ error: "Unable to create campaign" }, { status: 400 });
  }
}
