'use client';

import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import LandingCalendar from '@/components/LandingCalendar';
import BackgroundBubbles from '@/components/BackgroundBubbles';
// import InFlowButton from '@/components/inFlowButton';

// Define the announcement data returned by the API
interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  date: string;
}

const HomePage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Store announcements fetched from the database
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  // Fetch existing announcements for the landing calendar
  useEffect(() => {
    fetch('/api/announcements')
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch announcements');
        }
        return res.json();
      })
      .then((data: Announcement[]) => setAnnouncements(data))
      .catch(console.error);
  }, []);

  // Redirect unauthenticated users off the homepage
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/unauthorized');
    }
  }, [status, router]);

  // While loading session, render nothing
  if (status === 'loading') return null;

  return (
    <div className="min-h-screen flex flex-col">

      <Navigation />

      <div className="flex-grow bg-gray-100 p-4 flex flex-col items-center">

        <BackgroundBubbles />

        {/* Welcome Section */}
        <div className="relative z-10 w-full max-w-4xl pt-4">
          <div className="flex flex-col items-center text-center mb-2">
            <h1 className="text-5xl md:text-6xl font-bold text-[#00167c] mb-6">
              Welcome to The Samaritan Inn
            </h1>
            <p className="text-xl text-[#231f20] max-w-2xl">
              A safe place providing shelter, support, and hope for those in need.
            </p>
          </div>

          <div className="flex justify-center w-full my-2">
            <button
              type="button"
              onClick={() => {
                window.open(process.env.NEXT_PUBLIC_INFLOW_URL, '_blank');
              }}
              style={{
                width: '270.5px',
                height: '48px',
                minWidth: 0,
                padding: '3.5px 8.7px',
                gap: '7px',
                borderRadius: '4.4px',
                boxSizing: 'border-box',
              }}
              className="
              flex items-center justify-between
              overflow-hidden
              border-2 border-[#f9a51a]
              bg-[#fff3df]
              transition-colors duration-200
              hover:bg-[#ffffff]
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-[#000000]
              "
            >
              <span
                style={{
                  fontSize: '15.7px',
                  lineHeight: 1,
                }}
                className="whitespace-nowrap font-semibold tracking-tight text-[#f9a51a]"
              >
                Navigate to inFlow
              </span>

              <span
                style={{
                  width: '38.4px',
                  height: '38.4px',
                  minWidth: '38.4px',
                  borderRadius: '3.5px',
                }}
                className="flex shrink-0 items-center justify-center overflow-hidden bg-[#f9a51a]"
              >
                <img
                  src="/inflow.png"
                  alt="inFlow logo"
                  width={38}
                  height={38}
                  className="h-full w-full object-contain"
                />
              </span>
            </button>
          </div>

          {/* Quick Access Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Appointments */}
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
              <h2 className="text-xl font-bold text-[#00167c] mb-2">
                Appointments
              </h2>
              <p className="text-[#231f20] mb-4">
                View and schedule appointments!
              </p>
              <Link
                href="/appointments/my-events"
                className="inline-block bg-[#0caebb] text-white py-2 px-6 rounded-md hover:bg-[#29abe2] transition duration-300"
              >
                View
              </Link>
            </div>

            {/* Classes */}
            <div className="bg-white border-2 border-[#0caebb] rounded-lg p-6 text-center hover:shadow-lg transition duration-300">
              <div className="mb-4 flex justify-center">
                <svg width="120" height="120" viewBox="0 0 400 400">
                  <circle cx="200" cy="200" r="200" fill="#0caebb" />
                  <circle
                    cx="200"
                    cy="200"
                    r="100"
                    stroke="white"
                    strokeWidth="40"
                    fill="none"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-[#00167c] mb-2">
                Classes
              </h2>
              <p className="text-[#231f20] mb-4">
                Browse Classes, view details, and schedule sessions!
              </p>
              <Link
                href="/classes"
                className="inline-block bg-[#0caebb] text-white py-2 px-6 rounded-md hover:bg-[#29abe2] transition duration-300"
              >
                Classes
              </Link>
            </div>

            {/* Pass Forms */}
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
              <h2 className="text-xl font-bold text-[#00167c] mb-2">
                Pass Forms
              </h2>
              <p className="text-[#231f20] mb-4">
                Access all of your active pass forms!
              </p>
              <Link
                href="/user-pass-form"
                className="inline-block bg-[#0caebb] text-white py-2 px-6 rounded-md hover:bg-[#29abe2] transition duration-300"
              >
                View
              </Link>
            </div>

          </div>
        </div>

        {/* Calendar */}
        <div className="relative z-10 w-full flex justify-center mt-8">
          <div className="w-full max-w-4xl mx-auto">
            <LandingCalendar
              announcements={announcements.map(a => ({
                id: a.id,
                title: a.title,
                content: a.content,
                date: a.date || a.createdAt?.slice(0, 10),
              }))}
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default HomePage;