'use client';

import { useEffect, useState } from 'react';

interface Caseworker {
  id: string;
  name: string;
}

interface Props {
  value: string;
  onChange: (id: string) => void;
}

const inputClass =
  'w-full border border-gray-300 rounded px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-secondary';

export default function CaseworkerSelect({ value, onChange }: Props) {
  const [caseworkers, setCaseworkers] = useState<Caseworker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/api/users/caseworkers')
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => setCaseworkers(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-sm text-gray-400 py-2">Loading caseworkers…</p>;
  }

  if (error) {
    return <p className="text-sm text-red-500 py-2">Failed to load caseworkers.</p>;
  }

  return (
    <select value={value} onChange={e => onChange(e.target.value)} className={inputClass}>
      <option value="">Select your caseworker…</option>
      {caseworkers.map(cw => (
        <option key={cw.id} value={cw.id}>
          {cw.name}
        </option>
      ))}
    </select>
  );
}
