'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  // Helper to apply active styling to nav links
  const linkClass = (path: string) =>
    `px-3 py-2 rounded-md font-bold hover:bg-[#29abe2] ${pathname === path ? 'bg-[#29abe2]' : ''}`;

  return (
    <nav className="bg-[#00167c] text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand title (static, no active highlight) */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-xl font-bold px-3 py-2">
              The Samaritan Inn
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            <Link href="/" className={linkClass('/')}>Home</Link>
            <Link href="/schedule" className={linkClass('/schedule')}>Schedule</Link>
            <Link href="/curfew" className={linkClass('/curfew')}>Curfew</Link>
            <Link href="/Resources" className={linkClass('/Resources')}>Resources</Link>
            <Link href="/announcements" className={linkClass('/announcements')}>Announcements</Link>
            {status === 'authenticated' ? (
              <>
                <Link href="/profile" className={linkClass('/profile')}>Profile</Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className={`px-3 py-2 rounded-md font-bold ${pathname === '/login' ? 'bg-red-600' : 'bg-red-500 hover:bg-red-600'}`}
                >
                  Sign Out
                </button>
                <div className="px-3 py-2">
                  <span className="text-sm font-bold">Hi, {session.user.name}</span>
                </div>
              </>
            ) : (
              <>
                <Link href="/profile" className={linkClass('/profile')}>Profile</Link>
                <Link href="/login" className={linkClass('/login')}>Login</Link>
                <Link
                  href="/signup"
                  className={`px-3 py-2 rounded-md font-bold ${pathname === '/signup' ? 'bg-green-600' : 'bg-green-500 hover:bg-green-600'}`}
                >
                  Sign Up
                </Link>
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
          <div className="px-2 pt-2 pb-3 space-y-2 sm:px-3">
            <Link href="/" className={linkClass('/')} onClick={() => setIsMenuOpen(false)}>Home</Link>
            <Link href="/schedule" className={linkClass('/schedule')} onClick={() => setIsMenuOpen(false)}>Schedule</Link>
            <Link href="/Resources" className={linkClass('/Resources')} onClick={() => setIsMenuOpen(false)}>Resources</Link>
            <Link href="/announcements" className={linkClass('/announcements')} onClick={() => setIsMenuOpen(false)}>Announcements</Link>
            {status === 'authenticated' ? (
              <>
                <Link href="/profile" className={linkClass('/profile')} onClick={() => setIsMenuOpen(false)}>Profile</Link>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    signOut({ callbackUrl: '/login' });
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md bg-red-500 hover:bg-red-600 font-bold"
                >
                  Sign Out
                </button>
                <div className="px-3 py-2 border-t border-blue-700 mt-2 pt-2">
                  <span className="text-sm font-bold">Logged in as: {session.user.name}</span>
                </div>
              </>
            ) : (
              <>
                <Link href="/profile" className={linkClass('/profile')} onClick={() => setIsMenuOpen(false)}>Profile</Link>
                <Link href="/login" className={linkClass('/login')} onClick={() => setIsMenuOpen(false)}>Login</Link>
                <Link href="/signup" className={linkClass('/signup')} onClick={() => setIsMenuOpen(false)}>Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
