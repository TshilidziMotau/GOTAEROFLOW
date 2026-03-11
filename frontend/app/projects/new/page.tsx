'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProject, startProcessing, uploadProjectVideo } from '@/lib/api';

const ALLOWED_TYPES = ['.mp4', '.avi', '.mov', '.mkv'];
const MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024;

export default function NewProjectPage() {
  const [name, setName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fileSizeLabel = useMemo(() => {
    if (!file) return 'No file selected';
    const mb = file.size / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  }, [file]);

  const validateFile = (candidate: File | null): string | null => {
    if (!candidate) return 'Please select a video file';
    const ext = `.${candidate.name.split('.').pop()?.toLowerCase()}`;
    if (!ALLOWED_TYPES.includes(ext)) return 'Only .mp4, .avi, .mov, .mkv files are allowed';
    if (candidate.size > MAX_FILE_SIZE_BYTES) return 'File is too large. Max supported size is 500 MB';
    return null;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      const project = await createProject(name);
      await uploadProjectVideo(project.id, file!);
      await startProcessing(project.id);
      router.push(`/projects/${project.id}/results`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto mt-12 max-w-xl rounded bg-white p-8 shadow">
      <h1 className="text-xl font-bold">Create Project & Upload Video</h1>
      <p className="mt-2 text-sm text-slate-600">Upload one video for assessment and start processing immediately.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Project name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Project name"
            className="w-full rounded border p-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Video file</label>
          <input
            required
            accept={ALLOWED_TYPES.join(',')}
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full rounded border p-2"
          />
          <p className="mt-1 text-xs text-slate-500">Accepted: .mp4, .avi, .mov, .mkv • Max 500 MB</p>
          <p className="mt-1 text-xs text-slate-600">File size: {fileSizeLabel}</p>
        </div>

        <button
          disabled={loading}
          className="rounded bg-slate-900 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Creating project & uploading...' : 'Create Project'}
        </button>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
    </main>
  );
}
