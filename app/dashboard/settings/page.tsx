import { getActivePublication, getCurrentUser } from "../../lib/auth";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  const publication = user ? await getActivePublication(user.id) : null;

  const settings = publication
    ? [
        { label: "From name", value: publication.fromName },
        { label: "From email", value: publication.fromEmail },
        { label: "Sending domain", value: publication.sendingDomain ?? "—" }
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-600">
          Configure sender identity, domains, and publication preferences.
        </p>
      </div>
      {publication ? (
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
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">
          Create a publication to configure sender settings.
        </div>
      )}
    </div>
  );
}
