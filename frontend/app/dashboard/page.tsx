import Link from 'next/link';

export default function DashboardPage() {
  return (
    <main className="mx-auto mt-12 max-w-3xl rounded bg-white p-8 shadow">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-2 text-sm text-slate-600">Create a project, upload one video, and get total car count.</p>
      <div className="mt-6">
        <Link href="/projects/new" className="rounded bg-slate-900 px-4 py-2 text-white">
          New Project
        </Link>
      </div>
      {/* TODO(v2): show project history and pagination. */}
    </main>
  );
}
