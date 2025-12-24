import { prisma } from "../../lib/prisma";
import { getActivePublication, getCurrentUser } from "../../lib/auth";

function formatRelative(date: Date | null) {
  if (!date) {
    return "Never";
  }
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) {
    return "Today";
  }
  if (diffDays === 1) {
    return "1 day ago";
  }
  return `${diffDays} days ago`;
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const publication = user ? await getActivePublication(user.id) : null;

  const [activeSubscribers, deliveredEvents, openEvents, lastCampaign] =
    publication
      ? await Promise.all([
          prisma.subscriber.count({
            where: { publicationId: publication.id, status: "ACTIVE" }
          }),
          prisma.sendEvent.count({
            where: { campaign: { publicationId: publication.id }, type: "DELIVERED" }
          }),
          prisma.sendEvent.count({
            where: { campaign: { publicationId: publication.id }, type: "OPEN" }
          }),
          prisma.campaign.findFirst({
            where: { publicationId: publication.id, sentAt: { not: null } },
            orderBy: { sentAt: "desc" }
          })
        ])
      : [0, 0, 0, null];

  const openRate =
    deliveredEvents > 0 ? `${Math.round((openEvents / deliveredEvents) * 100)}%` : "—";

  const highlights = [
    { label: "Active subscribers", value: activeSubscribers.toLocaleString() },
    { label: "Open rate", value: openRate },
    { label: "Last send", value: formatRelative(lastCampaign?.sentAt ?? null) }
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Review your latest campaign performance and keep your publication on
          schedule.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {highlights.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-xs uppercase tracking-wide text-slate-500">
              {card.label}
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {card.value}
            </p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
        Draft a new post from the Posts tab or schedule your next send.
      </div>
    </div>
  );
}
