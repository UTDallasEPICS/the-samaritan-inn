'use client';

import Navigation from '@/components/Navigation';
import { ViewSortedFormsPage } from '@/components/admin/ViewSortedForms';

export default function PendingFormsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <div className="flex-grow bg-gray-100 p-4 flex flex-col items-center">
        <div className="w-full max-w-4xl pt-4">
          <h1 className="text-5xl md:text-6xl font-bold text-[#00167c] mb-6">
            Past Forms
          </h1>
          <ViewSortedFormsPage filterBy="evaluated" />
        </div>
      </div>
    </div>
  );
}