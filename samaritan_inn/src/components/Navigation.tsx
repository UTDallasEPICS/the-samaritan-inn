'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu when clicking outside or on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element;
      if (isMenuOpen && !target.closest('.mobile-nav-container')) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('click', handleClickOutside);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('click', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  // Helper to apply active styling to nav links
  const linkClass = (path: string) =>
    `px-3 py-2 rounded-md font-bold hover:bg-[#29abe2] transition-colors duration-200 ${pathname === path ? 'bg-[#29abe2]' : ''}`;

  const mobileLinkClass = (path: string) =>
    `block w-full text-left px-6 py-4 rounded-lg font-semibold text-lg text-white transition-all duration-200 hover:bg-[#29abe2] hover:transform hover:scale-105 ${
      pathname === path ? 'bg-[#29abe2] shadow-lg' : ''
    }`;

  return (
    <>
      <nav className="bg-[#00167c] text-white shadow-lg relative z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Brand title (static, no active highlight) */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold px-3 py-2 hover:text-[#29abe2] transition-colors duration-200">
                The Samaritan Inn
              </Link>
            </div>

            {/* Desktop navigation */}
            <div className="hidden lg:flex lg:items-center lg:space-x-6">
              <Link href="/" className={linkClass('/')}>Home</Link>
              <Link href="/schedule" className={linkClass('/schedule')}>Classes</Link>
              <Link href="/Resources" className={linkClass('/Resources')}>Resources</Link>
              <Link href="/announcements" className={linkClass('/announcements')}>Announcements</Link>
              {status === 'authenticated' ? (
                <>
                  <Link href="/profile" className={linkClass('/profile')}>Profile</Link>
                  <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className={`px-3 py-2 rounded-md font-bold transition-colors duration-200 ${pathname === '/login' ? 'bg-red-600' : 'bg-red-500 hover:bg-red-600'}`}
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
                    className={`px-3 py-2 rounded-md font-bold transition-colors duration-200 ${pathname === '/signup' ? 'bg-green-600' : 'bg-green-500 hover:bg-green-600'}`}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex lg:hidden items-center mobile-nav-container">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-[#29abe2] focus:outline-none focus:ring-2 focus:ring-[#29abe2] transition-all duration-200 ${
                  isMenuOpen ? 'bg-[#29abe2] rotate-90' : ''
                }`}
                aria-expanded={isMenuOpen}
                aria-label="Toggle navigation menu"
              >
                <svg
                  className={`h-6 w-6 transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`}
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
      </nav>

      {/* Mobile overlay and menu */}
      {isMenuOpen && (
        <>
          {/* Backdrop overlay */}
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden animate-fadeIn" />
          
          {/* Mobile navigation panel */}
          <div className="mobile-nav-container fixed top-16 right-0 h-[calc(100vh-4rem)] w-80 max-w-[85vw] bg-[#00167c] shadow-2xl z-50 lg:hidden transform animate-slideIn">
            <div className="flex flex-col h-full">
              {/* Navigation header */}
              <div className="px-6 py-4 border-b border-[#29abe2]/30">
                <h2 className="text-xl font-bold text-white">Navigation</h2>
              </div>

              {/* Scrollable navigation content */}
              <div className="flex-1 overflow-y-auto py-4">
                <div className="space-y-2 px-4">
                  <Link 
                    href="/" 
                    className={mobileLinkClass('/')} 
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Home
                  </Link>
                  <Link 
                    href="/schedule" 
                    className={mobileLinkClass('/schedule')} 
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Classes
                  </Link>
                  <Link 
                    href="/Resources" 
                    className={mobileLinkClass('/Resources')} 
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Resources
                  </Link>
                  <Link 
                    href="/announcements" 
                    className={mobileLinkClass('/announcements')} 
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Announcements
                  </Link>
                  
                  {/* Divider */}
                  <div className="border-t border-[#29abe2]/30 my-4" />
                  
                  {status === 'authenticated' ? (
                    <>
                      <Link 
                        href="/profile" 
                        className={mobileLinkClass('/profile')} 
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          signOut({ callbackUrl: '/login' });
                        }}
                        className="block w-full text-left px-6 py-4 rounded-lg bg-red-500 hover:bg-red-600 font-semibold text-lg transition-all duration-200 hover:transform hover:scale-105 shadow-lg"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link 
                        href="/profile" 
                        className={mobileLinkClass('/profile')} 
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <Link 
                        href="/login" 
                        className={mobileLinkClass('/login')} 
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Login
                      </Link>
                      <Link 
                        href="/signup" 
                        className="block w-full text-left px-6 py-4 rounded-lg bg-green-500 hover:bg-green-600 font-semibold text-lg transition-all duration-200 hover:transform hover:scale-105 shadow-lg"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>
              </div>

              {/* Footer with user info if authenticated */}
              {status === 'authenticated' && session?.user?.name && (
                <div className="px-6 py-4 border-t border-[#29abe2]/30 bg-[#001456]">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-[#29abe2] rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {session.user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">Welcome back!</p>
                      <p className="text-[#29abe2] text-sm">{session.user.name}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideIn {
          from { 
            transform: translateX(100%); 
            opacity: 0;
          }
          to { 
            transform: translateX(0); 
            opacity: 1;
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-slideIn {
          animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </>
  );
}
