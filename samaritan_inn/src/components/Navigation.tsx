'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export default function Navigation() {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Helper to apply active styling to nav links
  const linkClass = (path: string, mobile = false) =>
    `${mobile ? 'block w-full' : ''} px-3 py-2 rounded-md font-bold hover:bg-[#29abe2] ${pathname === path ? 'bg-[#29abe2]' : ''}`;

  // Close the profile dropdown when clicking outside of it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogoutConfirm = () => {
    setShowLogoutConfirm(false);
    signOut({ callbackUrl: '/auth/login' });
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
            <Link href="/classes" className={linkClass('/classes')}>Classes</Link>
            <Link href="/resources" className={linkClass('/resources')}>Resources</Link>
            <Link href="/announcements" className={linkClass('/announcements')}>Announcements</Link>
            <Link href="/user-pass-form" className={linkClass('/user-pass-form')}>Pass</Link>
            <Link href="/appointments/my-events" className={linkClass('/appointments/my-events')}>Appointments</Link>
            {status !== 'authenticated' && (
              <Link href="/auth/login" className={linkClass('/auth/login')}>Login</Link>
            )}

            {/* Profile icon — pushed to the far right, separated from the main nav links */}
            <div className="ml-4 md:ml-6 lg:ml-8 pl-4 md:pl-6 border-l border-white/20">
              {status === 'authenticated' ? (
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                    aria-label="Profile menu"
                    className={`p-2 rounded-full hover:bg-[#29abe2] flex items-center justify-center ${pathname === '/profile' ? 'bg-[#29abe2]' : ''}`}
                  >
                    <svg
                      className="h-6 w-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </button>

                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 text-gray-800">
                      <Link
                        href="/profile"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="block px-4 py-2 font-semibold hover:bg-gray-100"
                      >
                        View Profile
                      </Link>
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          setShowLogoutConfirm(true);
                        }}
                        className="block w-full text-left px-4 py-2 font-semibold text-red-600 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/profile" aria-label="Profile" className="p-2 rounded-full hover:bg-[#29abe2] flex items-center justify-center">
                  <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </Link>
              )}
            </div>
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
            <Link href="/classes" className={linkClass('/classes', true)} onClick={() => setIsMenuOpen(false)}>Classes</Link>
            <Link href="/resources" className={linkClass('/resources', true)} onClick={()=> setIsMenuOpen(false)}>Resources</Link>
            <Link href="/announcements" className={linkClass('/announcements', true)} onClick={() => setIsMenuOpen(false)}>Announcements</Link>
            <Link href="/appointments/my-events" className={linkClass('/appointments/my-events', true)} onClick={() => setIsMenuOpen(false)}>Schedule Event</Link>
            <Link href="/user-pass-form" className={linkClass('/user-pass-form', true)} onClick={() => setIsMenuOpen(false)}>Pass</Link>
            {status === 'authenticated' ? (
              <>
                <Link
                  href="/profile"
                  className={`${linkClass('/profile', true)} flex items-center gap-2`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile
                </Link>
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
                <Link
                  href="/profile"
                  className={`${linkClass('/profile', true)} flex items-center gap-2`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile
                </Link>
                <Link href="/auth/login" className={linkClass('/auth/login', true)} onClick={() => setIsMenuOpen(false)}>Login</Link>
                {/* <Link href="/auth/signup" className={`block w-full text-left px-3 py-2 rounded-md font-bold bg-green-500 hover:bg-green-600`} onClick={() => setIsMenuOpen(false)}>Sign Up</Link> */}
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
              onClick={() => { setShowLogoutConfirm(false); signOut({ callbackUrl: '/auth/login' }); }}
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