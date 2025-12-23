const highlights = [
  { label: "Active subscribers", value: "2,482" },
  { label: "Open rate", value: "48.6%" },
  { label: "Last send", value: "2 days ago" }
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">
          Welcome back, Jamie
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
