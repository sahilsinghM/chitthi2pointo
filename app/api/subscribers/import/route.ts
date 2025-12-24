import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { requirePublication, requireUser } from "../../../../lib/auth";

type ImportRow = {
  email: string;
  name?: string;
  tags?: string[];
  source?: string;
};

function normalizeTags(tags?: string[]) {
  if (!tags) {
    return [];
  }
  return tags.map((tag) => tag.trim()).filter(Boolean);
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const publication = await requirePublication(user.id);
    const body = await request.json();
    const subscribers: ImportRow[] = Array.isArray(body?.subscribers)
      ? body.subscribers
      : [];

    if (!subscribers.length) {
      return NextResponse.json({ error: "No subscribers to import" }, { status: 400 });
    }

    const created = await prisma.$transaction(async (tx) => {
      const results = [];
      for (const row of subscribers) {
        const email = row.email?.trim().toLowerCase();
        if (!email) {
          continue;
        }

        const tagNames = normalizeTags(row.tags);
        const tagRecords = await Promise.all(
          tagNames.map((tag) =>
            tx.tag.upsert({
              where: { publicationId_name: { publicationId: publication.id, name: tag } },
              update: {},
              create: { publicationId: publication.id, name: tag }
            })
          )
        );

        const subscriber = await tx.subscriber.upsert({
          where: {
            publicationId_email: {
              publicationId: publication.id,
              email
            }
          },
          update: {
            name: row.name?.trim() || undefined,
            source: row.source?.trim() || "CSV Import"
          },
          create: {
            publicationId: publication.id,
            email,
            name: row.name?.trim() || undefined,
            source: row.source?.trim() || "CSV Import",
            tags: {
              create: tagRecords.map((tag) => ({
                tagId: tag.id
              }))
            }
          }
        });

        results.push(subscriber);
      }

      return results;
    });

    return NextResponse.json({ imported: created.length });
  } catch (error) {
    return NextResponse.json({ error: "Unable to import subscribers" }, { status: 400 });
  }
}
