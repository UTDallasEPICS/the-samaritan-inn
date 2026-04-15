'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import ViewTable from '@/components/admin/ViewSortedForms';
import Fetchforms from '@/components/Fetchforms';

interface PassForm {
  formType: string;
  name: string;
  submittedAt: string;
  status: string;
}

export default function PastFormsPage() {
  const [forms, setForms] = useState<PassForm[]>([]);
  const [loading, setLoading] = useState(true);

  return (
  <div className="min-h-screen flex flex-col">
    <Fetchforms setForms={setForms} setLoading={setLoading} />
    <Navigation />
    <div className="flex-grow bg-gray-100 p-4 flex flex-col items-center">
      <div className="w-full max-w-4xl pt-4">
        <h1 className="text-5xl md:text-6xl font-bold text-[#00167c] mb-6">
          Pending Forms
        </h1>
        <ViewTable forms={forms} isLoading={loading} filterBy="pending" />
      </div>
    </div>
  </div>
    );
}