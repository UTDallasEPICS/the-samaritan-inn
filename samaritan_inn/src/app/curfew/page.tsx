'use client';

import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface CurfewRequest {
  id: number;
  name: string;
  timestamp: string;
}

export default function CurfewExtensionAdmin() {
  // 1️⃣ Session and router
  const { data: session, status } = useSession();
  const router = useRouter();

  // 2️⃣ State
  const [requests, setRequests] = useState<CurfewRequest[]>([
    { id: 1, name: 'Omar Akhter', timestamp: '11:39pm, 10/2' },
    { id: 2, name: 'Thomas Shepherd', timestamp: '3:47pm, 10/6' },
    { id: 3, name: 'Brandon Rich', timestamp: '8:23am, 10/7' },
    { id: 4, name: 'Roger Watson', timestamp: '12:56pm, 10/10' },
  ]);

  // 3️⃣ Derived role
  const isAdmin = session?.user?.role === 'admin';

  // 4️⃣ Redirect unauthenticated users
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/unauthorized');
    }
  }, [status, router]);

  // 5️⃣ Show loading while session is being fetched
  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  // 6️⃣ Non-admin users see a restricted access message
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-grow flex items-center justify-center bg-gray-100">
          <div className="bg-white shadow-md p-8 rounded-md text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Access Restricted
            </h2>
            <p className="text-gray-600">
              You do not have permission to view this page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 7️⃣ Admin handler
  const handleDecision = (id: number, accepted: boolean) => {
    alert(`${accepted ? 'Accepted' : 'Denied'} request ${id}`);
    setRequests((prev) => prev.filter((req) => req.id !== id));
  };

  // 8️⃣ Admin-only UI
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navigation />

      <main className="flex flex-col items-center justify-center flex-1 p-6">
        <h1 className="text-xl font-medium mb-6 text-[#000000]">
          Curfew Extension - Admin View
        </h1>

        <div className="bg-white border rounded-lg shadow-sm p-8 w-full max-w-2xl">
          {requests.map((req) => (
            <div
              key={req.id}
              className="flex items-center justify-between mb-4 last:mb-0"
            >
              <button
                onClick={() => alert(`Details for ${req.name}`)}
                className="flex-1 text-left bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded px-4 py-2 text-gray-700 mr-4 transition"
              >
                {req.name} — {req.timestamp}
              </button>

              <button
                onClick={() => handleDecision(req.id, true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded mr-2"
              >
                Accept
              </button>
              <button
                onClick={() => handleDecision(req.id, false)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
              >
                Deny
              </button>
            </div>
          ))}

          {requests.length === 0 && (
            <p className="text-center text-gray-500 mt-6">
              No pending requests.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
