const settings = [
  { label: "From name", value: "Chitthi Weekly" },
  { label: "From email", value: "hello@chitthi.app" },
  { label: "Sending domain", value: "mail.chitthi.app" }
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-600">
          Configure sender identity, domains, and publication preferences.
        </p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-4">
          {settings.map((setting) => (
            <div key={setting.label} className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  {setting.label}
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  {setting.value}
                </p>
              </div>
              <button className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
                Edit
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
