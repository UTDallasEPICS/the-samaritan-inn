'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export default function Navigation() {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const pathname = usePathname();

  // Helper to apply active styling to nav links
  const linkClass = (path: string, mobile = false) =>
    `${mobile ? 'block w-full' : ''} px-3 py-2 rounded-md font-bold hover:bg-[#29abe2] ${pathname === path ? 'bg-[#29abe2]' : ''}`;

  const handleLogoutConfirm = () => {
    setShowLogoutConfirm(false);
    signOut({ callbackUrl: '/login' });
  };

  return (
    <>
    <nav className="bg-[#00167c] text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand logo (static, no active highlight) */}
          <div className="flex-shrink-0 flex items-center">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="The Samaritan Inn"
              width={1405}
              height={793}
              className="h-12 w-auto"
            />
          </Link>
        </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            <Link href="/" className={linkClass('/')}>Home</Link>
            <Link href="/schedule" className={linkClass('/schedule')}>Classes</Link>
            <Link href="/Resources" className={linkClass('/Resources')}>Resources</Link>
            <Link href="/announcements" className={linkClass('/announcements')}>Announcements</Link>
            <Link href="/pass-form" className={linkClass('/pass-form')}>Pass</Link>
            <Link href="/my-events" className={linkClass('/my-events')}>Appointments</Link>
            {status === 'authenticated' ? (
              <>
                <Link href="/profile" className={linkClass('/profile')}>Profile</Link>
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className={`px-3 py-2 rounded-md font-bold ${pathname === '/login' ? 'bg-red-600' : 'bg-red-500 hover:bg-red-600'}`}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/profile" className={linkClass('/profile')}>Profile</Link>
                <Link href="/login" className={linkClass('/login')}>Login</Link>
                {/* <Link
                  href="/signup"
                  className={`px-3 py-2 rounded-md font-bold ${pathname === '/signup' ? 'bg-green-600' : 'bg-green-500 hover:bg-green-600'}`}
                >
                  Sign Up
                </Link> */}
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-[#29abe2] focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/" className={linkClass('/', true)} onClick={() => setIsMenuOpen(false)}>Home</Link>
            <Link href="/schedule" className={linkClass('/schedule', true)} onClick={() => setIsMenuOpen(false)}>Classes</Link>
            <Link href="/Resources" className={linkClass('/Resources', true)} onClick={() => setIsMenuOpen(false)}>Resources</Link>
            <Link href="/announcements" className={linkClass('/announcements', true)} onClick={() => setIsMenuOpen(false)}>Announcements</Link>
            <Link href="/my-events" className={linkClass('/my-events', true)} onClick={() => setIsMenuOpen(false)}>Schedule Event</Link>
            <Link href="/pass-form" className={linkClass('/pass-form', true)} onClick={() => setIsMenuOpen(false)}>Pass</Link>
            {status === 'authenticated' ? (
              <>
                <Link href="/profile" className={linkClass('/profile', true)} onClick={() => setIsMenuOpen(false)}>Profile</Link>
                <button
                  onClick={() => { setIsMenuOpen(false); setShowLogoutConfirm(true); }}
                  className="block w-full text-left px-3 py-2 rounded-md bg-red-500 hover:bg-red-600 font-bold"
                >
                  Logout
                </button>
                <div className="px-3 py-2 border-t border-blue-700 mt-2 pt-2">
                  <span className="text-sm font-bold">Logged in as: {session.user.name}</span>
                </div>
              </>
            ) : (
              <>
                <Link href="/profile" className={linkClass('/profile', true)} onClick={() => setIsMenuOpen(false)}>Profile</Link>
                <Link href="/login" className={linkClass('/login', true)} onClick={() => setIsMenuOpen(false)}>Login</Link>
                {/* <Link href="/signup" className={`block w-full text-left px-3 py-2 rounded-md font-bold bg-green-500 hover:bg-green-600`} onClick={() => setIsMenuOpen(false)}>Sign Up</Link> */}
              </>
            )}
          </div>
        </div>
      )}
    </nav>

    {showLogoutConfirm && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-80">
          <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Confirm Logout</h2>
          <p className="text-gray-600 mb-6 text-center">Are you sure you want to logout?</p>
          <div className="flex gap-4">
            <button
              onClick={() => setShowLogoutConfirm(false)}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 font-semibold rounded-md hover:bg-gray-400 transition"
            >
              No
            </button>
            <button
              onClick={() => { setShowLogoutConfirm(false); signOut({ callbackUrl: '/login' }); }}
              className="flex-1 px-4 py-2 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 transition"
            >
              Yes
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
