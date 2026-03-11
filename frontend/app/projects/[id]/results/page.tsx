'use client';

import { useEffect, useMemo, useState } from 'react';
import { Project, getStatus, mediaUrl } from '@/lib/api';
import { StatusBadge } from '@/components/StatusBadge';

type ResultsPageProps = {
  params: {
    id: string;
  };
};

export default function ResultsPage({ params }: ResultsPageProps) {
  const projectId = useMemo(() => Number(params.id), [params.id]);

  const [project, setProject] = useState<Project | null>(null);
  const [summaryText, setSummaryText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (Number.isNaN(projectId)) {
      setLoading(false);
      setError('Invalid project id');
      return;
    }

    let timer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    const poll = async () => {
      try {
        const data = await getStatus(projectId);
        if (cancelled) return;

        setProject(data);
        setLoading(false);

        if (data.status !== 'completed' && data.status !== 'failed') {
          timer = setTimeout(poll, 3000);
        }
      } catch (err) {
        if (cancelled) return;
        setLoading(false);
        setError((err as Error).message || 'Failed to load project status');
      }
    };

    poll();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [projectId]);

  useEffect(() => {
    const loadSummary = async () => {
      if (!project?.preview_path || !project.preview_path.endsWith('.txt')) {
        setSummaryText('');
        return;
      }

      try {
        const url = mediaUrl(project.preview_path);
        if (!url) return;

        const res = await fetch(url);
        if (!res.ok) return;

        setSummaryText(await res.text());
      } catch {
        setSummaryText('');
      }
    };

    loadSummary();
  }, [project?.preview_path]);

  return (
    <main className="mx-auto mt-12 max-w-3xl rounded bg-white p-8 shadow">
      <h1 className="text-2xl font-bold">Project Results</h1>

      {loading && <p className="mt-3 text-sm">Loading project data...</p>}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {!loading && !error && project && (
        <div className="mt-6 space-y-6">
          <div className="flex items-center gap-3">
            <span className="font-medium">Status:</span>
            <StatusBadge status={project.status} />
          </div>

          {project.status === 'processing' && (
            <p className="animate-pulse text-sm text-slate-600">Processing video...</p>
          )}

          <section className="rounded border p-4">
            <p className="text-sm text-slate-500">Total car count</p>
            <p className="text-4xl font-bold">{project.car_count}</p>
          </section>

          {project.uploaded_video_url && (
            <section>
              <h2 className="mb-2 font-semibold">Uploaded video</h2>
              <video
                controls
                className="w-full rounded border"
                src={mediaUrl(project.uploaded_video_url) ?? undefined}
              />
            </section>
          )}

          {project.preview_path?.endsWith('.txt') && summaryText && (
            <section className="rounded border bg-slate-50 p-4 text-sm">
              <h2 className="mb-2 font-semibold">Processing summary</h2>
              <p>{summaryText}</p>
            </section>
          )}

          {project.preview_path && !project.preview_path.endsWith('.txt') && (
            <section>
              <h2 className="mb-2 font-semibold">Preview frame</h2>
              <img
                src={mediaUrl(project.preview_path) ?? ''}
                alt="Processed preview"
                className="w-full rounded border"
              />
            </section>
          )}
        </div>
      )}

      {!loading && !error && !project && (
        <p className="mt-3 text-sm text-slate-600">Project was not found.</p>
      )}
    </main>
  );
}
