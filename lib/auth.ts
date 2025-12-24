import { auth } from "../auth";
import { prisma } from "./prisma";

export async function getCurrentUser() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: session.user.id }
  });
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function getActivePublication(userId: string) {
  return prisma.publication.findFirst({
    where: {
      memberships: {
        some: { userId }
      }
    },
    orderBy: { createdAt: "asc" }
  });
}

export async function requirePublication(userId: string) {
  const publication = await getActivePublication(userId);
  if (!publication) {
    throw new Error("Publication not found");
  }
  return publication;
}
