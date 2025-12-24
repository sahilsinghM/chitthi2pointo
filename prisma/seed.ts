import { prisma } from "../lib/prisma";
import { hashPassword } from "../lib/password";

async function main() {
  const email = (process.env.SEED_USER_EMAIL ?? "admin@chitthi.app").toLowerCase();
  const password = process.env.SEED_USER_PASSWORD ?? "changeme";
  const publicationName = process.env.SEED_PUBLICATION_NAME ?? "Chitthi Weekly";

  const existingUser = await prisma.user.findUnique({ where: { email } });
  const user =
    existingUser ??
    (await prisma.user.create({
      data: {
        email,
        name: "Chitthi Admin",
        passwordHash: await hashPassword(password)
      }
    }));

  const existingPublication = await prisma.publication.findFirst({
    where: { name: publicationName }
  });

  const publication =
    existingPublication ??
    (await prisma.publication.create({
      data: {
        name: publicationName,
        slug: publicationName.toLowerCase().replace(/\s+/g, "-"),
        fromName: publicationName,
        fromEmail: process.env.EMAIL_FROM_DEFAULT ?? "hello@chitthi.app",
        replyToEmail: process.env.EMAIL_REPLY_TO ?? undefined
      }
    }));

  await prisma.membership.upsert({
    where: {
      userId_publicationId: {
        userId: user.id,
        publicationId: publication.id
      }
    },
    update: {},
    create: {
      userId: user.id,
      publicationId: publication.id,
      role: "OWNER"
    }
  });

  console.log("Seed complete", {
    userEmail: user.email,
    publication: publication.name
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
