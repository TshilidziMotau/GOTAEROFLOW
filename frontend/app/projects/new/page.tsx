'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProject } from '@/lib/api';

export default function NewProjectPage() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const project = await createProject(name);
      router.push(`/projects/${project.id}/upload`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto mt-12 max-w-xl rounded bg-white p-8 shadow">
      <h1 className="text-xl font-bold">New Project</h1>
      <form onSubmit={onSubmit} className="mt-4 space-y-4">
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Project name"
          className="w-full rounded border p-2"
        />
        <button disabled={loading} className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50">
          {loading ? 'Creating...' : 'Create Project'}
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
    </main>
  );
}
