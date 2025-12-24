import Link from "next/link";
import { prisma } from "../../../lib/prisma";
import { getActivePublication, getCurrentUser } from "../../../lib/auth";

type CampaignCard = {
  id: string;
  title: string;
  status: string;
  updatedAtLabel: string;
  delivered: number;
  opens: number;
  clicks: number;
  unsubscribes: number;
};

function formatDate(value: Date | null) {
  if (!value) {
    return "Never";
  }

  return value.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric"
  });
}

export default async function PostsPage() {
  const user = await getCurrentUser();
  const publication = user ? await getActivePublication(user.id) : null;

  if (!publication) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">
        Create a publication to start drafting campaigns.
      </div>
    );
  }

  const campaigns = await prisma.campaign.findMany({
    where: { publicationId: publication.id },
    orderBy: { updatedAt: "desc" },
    take: 10
  });

  const eventCounts = await prisma.sendEvent.groupBy({
    by: ["campaignId", "type"],
    where: {
      campaign: { publicationId: publication.id }
    },
    _count: { _all: true }
  });

  const countsByCampaign = eventCounts.reduce<Record<string, Record<string, number>>>(
    (acc, row) => {
      if (!acc[row.campaignId]) {
        acc[row.campaignId] = {};
      }
      acc[row.campaignId][row.type] = row._count._all;
      return acc;
    },
    {}
  );

  const posts: CampaignCard[] = campaigns.map((campaign) => {
    const counts = countsByCampaign[campaign.id] ?? {};
    return {
      id: campaign.id,
      title: campaign.title,
      status: campaign.status.toLowerCase(),
      updatedAtLabel: formatDate(campaign.updatedAt),
      delivered: counts.DELIVERED ?? 0,
      opens: counts.OPEN ?? 0,
      clicks: counts.CLICK ?? 0,
      unsubscribes: counts.UNSUBSCRIBE ?? 0
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Posts</h1>
          <p className="text-sm text-slate-600">
            Draft, schedule, and publish newsletter issues.
          </p>
        </div>
        <Link
          href="/dashboard/posts/new"
          className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          New post
        </Link>
      </div>
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">
            No campaigns yet. Draft your first post to see analytics here.
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Link
                    href={`/dashboard/posts/${post.id}`}
                    className="text-base font-semibold text-slate-900 hover:text-brand-600"
                  >
                    {post.title}
                  </Link>
                  <p className="mt-1 text-xs text-slate-500">
                    Updated {post.updatedAtLabel}
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase text-slate-600">
                  {post.status}
                </span>
              </div>
              <div className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-4">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Delivered
                  </p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {post.delivered}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Opens
                  </p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {post.opens}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Clicks
                  </p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {post.clicks}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Unsubscribes
                  </p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {post.unsubscribes}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
