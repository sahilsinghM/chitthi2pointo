import Link from "next/link";
import { redirect } from "next/navigation";
import PublicationSelector from "../components/PublicationSelector";
import SignOutButton from "../components/SignOutButton";
import { getCurrentUser } from "../../lib/auth";

const navigation = [
  { name: "Overview", href: "/dashboard" },
  { name: "Posts", href: "/dashboard/posts" },
  { name: "Subscribers", href: "/dashboard/subscribers" },
  { name: "Settings", href: "/dashboard/settings" }
];

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <Link className="text-lg font-semibold text-slate-900" href="/dashboard">
              Chitthi
            </Link>
            <PublicationSelector />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">{user.email}</span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <div className="mx-auto flex max-w-6xl gap-6 px-6 py-6">
        <aside className="w-56 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <nav className="space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
