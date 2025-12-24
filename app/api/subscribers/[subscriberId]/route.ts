import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { requirePublication, requireUser } from "../../../../lib/auth";

type Params = {
  params: { subscriberId: string };
};

export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = await requireUser();
    const publication = await requirePublication(user.id);
    const body = await request.json();
    const status = typeof body?.status === "string" ? body.status : undefined;
    const tag = typeof body?.tag === "string" ? body.tag.trim() : "";
    const name = typeof body?.name === "string" ? body.name.trim() : undefined;

    const subscriber = await prisma.subscriber.findFirst({
      where: {
        id: params.subscriberId,
        publicationId: publication.id
      }
    });

    if (!subscriber) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (tag) {
        const tagRecord = await tx.tag.upsert({
          where: { publicationId_name: { publicationId: publication.id, name: tag } },
          update: {},
          create: { publicationId: publication.id, name: tag }
        });

        await tx.subscriberTag.upsert({
          where: {
            subscriberId_tagId: {
              subscriberId: subscriber.id,
              tagId: tagRecord.id
            }
          },
          update: {},
          create: {
            subscriberId: subscriber.id,
            tagId: tagRecord.id
          }
        });
      }

      return tx.subscriber.update({
        where: { id: subscriber.id },
        data: {
          status: status ?? subscriber.status,
          name: name ?? subscriber.name
        }
      });
    });

    return NextResponse.json({ subscriber: updated });
  } catch (error) {
    return NextResponse.json({ error: "Unable to update subscriber" }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const user = await requireUser();
    const publication = await requirePublication(user.id);

    const subscriber = await prisma.subscriber.findFirst({
      where: {
        id: params.subscriberId,
        publicationId: publication.id
      }
    });

    if (!subscriber) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.subscriber.delete({ where: { id: subscriber.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Unable to delete subscriber" }, { status: 400 });
  }
}
