import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
      <div className="max-w-xl space-y-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
          Chitthi MVP
        </p>
        <h1 className="text-4xl font-semibold text-slate-900">
          Build and send newsletters with a Beehiiv-style workflow.
        </h1>
        <p className="text-base text-slate-600">
          Multi-tenant publications, queue-based sending, and a clean dashboard
          experience powered by Next.js and Prisma.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            className="rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            href="/login"
          >
            Sign in
          </Link>
          <Link
            className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300"
            href="/dashboard"
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
