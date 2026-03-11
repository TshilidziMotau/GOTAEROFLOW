export function StatusBadge({ status }: { status: string }) {
  const tone =
    status === 'completed'
      ? 'bg-green-100 text-green-800'
      : status === 'processing'
        ? 'bg-amber-100 text-amber-800'
        : status === 'failed'
          ? 'bg-red-100 text-red-800'
          : 'bg-blue-100 text-blue-800';

  return <span className={`rounded px-2 py-1 text-xs font-semibold ${tone}`}>{status}</span>;
}
