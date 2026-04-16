'use client';
import { useState } from 'react';
import Fetchforms from '@/components/Fetchforms';

interface PassForm {
  formType: string;
  name: string;
  submittedAt: string;
  status: string;
}

interface FormTableProps {
    forms: PassForm[];
    isLoading: boolean;
    filterBy: 'pending' | 'evaluated';
}

function ViewTable({ forms, isLoading, filterBy }: FormTableProps) {
  const filtered = filterBy === 'pending' 
    ? forms.filter(f => f.status === 'PENDING')
    : forms.filter(f => f.status === 'APPROVED' || f.status === 'DENIED');

  if (isLoading) {
    return <p className="text-sm text-gray-400 py-2">Loading forms…</p>;
  }

  if (filtered.length === 0) {
    const emptyMessage = filterBy === 'pending' 
      ? 'No pending forms.' 
      : 'No evaluated forms.';
    return <p className="text-sm text-gray-400 py-2">{emptyMessage}</p>;
  }

  return (
  <table className="w-full text-sm border-collapse bg-white rounded-md overflow-hidden mt-2">
    <thead>
    <tr className="text-center border-b border-gray-200 text-gray-700">
        <th className="py-3 px-4">Name</th>
        <th className="py-3 px-4">Form Type</th>
        <th className="py-3 px-4">Submitted</th>
        <th className="py-3 px-4">Status</th>
    </tr>
    </thead>
    <tbody>
    {filtered.map((f, i) => (
        <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
        <td className="py-3 px-4 text-gray-700 text-center">{f.name}</td>
        <td className="py-3 px-4 text-gray-700 text-center">{f.formType}</td>
        <td className="py-3 px-4 text-gray-700 text-center">{new Date(f.submittedAt).toLocaleDateString()}</td>
        <td className="py-3 px-4 text-center">
            <span className={`px-2 py-1 rounded-full text-xs font-medium
            ${f.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                f.status === 'DENIED' ? 'bg-red-100 text-red-700' :
                'bg-yellow-100 text-yellow-700'}`}>
            {f.status}
            </span>
        </td>
        </tr>
    ))}
    </tbody>
    </table>
    )
}

function ViewSortedFormsPage({ filterBy }: { filterBy: 'pending' | 'evaluated' }) {
  const [forms, setForms] = useState<PassForm[]>([]);
  const [loading, setLoading] = useState(true);

  return (
    <>
      <Fetchforms setForms={setForms} setLoading={setLoading} />
      <ViewTable forms={forms} isLoading={loading} filterBy={filterBy} />
    </>
  );
}

export { ViewTable, ViewSortedFormsPage };