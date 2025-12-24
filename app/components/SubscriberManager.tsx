"use client";

import { useEffect, useMemo, useState, useTransition } from "react";

type SubscriberStatus = "ACTIVE" | "UNSUBSCRIBED";

type Subscriber = {
  id: string;
  email: string;
  name?: string;
  status: SubscriberStatus;
  tags: string[];
  source: string;
};

const availableTags = ["Weekly", "Product", "Founders", "Investors"];

function parseCsv(text: string) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  const rows = lines.slice(1);
  return rows.map((line) => {
    const [email, name, tags] = line.split(",");
    return {
      email: email?.trim() ?? "",
      name: name?.trim() || undefined,
      tags: tags ? tags.split("|").map((tag) => tag.trim()).filter(Boolean) : []
    };
  });
}

export default function SubscriberManager() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const activeCount = useMemo(
    () => subscribers.filter((subscriber) => subscriber.status === "ACTIVE").length,
    [subscribers]
  );

  useEffect(() => {
    let active = true;
    fetch("/api/subscribers")
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        if (active) {
          setSubscribers(data.subscribers ?? []);
        }
      })
      .catch(() => {
        if (active) {
          setError("Unable to load subscribers.");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const handleAddSubscriber = (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim()) {
      return;
    }

    const tags = tagInput
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    startTransition(async () => {
      setError("");
      const response = await fetch("/api/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, tags })
      });

      if (!response.ok) {
        setError("Unable to add subscriber.");
        return;
      }

      const data = await response.json();
      const subscriber = data.subscriber;
      if (subscriber) {
        setSubscribers((prev) => [
          {
            id: subscriber.id,
            email: subscriber.email,
            name: subscriber.name ?? undefined,
            status: subscriber.status,
            tags,
            source: subscriber.source ?? "Manual"
          },
          ...prev
        ]);
      }
      setEmail("");
      setName("");
      setTagInput("");
    });
  };

  const handleCsvImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result?.toString() ?? "";
      const imported = parseCsv(text);
      if (!imported.length) {
        return;
      }

      startTransition(async () => {
        setError("");
        const response = await fetch("/api/subscribers/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subscribers: imported })
        });

        if (!response.ok) {
          setError("Unable to import CSV.");
          return;
        }

        const refreshed = await fetch("/api/subscribers").then((res) =>
          res.ok ? res.json() : Promise.reject(res)
        );
        setSubscribers(refreshed.subscribers ?? []);
      });
    };

    reader.readAsText(file);
  };

  const toggleUnsubscribe = (subscriber: Subscriber) => {
    const nextStatus = subscriber.status === "ACTIVE" ? "UNSUBSCRIBED" : "ACTIVE";
    startTransition(async () => {
      const response = await fetch(`/api/subscribers/${subscriber.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus })
      });

      if (!response.ok) {
        setError("Unable to update subscriber.");
        return;
      }

      setSubscribers((prev) =>
        prev.map((item) =>
          item.id === subscriber.id ? { ...item, status: nextStatus } : item
        )
      );
    });
  };

  const addTag = (subscriber: Subscriber, tag: string) => {
    startTransition(async () => {
      const response = await fetch(`/api/subscribers/${subscriber.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tag })
      });

      if (!response.ok) {
        setError("Unable to add tag.");
        return;
      }

      setSubscribers((prev) =>
        prev.map((item) =>
          item.id === subscriber.id
            ? { ...item, tags: Array.from(new Set([...item.tags, tag])) }
            : item
        )
      );
    });
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
            <button className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60" disabled={isPending}>
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
          {error ? <p className="mt-3 text-xs text-rose-600">{error}</p> : null}
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
          {subscribers.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
              No subscribers yet.
            </div>
          ) : (
            subscribers.map((subscriber) => (
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
                    subscriber.status === "ACTIVE"
                      ? "text-emerald-600"
                      : "text-rose-500"
                  }`}
                >
                  {subscriber.status.toLowerCase()}
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
                        addTag(subscriber, event.target.value);
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
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 disabled:opacity-60"
                    onClick={() => toggleUnsubscribe(subscriber)}
                    disabled={isPending}
                  >
                    {subscriber.status === "ACTIVE" ? "Unsubscribe" : "Resubscribe"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
