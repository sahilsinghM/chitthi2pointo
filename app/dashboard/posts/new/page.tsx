import Link from "next/link";
import { notFound } from "next/navigation";
import PostEditor from "../../../components/PostEditor";
import { getActivePublication, getCurrentUser } from "../../../../lib/auth";

export default async function NewPostPage() {
  const user = await getCurrentUser();
  const publication = user ? await getActivePublication(user.id) : null;

  if (!publication) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
            New post
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">
            Draft a new newsletter
          </h1>
        </div>
        <Link
          href="/dashboard/posts"
          className="text-sm font-semibold text-slate-600 hover:text-slate-900"
        >
          Back to posts
        </Link>
      </div>
      <PostEditor campaignId={undefined} title="" subject="" body="" status="draft" />
    </div>
  );
}
