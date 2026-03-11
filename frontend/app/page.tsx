import Link from 'next/link';

export default function Home() {
  return (
    <main className="mx-auto mt-24 max-w-xl rounded bg-white p-8 shadow">
      <h1 className="text-2xl font-bold">GOTA AERO FLOW TIA</h1>
      <p className="mt-2 text-sm text-slate-600">MVP for upload → process → car count only.</p>
      <div className="mt-6 flex gap-3">
        <Link className="rounded bg-slate-900 px-4 py-2 text-white" href="/login">
          Login (placeholder)
        </Link>
      </div>
    </main>
  );
}
