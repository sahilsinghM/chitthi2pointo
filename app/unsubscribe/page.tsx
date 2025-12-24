import { prisma } from "../../lib/prisma";

export default async function UnsubscribePage({
  searchParams
}: {
  searchParams: Promise<{ token?: string; campaignId?: string }>;
}) {
  const { token, campaignId } = await searchParams;

  if (!token) {
    return (
      <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">Missing token</h1>
        <p className="mt-2 text-sm text-slate-600">
          We could not find an unsubscribe token.
        </p>
      </main>
    );
  }

  const subscriber = await prisma.subscriber.findUnique({
    where: { unsubscribeToken: token }
  });

  if (!subscriber) {
    return (
      <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">Invalid link</h1>
        <p className="mt-2 text-sm text-slate-600">
          That unsubscribe link is no longer valid.
        </p>
      </main>
    );
  }

  if (subscriber.status !== "UNSUBSCRIBED") {
    await prisma.subscriber.update({
      where: { id: subscriber.id },
      data: { status: "UNSUBSCRIBED" }
    });
  }

  if (campaignId) {
    await prisma.sendEvent.create({
      data: {
        campaignId,
        subscriberId: subscriber.id,
        type: "UNSUBSCRIBE"
      }
    });
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 text-center">
      <h1 className="text-2xl font-semibold text-slate-900">You're unsubscribed</h1>
      <p className="mt-2 text-sm text-slate-600">
        You will no longer receive emails from this publication.
      </p>
    </main>
  );
}
