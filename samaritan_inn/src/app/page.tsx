'use client';

import React, { useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const HomePage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  // redirect unauthenticated users off the homepage
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/unauthorized');
    }
  }, [status, router]);

  // while loading session, render nothing
  if (status === 'loading') return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <div className="flex-grow bg-gray-100 p-4 flex flex-col items-center">
        {/* added only top padding here */}
        <div className="w-full max-w-4xl pt-4">
          
          {/* Welcome Section */}
          <div className="flex flex-col items-center text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-[#00167c] mb-6">
              Welcome to The Samaritan Inn
            </h1>
            <p className="text-xl text-[#231f20] max-w-2xl">
              A safe place providing shelter, support, and hope for those in need.
            </p>
          </div>

          {/* Quick Access Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="bg-white border-2 border-[#0caebb] rounded-lg p-6 text-center hover:shadow-lg transition duration-300">
              <div className="mb-4 flex justify-center">
                <svg width="120" height="120" viewBox="0 0 400 400">
                  <circle cx="200" cy="200" r="200" fill="#0caebb" />
                  <path d="M200 60V340" stroke="white" strokeWidth="24" />
                  <path d="M60 200H340" stroke="white" strokeWidth="24" />
                  <path d="M107.574 107.574L292.426 292.426" stroke="white" strokeWidth="24" />
                  <path d="M107.574 292.426L292.426 107.574" stroke="white" strokeWidth="24" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-[#00167c] mb-2">Announcements</h2>
              <p className="text-[#231f20] mb-4">Get caught up on lastest events!</p>
              <Link
                href="/announcements"
                className="inline-block bg-[#0caebb] text-white py-2 px-6 rounded-md hover:bg-[#29abe2] transition duration-300"
              >
                View
              </Link>
            </div>

            <div className="bg-white border-2 border-[#0caebb] rounded-lg p-6 text-center hover:shadow-lg transition duration-300">
              <div className="mb-4 flex justify-center">
                <svg width="120" height="120" viewBox="0 0 400 400">
                  <circle cx="200" cy="200" r="200" fill="#0caebb" />
                  <circle cx="200" cy="200" r="100" stroke="white" strokeWidth="40" fill="none" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-[#00167c] mb-2">Schedule</h2>
              <p className="text-[#231f20] mb-4">Schedule/Update your curfew or connect with your assigned case worker</p>
              <Link
                href="/schedule"
                className="inline-block bg-[#0caebb] text-white py-2 px-6 rounded-md hover:bg-[#29abe2] transition duration-300"
              >
                Schedule
              </Link>
            </div>

            {/* Resources */}
            <div className="bg-white border-2 border-[#0caebb] rounded-lg p-6 text-center hover:shadow-lg transition duration-300">
              <div className="mb-4 flex justify-center">
                <svg width="120" height="120" viewBox="0 0 400 400">
                  <circle cx="200" cy="200" r="200" fill="#0caebb" />
                  <path d="M200 60V340" stroke="white" strokeWidth="24" />
                  <path d="M60 200H340" stroke="white" strokeWidth="24" />
                  <path d="M107.574 107.574L292.426 292.426" stroke="white" strokeWidth="24" />
                  <path d="M107.574 292.426L292.426 107.574" stroke="white" strokeWidth="24" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-[#00167c] mb-2">Resources</h2>
              <p className="text-[#231f20] mb-4">Access helpful community resources</p>
              <Link
                href="/Resources"
                className="inline-block bg-[#0caebb] text-white py-2 px-6 rounded-md hover:bg-[#29abe2] transition duration-300"
              >
                View
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
