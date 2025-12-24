import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { requirePublication, requireUser } from "../../../lib/auth";

function normalizeTags(input: unknown): string[] {
  if (!Array.isArray(input)) {
    return [];
  }
  return input
    .map((tag) => (typeof tag === "string" ? tag.trim() : ""))
    .filter(Boolean);
}

export async function GET() {
  try {
    const user = await requireUser();
    const publication = await requirePublication(user.id);

    const subscribers = await prisma.subscriber.findMany({
      where: { publicationId: publication.id },
      orderBy: { createdAt: "desc" },
      include: {
        tags: {
          include: { tag: true }
        }
      }
    });

    const payload = subscribers.map((subscriber) => ({
      id: subscriber.id,
      email: subscriber.email,
      name: subscriber.name ?? undefined,
      status: subscriber.status,
      source: subscriber.source ?? "Manual",
      tags: subscriber.tags.map((item) => item.tag.name)
    }));

    return NextResponse.json({ subscribers: payload });
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const publication = await requirePublication(user.id);
    const body = await request.json();

    const email = body?.email?.trim().toLowerCase();
    const name = body?.name?.trim() || null;
    const source = body?.source?.trim() || "Manual";
    const tags = normalizeTags(body?.tags);

    if (!email) {
      return NextResponse.json({ error: "email is required" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const tagRecords = await Promise.all(
        tags.map((tag) =>
          tx.tag.upsert({
            where: { publicationId_name: { publicationId: publication.id, name: tag } },
            update: {},
            create: { publicationId: publication.id, name: tag }
          })
        )
      );

      const subscriber = await tx.subscriber.create({
        data: {
          publicationId: publication.id,
          email,
          name,
          source,
          tags: {
            create: tagRecords.map((tag) => ({
              tagId: tag.id
            }))
          }
        }
      });

      return subscriber;
    });

    return NextResponse.json({ subscriber: result });
  } catch (error) {
    return NextResponse.json({ error: "Unable to create subscriber" }, { status: 400 });
  }
}
