'use client';

import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  return (
    <main className="mx-auto mt-24 max-w-md rounded bg-white p-8 shadow">
      <h1 className="text-xl font-bold">Login</h1>
      <p className="mt-2 text-sm text-slate-600">Placeholder auth for MVP only.</p>
      <button
        onClick={() => router.push('/dashboard')}
        className="mt-6 w-full rounded bg-slate-900 px-4 py-2 text-white"
      >
        Continue
      </button>
    </main>
  );
}
