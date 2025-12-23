import Link from "next/link";
import PostEditor from "../../../components/PostEditor";

const post = {
  id: "post-1",
  title: "Onboarding the next 1,000 subscribers",
  body: "Hey team,\n\nHere's what we learned from the latest growth sprint...",
  status: "scheduled" as const
};

export default function EditPostPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
            Edit post
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">
            {post.title}
          </h1>
        </div>
        <Link
          href="/dashboard/posts"
          className="text-sm font-semibold text-slate-600 hover:text-slate-900"
        >
          Back to posts
        </Link>
      </div>
      <PostEditor title={post.title} body={post.body} status={post.status} />
    </div>
  );
}
