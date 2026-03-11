'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { listProjects, Project } from '@/lib/api';
import { StatusBadge } from '@/components/StatusBadge';

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await listProjects(20);
        setProjects(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  return (
    <main className="mx-auto mt-12 max-w-3xl rounded bg-white p-8 shadow">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="mt-2 text-sm text-slate-600">Create a new assessment project and track results.</p>
        </div>
        <Link href="/projects/new" className="rounded bg-slate-900 px-4 py-2 text-white">
          Create New Project
        </Link>
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Recent Projects</h2>

        {loading && <p className="mt-3 text-sm">Loading projects...</p>}
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        {!loading && !error && projects.length === 0 && (
          <p className="mt-3 text-sm text-slate-600">No projects yet. Create your first project.</p>
        )}

        {!loading && !error && projects.length > 0 && (
          <ul className="mt-4 space-y-3">
            {projects.map((project) => (
              <li key={project.id} className="rounded border bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{project.name}</p>
                    <p className="text-xs text-slate-500">ID: {project.id}</p>
                  </div>
                  <StatusBadge status={project.status} />
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <p className="text-sm text-slate-600">Car count: {project.car_count}</p>
                  <Link className="text-sm font-medium text-blue-700 hover:underline" href={`/projects/${project.id}/results`}>
                    View Results
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
