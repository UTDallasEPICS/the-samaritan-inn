interface StatusBadgeProps {
  status: string;
}

const styles: Record<string, string> = {
  APPROVED: 'bg-green-100 text-green-700',
  DENIED: 'bg-red-100 text-red-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const key = (status ?? 'PENDING').toUpperCase();
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${
        styles[key] ?? styles.PENDING
      }`}
    >
      {key}
    </span>
  );
}
