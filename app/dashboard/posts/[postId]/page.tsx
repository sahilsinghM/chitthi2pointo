import Link from "next/link";
import { notFound } from "next/navigation";
import PostEditor from "../../../components/PostEditor";
import { prisma } from "../../../../lib/prisma";
import { getActivePublication, getCurrentUser } from "../../../../lib/auth";
import { htmlToPlainText } from "../../../../lib/content";

type Params = {
  params: Promise<{ postId: string }>;
};

export default async function EditPostPage({ params }: Params) {
  const { postId } = await params;
  const user = await getCurrentUser();
  const publication = user ? await getActivePublication(user.id) : null;

  if (!publication) {
    notFound();
  }

  const campaign = await prisma.campaign.findFirst({
    where: { id: postId, publicationId: publication.id }
  });

  if (!campaign) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
            Edit post
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">
            {campaign.title}
          </h1>
        </div>
        <Link
          href="/dashboard/posts"
          className="text-sm font-semibold text-slate-600 hover:text-slate-900"
        >
          Back to posts
        </Link>
      </div>
      <PostEditor
        campaignId={campaign.id}
        title={campaign.title}
        subject={campaign.subject}
        body={htmlToPlainText(campaign.htmlContent)}
        status={
          campaign.status === "SCHEDULED"
            ? "scheduled"
            : campaign.status === "SENT"
              ? "sent"
              : "draft"
        }
      />
    </div>
  );
}
