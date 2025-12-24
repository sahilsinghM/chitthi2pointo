import Link from "next/link";
import LoginForm from "../components/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
            Sign in
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">Welcome back</h1>
          <p className="text-sm text-slate-600">
            Use your email and password or request a magic link.
          </p>
        </div>
        <LoginForm />
        <div className="mt-4 text-center text-xs text-slate-500">
          Or <button className="font-semibold text-brand-600">email a magic link</button>
        </div>
        <div className="mt-6 text-center text-xs text-slate-500">
          Head to the <Link className="font-semibold text-brand-600" href="/dashboard">dashboard</Link>
          .
        </div>
      </div>
    </main>
  );
}
