'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Navigation from '@/components/Navigation';
import WorkScheduleForm from '@/components/WorkScheduleForm';
import ExtendedCurfewForm from '@/components/ExtendedCurfewForm';
import PassRequestForm from '@/components/PassRequestForm';

type FormType = 'work-schedule' | 'extended-curfew' | 'pass-request' | null;

export default function PassFormPage() {
  const { data: session } = useSession();
  const [activeForm, setActiveForm] = useState<FormType>(null);

  const userName = session?.user?.name || 'Resident';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold text-[#00167c] text-center">Pass Home Page</h1>
        <p className="text-2xl text-[#00167c] text-center mt-2">Hi, {userName}</p>

        {/* Form cards */}  
        <div className="flex flex-wrap justify-center gap-8 mt-10">
          <button
            onClick={() => setActiveForm('work-schedule')}
            className="w-64 h-40 bg-white border-2 border-red-500 rounded-lg flex items-center justify-center hover:shadow-lg transition-shadow"
          >
            <span className="text-red-500 text-2xl font-bold text-center">Work<br />Schedule</span>
          </button>

          <button
            onClick={() => setActiveForm('extended-curfew')}
            className="w-64 h-40 bg-white border-2 border-green-500 rounded-lg flex items-center justify-center hover:shadow-lg transition-shadow"
          >
            <span className="text-green-500 text-2xl font-bold text-center">Extended<br />Curfew</span>
          </button>

          <button
            onClick={() => setActiveForm('pass-request')}
            className="w-64 h-40 bg-white border-2 border-blue-700 rounded-lg flex items-center justify-center hover:shadow-lg transition-shadow"
          >
            <span className="text-blue-700 text-2xl font-bold text-center">Pass<br />Request</span>
          </button>
        </div>

        <div className="flex justify-center mt-8">
          <button
            className="w-64 h-40 bg-white border-2 border-gray-400 rounded-lg flex items-center justify-center hover:shadow-lg transition-shadow"
          >
            <span className="text-gray-500 text-2xl font-bold text-center">History of<br />Previous Forms</span>
          </button>
        </div>

        {/* Modal overlay for forms */}
        {activeForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto p-6 relative">
              <button
                onClick={() => setActiveForm(null)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl font-bold"
              >
                &times;
              </button>

              {activeForm === 'work-schedule' && (
                <WorkScheduleForm
                  onClose={() => setActiveForm(null)}
                  residentName={userName}
                />
              )}

              {activeForm === 'extended-curfew' && (
                <ExtendedCurfewForm
                  onClose={() => setActiveForm(null)}
                  residentName={userName}
                />
              )}

              {activeForm === 'pass-request' && (
                <PassRequestForm
                  onClose={() => setActiveForm(null)}
                  residentName={userName}
                />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
