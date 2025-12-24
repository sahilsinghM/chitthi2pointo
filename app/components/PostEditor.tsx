"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type PostStatus = "draft" | "scheduled" | "sent";

type PostEditorProps = {
  campaignId?: string;
  title: string;
  subject: string;
  body: string;
  status: PostStatus;
};

const statusOptions: { value: PostStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "scheduled", label: "Scheduled" },
  { value: "sent", label: "Sent" }
];

export default function PostEditor({ campaignId, title, subject, body, status }: PostEditorProps) {
  const router = useRouter();
  const [postTitle, setPostTitle] = useState(title);
  const [postSubject, setPostSubject] = useState(subject);
  const [postBody, setPostBody] = useState(body);
  const [postStatus, setPostStatus] = useState<PostStatus>(status);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const previewBody = useMemo(() => {
    if (!postBody.trim()) {
      return "Start writing to see a preview of your newsletter.";
    }

    return postBody;
  }, [postBody]);

  const handleSave = (overrideStatus?: PostStatus) => {
    setError("");
    startTransition(async () => {
      const payload = {
        title: postTitle,
        subject: postSubject || postTitle,
        body: postBody,
        status: overrideStatus ?? postStatus
      };

      const response = await fetch(
        campaignId ? `/api/campaigns/${campaignId}` : "/api/campaigns",
        {
          method: campaignId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        setError("Unable to save campaign. Check required fields.");
        return;
      }

      const data = await response.json();
      const id = data?.campaign?.id;
      if (!campaignId && id) {
        router.replace(`/dashboard/posts/${id}`);
      }
    });
  };

  const handleSend = () => {
    if (!campaignId) {
      setError("Save the campaign before sending.");
      return;
    }

    setError("");
    startTransition(async () => {
      const response = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId })
      });

      if (!response.ok) {
        setError("Unable to enqueue send. Check subscribers and settings.");
        return;
      }

      router.refresh();
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div className="space-y-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
                Editor
              </p>
              <h1 className="text-2xl font-semibold text-slate-900">
                Compose newsletter issue
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-60"
                type="button"
                onClick={() => handleSave("draft")}
                disabled={isPending}
              >
                Save as draft
              </button>
              <button
                className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
                type="button"
                onClick={() => handleSave()}
                disabled={isPending}
              >
                Save changes
              </button>
              <button
                className="rounded-full border border-brand-600 px-4 py-2 text-sm font-semibold text-brand-600 hover:bg-brand-50 disabled:opacity-60"
                type="button"
                onClick={handleSend}
                disabled={isPending || !campaignId}
              >
                Send now
              </button>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-600" htmlFor="post-title">
                Title
              </label>
              <input
                id="post-title"
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="Weekly product update"
                value={postTitle}
                onChange={(event) => setPostTitle(event.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600" htmlFor="post-subject">
                Subject
              </label>
              <input
                id="post-subject"
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="Subject line"
                value={postSubject}
                onChange={(event) => setPostSubject(event.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600" htmlFor="post-status">
                Status
              </label>
              <select
                id="post-status"
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                value={postStatus}
                onChange={(event) => setPostStatus(event.target.value as PostStatus)}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600" htmlFor="post-body">
                Body
              </label>
              <textarea
                id="post-body"
                className="mt-2 min-h-[240px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="Write your newsletter content here..."
                value={postBody}
                onChange={(event) => setPostBody(event.target.value)}
              />
              <p className="mt-2 text-xs text-slate-500">
                Use Markdown-like formatting for now. A rich text editor can be
                wired later.
              </p>
            </div>
            {error ? <p className="text-xs text-rose-600">{error}</p> : null}
          </div>
        </div>
      </div>
      <aside className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
            Preview
          </p>
          <h2 className="mt-2 text-lg font-semibold text-slate-900">
            {postTitle || "Untitled issue"}
          </h2>
          <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">
            Status: {postStatus}
          </p>
          <div className="mt-4 whitespace-pre-wrap text-sm text-slate-700">
            {previewBody}
          </div>
        </div>
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-xs text-slate-500">
          Preview renders plaintext for now. Switch to TipTap when ready for
          rich formatting.
        </div>
      </aside>
    </div>
  );
}
