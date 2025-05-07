'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';

export default function Navigation() {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold">
                The Samaritan Inn
              </Link>
            </div>
          </div>
          
          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link href="/" className="px-3 py-2 rounded-md hover:bg-blue-700">
              Home
            </Link>
            
            {status === 'authenticated' ? (
              <>
                <Link href="/dashboard" className="px-3 py-2 rounded-md hover:bg-blue-700">
                  Dashboard
                </Link>
                <Link href="/auth-status" className="px-3 py-2 rounded-md hover:bg-blue-700">
                  Auth Status
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="px-3 py-2 rounded-md bg-red-500 hover:bg-red-600"
                >
                  Sign Out
                </button>
                <div className="px-3 py-2">
                  <span className="text-sm">Hi, {session.user.name}</span>
                </div>
              </>
            ) : (
              <>
                <Link href="/auth-status" className="px-3 py-2 rounded-md hover:bg-blue-700">
                  Auth Status
                </Link>
                <Link href="/translator" className="px-3 py-2 rounded-md hover:bg-blue-700">
                  Translator
                </Link>
                <Link href="/login" className="px-3 py-2 rounded-md hover:bg-blue-700">
                  Login
                </Link>
                <Link href="/signup" className="px-3 py-2 rounded-md bg-green-500 hover:bg-green-600">
                  Sign Up
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-blue-700 focus:outline-none"
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
            <Link 
              href="/"
              className="block px-3 py-2 rounded-md hover:bg-blue-700"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            
            {status === 'authenticated' ? (
              <>
                <Link 
                  href="/dashboard" 
                  className="block px-3 py-2 rounded-md hover:bg-blue-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  href="/auth-status" 
                  className="block px-3 py-2 rounded-md hover:bg-blue-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Auth Status
                </Link>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    signOut({ callbackUrl: '/login' });
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md bg-red-500 hover:bg-red-600"
                >
                  Sign Out
                </button>
                <div className="px-3 py-2 border-t border-blue-700 mt-2 pt-2">
                  <span className="text-sm">Logged in as: {session.user.name}</span>
                </div>
              </>
            ) : (
              <>
                <Link 
                  href="/auth-status" 
                  className="block px-3 py-2 rounded-md hover:bg-blue-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Auth Status
                </Link>
                <Link 
                  href="/login" 
                  className="block px-3 py-2 rounded-md hover:bg-blue-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  href="/signup" 
                  className="block px-3 py-2 rounded-md bg-green-500 hover:bg-green-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}