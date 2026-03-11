'use client';

import { useEffect, useState } from 'react';
import { getStatus, mediaUrl, Project } from '@/lib/api';
import { StatusBadge } from '@/components/StatusBadge';

export default function ResultsPage({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const poll = async () => {
      try {
        const res = await getStatus(Number(params.id));
        setProject(res);
        if (res.status !== 'completed' && res.status !== 'failed') {
          timer = setTimeout(poll, 3000);
        }
      } catch (err) {
        setError((err as Error).message);
      }
    };

    poll();
    return () => clearTimeout(timer);
  }, [params.id]);

  return (
    <main className="mx-auto mt-12 max-w-3xl rounded bg-white p-8 shadow">
      <h1 className="text-2xl font-bold">Project Results</h1>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {!project && <p className="mt-3">Loading...</p>}
      {project && (
        <div className="mt-4 space-y-6">
          <div className="flex items-center gap-3">
            <p className="font-medium">Status:</p>
            <StatusBadge status={project.status} />
          </div>

          {project.status === 'processing' && <p className="animate-pulse text-sm">Processing video...</p>}

          <div className="rounded border p-4">
            <p className="text-sm text-slate-500">Total car count</p>
            <p className="text-4xl font-bold">{project.car_count}</p>
          </div>

          {project.uploaded_video_url && (
            <div>
              <h2 className="mb-2 font-semibold">Uploaded video</h2>
              <video controls className="w-full rounded border" src={mediaUrl(project.uploaded_video_url) ?? undefined} />
            </div>
          )}

          {project.preview_path && (
            <div>
              <h2 className="mb-2 font-semibold">Preview frame</h2>
              <img src={mediaUrl(project.preview_path) ?? ''} alt="Processed preview" className="w-full rounded border" />
            </div>
          )}
        </div>
      )}
      {/* TODO(v2): add directional line crossing and richer per-lane analytics. */}
    </main>
  );
}
