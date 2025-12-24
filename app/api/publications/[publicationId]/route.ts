import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { requireUser } from "../../../../lib/auth";

type Params = {
  params: { publicationId: string };
};

export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const publication = await prisma.publication.findFirst({
      where: {
        id: params.publicationId,
        memberships: {
          some: { userId: user.id }
        }
      }
    });

    if (!publication) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await prisma.publication.update({
      where: { id: publication.id },
      data: {
        name: body?.name?.trim() ?? publication.name,
        fromName: body?.fromName?.trim() ?? publication.fromName,
        fromEmail: body?.fromEmail?.trim() ?? publication.fromEmail,
        replyToEmail: body?.replyToEmail?.trim() ?? publication.replyToEmail,
        sendingDomain: body?.sendingDomain?.trim() ?? publication.sendingDomain
      }
    });

    return NextResponse.json({ publication: updated });
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
