'use client';

import { useEffect, useRef, useState } from 'react';

interface Resident {
  id: string;
  name: string;
}

interface Props {
  value: string;
  onChange: (id: string) => void;
}

const inputClass =
  'w-full border border-gray-300 rounded px-3 py-2 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary';

export default function ResidentSearch({ value, onChange }: Props) {
  const [inputText, setInputText] = useState('');
  const [results, setResults] = useState<Resident[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Debounced fetch on inputText change
  useEffect(() => {
    if (!inputText.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    const timer = setTimeout(() => {
      fetch(`/api/users/residents?q=${encodeURIComponent(inputText)}`)
        .then(res => res.json())
        .then((data: Resident[]) => {
          setResults(data);
          setOpen(data.length > 0);
        })
        .catch(() => setResults([]));
    }, 300);
    return () => clearTimeout(timer);
  }, [inputText]);

  const handleSelect = (resident: Resident) => {
    setInputText(resident.name);
    onChange(resident.id);
    setOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setInputText(text);
    if (!text.trim()) {
      onChange('');
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={inputText}
        onChange={handleInputChange}
        placeholder="Search by name…"
        className={inputClass}
        autoComplete="off"
      />
      {open && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded shadow-md max-h-48 overflow-y-auto">
          {results.map(r => (
            <li
              key={r.id}
              onMouseDown={() => handleSelect(r)}
              className="px-3 py-2 text-sm text-black cursor-pointer hover:bg-gray-100"
            >
              {r.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
