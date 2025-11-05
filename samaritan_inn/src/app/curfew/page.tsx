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
  // Authentication and router
  const { data: session, status } = useSession();
  const router = useRouter();

  // State keeping track of pending requests
  const [requests, setRequests] = useState<CurfewRequest[]>([
    { id: 1, name: 'Omar Akhter', timestamp: '11:39pm, 10/2' },
    { id: 2, name: 'Thomas Shepherd', timestamp: '3:47pm, 10/6' },
    { id: 3, name: 'Brandon Rich', timestamp: '8:23am, 10/7' },
    { id: 4, name: 'Roger Watson', timestamp: '12:56pm, 10/10' },
  ]);

  // Derived user role
  const isAdmin = session?.user?.role === 'admin';

  // Redirecting unauthorized users
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/unauthorized');
    }
  }, [status, router]);

  // Show loading while session is loading
  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  // Message for non-admin users
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

  // Handler for admin decision
  const handleDecision = (id: number, name: string, accepted: boolean) => {
    alert(`${accepted ? 'Accepted request from' : 'Denied request from'} ${name}`);
    setRequests((prev) => prev.filter((req) => req.id !== id));
  };

  // Admin-only UI
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
              className="flex items-center justify-center mb-4 last:mb-0"
            >
              <button
                onClick={() => window.open("/public/pdfs/Pass-and-Curfew-requests.pdf")}
                className="flex-1 text-center bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded px-4 py-2 text-gray-700 transition"
              >
                {req.name} — {req.timestamp}
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
