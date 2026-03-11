'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { startProcessing, uploadProjectVideo } from '@/lib/api';

export default function UploadPage({ params }: { params: { id: string } }) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);
    try {
      await uploadProjectVideo(Number(params.id), file);
      await startProcessing(Number(params.id));
      router.push(`/projects/${params.id}/results`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto mt-12 max-w-xl rounded bg-white p-8 shadow">
      <h1 className="text-xl font-bold">Upload .mp4 Video</h1>
      <p className="mt-2 text-sm text-slate-600">Upload one video file (.mp4, .avi, .mov, .mkv).</p>
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <input
          required
          accept=".mp4,.avi,.mov,.mkv"
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="w-full rounded border p-2"
        />
        <button disabled={loading || !file} className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50">
          {loading ? 'Uploading...' : 'Upload and Process'}
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
    </main>
  );
}
