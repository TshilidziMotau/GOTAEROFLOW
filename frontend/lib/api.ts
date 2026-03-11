const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export type Project = {
  id: number;
  name: string;
  status: 'uploaded' | 'processing' | 'completed' | 'failed';
  car_count: number;
  preview_path: string | null;
  uploaded_video_url: string | null;
  created_at: string;
};

export async function createProject(name: string): Promise<Project> {
  const res = await fetch(`${API_URL}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error('Failed to create project');
  return res.json();
}

export async function listProjects(limit = 20): Promise<Project[]> {
  const res = await fetch(`${API_URL}/projects?limit=${limit}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load projects');
  return res.json();
}

export async function uploadProjectVideo(projectId: number, file: File): Promise<Project> {
  const form = new FormData();
  form.append('video', file);
  const res = await fetch(`${API_URL}/projects/${projectId}/upload`, { method: 'POST', body: form });
  if (!res.ok) throw new Error('Failed to upload video');
  return res.json();
}

export async function startProcessing(projectId: number): Promise<void> {
  const res = await fetch(`${API_URL}/projects/${projectId}/process`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to start processing');
}

export async function getStatus(projectId: number): Promise<Project> {
  const res = await fetch(`${API_URL}/projects/${projectId}/status`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch status');
  return res.json();
}

export const mediaUrl = (path: string | null) => (path ? `${API_URL}${path}` : null);
