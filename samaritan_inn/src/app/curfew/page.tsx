'use client';

import Navigation from '@/components/Navigation';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CurfewExtensionClient() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Allow resident or regular user
  const allowed =
    session?.user?.role === 'resident' || session?.user?.role === 'user';

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!allowed) {
    router.push('/unauthorized');
    return null;
  }

  // Form fields
  const [data, setData] = useState({
    caseWorker: 'Sarah Johnson',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    reason: '',
    signature: '',
  });

  function update(e: any) {
    setData({ ...data, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: any) {
    e.preventDefault();

    const res = await fetch('/api/curfew/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) return alert('Error submitting request');
    alert('Request submitted!');
  }

  return (
    <div className="min-h-screen bg-[#f4f4f4]">
      <Navigation />

      {/* Page container */}
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Title */}
        <h1 className="text-3xl font-bold mb-8 text-[#00167c]">
          Curfew Extension Request
        </h1>

        {/* White card EXACT like screenshot */}
        <div className="bg-white shadow-md rounded-lg p-10 border">

          {/* Section title */}
          <h2 className="text-xl font-semibold mb-6">Submit New Request</h2>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Caseworker */}
            <div>
              <label className="block font-medium mb-1">Case Worker *</label>
              <select
                name="caseWorker"
                value={data.caseWorker}
                onChange={update}
                className="w-full border rounded px-4 py-3"
              >
                <option>Sarah Johnson</option>
                <option>Michael Chen</option>
                <option>Amanda Reed</option>
              </select>
            </div>

            {/* Dates row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-medium mb-1">Start Date *</label>
                <input
                  type="date"
                  name="startDate"
                  value={data.startDate}
                  onChange={update}
                  className="w-full border rounded px-4 py-3"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">End Date *</label>
                <input
                  type="date"
                  name="endDate"
                  value={data.endDate}
                  onChange={update}
                  className="w-full border rounded px-4 py-3"
                />
              </div>
            </div>

            {/* Times row EXACT like screenshot */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-medium mb-1">Start Time *</label>
                <input
                  type="text"
                  name="startTime"
                  placeholder="7:00 PM"
                  value={data.startTime}
                  onChange={update}
                  className="w-full border rounded px-4 py-3"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">End Time *</label>
                <input
                  type="text"
                  name="endTime"
                  placeholder="9:00 PM"
                  value={data.endTime}
                  onChange={update}
                  className="w-full border rounded px-4 py-3"
                />
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block font-medium mb-1">Reason *</label>
              <input
                type="text"
                name="reason"
                placeholder="e.g., Medical appointment, Job interview"
                value={data.reason}
                onChange={update}
                className="w-full border rounded px-4 py-3"
              />
            </div>

            {/* Signature */}
            <div>
              <label className="block font-medium mb-1">
                Signature (Full Name) *
              </label>
              <input
                type="text"
                name="signature"
                placeholder="Type your full name"
                value={data.signature}
                onChange={update}
                className="w-full border rounded px-4 py-3"
              />
            </div>

            {/* Submit button — RIGHT aligned EXACTLY like screenshot */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="bg-[#00b5d8] hover:bg-[#009bbb] text-white px-6 py-3 rounded font-semibold"
              >
                Submit Request
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
