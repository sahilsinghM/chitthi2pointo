"use client";

import { useMemo, useState } from "react";

type SubscriberStatus = "active" | "unsubscribed";

type Subscriber = {
  id: string;
  email: string;
  name?: string;
  status: SubscriberStatus;
  tags: string[];
  source: string;
};

const seedSubscribers: Subscriber[] = [
  {
    id: "sub-1",
    email: "maria@startup.io",
    name: "Maria Gomez",
    status: "active",
    tags: ["Founders", "Weekly"],
    source: "Landing page"
  },
  {
    id: "sub-2",
    email: "alex@builders.dev",
    name: "Alex Chen",
    status: "active",
    tags: ["Product"],
    source: "Import"
  }
];

const availableTags = ["Weekly", "Product", "Founders", "Investors"];

export default function SubscriberManager() {
  const [subscribers, setSubscribers] = useState(seedSubscribers);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [tagInput, setTagInput] = useState("");

  const activeCount = useMemo(
    () => subscribers.filter((subscriber) => subscriber.status === "active").length,
    [subscribers]
  );

  const handleAddSubscriber = (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim()) {
      return;
    }

    const tags = tagInput
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    setSubscribers((prev) => [
      {
        id: `sub-${prev.length + 1}`,
        email,
        name: name.trim() || undefined,
        status: "active",
        tags,
        source: "Manual"
      },
      ...prev
    ]);

    setEmail("");
    setName("");
    setTagInput("");
  };

  const handleCsvImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result?.toString() ?? "";
      const lines = text.split(/\r?\n/).filter(Boolean);
      const imported = lines.slice(1).map((line, index) => {
        const [rowEmail, rowName, rowTags] = line.split(",");
        return {
          id: `csv-${index + 1}-${Date.now()}`,
          email: rowEmail?.trim() ?? "",
          name: rowName?.trim() || undefined,
          status: "active" as const,
          tags: rowTags
            ? rowTags.split("|").map((tag) => tag.trim()).filter(Boolean)
            : [],
          source: "CSV Import"
        };
      });

      setSubscribers((prev) => [...imported, ...prev]);
    };

    reader.readAsText(file);
  };

  const toggleUnsubscribe = (id: string) => {
    setSubscribers((prev) =>
      prev.map((subscriber) =>
        subscriber.id === id
          ? {
              ...subscriber,
              status:
                subscriber.status === "active" ? "unsubscribed" : "active"
            }
          : subscriber
      )
    );
  };

  const addTag = (id: string, tag: string) => {
    setSubscribers((prev) =>
      prev.map((subscriber) =>
        subscriber.id === id
          ? {
              ...subscriber,
              tags: Array.from(new Set([...subscriber.tags, tag]))
            }
          : subscriber
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <form
          onSubmit={handleAddSubscriber}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <h2 className="text-sm font-semibold text-slate-900">
            Add subscriber
          </h2>
          <div className="mt-4 grid gap-3">
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Name (optional)"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Tags (comma separated)"
              value={tagInput}
              onChange={(event) => setTagInput(event.target.value)}
            />
            <button className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
              Add subscriber
            </button>
          </div>
        </form>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Import CSV</h2>
          <p className="mt-2 text-xs text-slate-500">
            Upload a CSV with columns: email, name, tags (pipe-separated).
          </p>
          <div className="mt-4">
            <input
              type="file"
              accept=".csv"
              onChange={handleCsvImport}
              className="text-sm"
            />
          </div>
          <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
            Active subscribers: <span className="font-semibold">{activeCount}</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-5 text-xs font-semibold uppercase text-slate-500">
          <span>Email</span>
          <span>Status</span>
          <span>Tags</span>
          <span>Source</span>
          <span className="text-right">Actions</span>
        </div>
        <div className="mt-4 space-y-3">
          {subscribers.map((subscriber) => (
            <div
              key={subscriber.id}
              className="grid grid-cols-5 items-center text-sm text-slate-700"
            >
              <div>
                <p className="font-medium text-slate-900">
                  {subscriber.email}
                </p>
                <p className="text-xs text-slate-500">{subscriber.name}</p>
              </div>
              <span
                className={`text-xs font-semibold uppercase tracking-wide ${
                  subscriber.status === "active"
                    ? "text-emerald-600"
                    : "text-rose-500"
                }`}
              >
                {subscriber.status}
              </span>
              <div className="flex flex-wrap gap-2">
                {subscriber.tags.length === 0 && (
                  <span className="text-xs text-slate-400">No tags</span>
                )}
                {subscriber.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600"
                  >
                    {tag}
                  </span>
                ))}
                <select
                  className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-600"
                  defaultValue=""
                  onChange={(event) => {
                    if (event.target.value) {
                      addTag(subscriber.id, event.target.value);
                      event.target.value = "";
                    }
                  }}
                >
                  <option value="">+ Add tag</option>
                  {availableTags.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              </div>
              <span>{subscriber.source}</span>
              <div className="flex justify-end gap-2">
                <button
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
                  onClick={() => toggleUnsubscribe(subscriber.id)}
                >
                  {subscriber.status === "active" ? "Unsubscribe" : "Resubscribe"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
