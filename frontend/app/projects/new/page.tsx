'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProject } from '@/lib/api';

const MAX_NAME_LENGTH = 120;

export default function NewProjectPage() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Project name is required');
      setLoading(false);
      return;
    }
    if (trimmedName.length > MAX_NAME_LENGTH) {
      setError(`Project name must be ${MAX_NAME_LENGTH} characters or less`);
      setLoading(false);
      return;
    }

    try {
      const project = await createProject(trimmedName);
      router.push(`/projects/${project.id}/upload`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto mt-12 max-w-xl rounded bg-white p-8 shadow">
      <h1 className="text-xl font-bold">Create Project</h1>
      <p className="mt-2 text-sm text-slate-600">Start by creating a project, then upload the video in the next step.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Project name</label>
          <input
            required
            value={name}
            maxLength={MAX_NAME_LENGTH}
            onChange={(e) => setName(e.target.value)}
            placeholder="Project name"
            className="w-full rounded border p-2"
          />
          <p className="mt-1 text-xs text-slate-500">{name.trim().length}/{MAX_NAME_LENGTH}</p>
        </div>

        <button
          disabled={loading}
          className="rounded bg-slate-900 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Project'}
        </button>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
    </main>
  );
}
