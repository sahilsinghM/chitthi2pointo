import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { requireUser } from "../../../lib/auth";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET() {
  try {
    const user = await requireUser();
    const publications = await prisma.publication.findMany({
      where: {
        memberships: {
          some: { userId: user.id }
        }
      },
      orderBy: { createdAt: "asc" }
    });

    return NextResponse.json({ publications });
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const name = body?.name?.trim();
    const fromName = body?.fromName?.trim();
    const fromEmail = body?.fromEmail?.trim();
    const replyToEmail = body?.replyToEmail?.trim() ?? null;
    const sendingDomain = body?.sendingDomain?.trim() ?? null;
    const slug = body?.slug?.trim() || (name ? slugify(name) : "");

    if (!name || !fromName || !fromEmail || !slug) {
      return NextResponse.json(
        { error: "name, fromName, fromEmail, and slug are required" },
        { status: 400 }
      );
    }

    const publication = await prisma.publication.create({
      data: {
        name,
        slug,
        fromName,
        fromEmail,
        replyToEmail,
        sendingDomain,
        memberships: {
          create: {
            userId: user.id,
            role: "OWNER"
          }
        }
      }
    });

    return NextResponse.json({ publication });
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
