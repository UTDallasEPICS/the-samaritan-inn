'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';

export default function Profile() {
  const { data: session, status } = useSession();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <div className="flex-grow flex items-center justify-center bg-gray-100 p-4">
        <div className="w-full max-w-md p-6 bg-white shadow-md rounded-md">
          <h1 className="text-2xl font-bold mb-6 text-center text-black">Profile</h1>
          
          <div className="space-y-4">
            {status === 'loading' ? (
              <div className="text-center text-gray-500">Loading...</div>
            ) : status === 'authenticated' ? (
              <>
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                  <strong className="font-bold">Authenticated! </strong>
                  <p className="block sm:inline"> You are logged in!</p>
                </div>
                
                <div className="rounded-md bg-gray-50 p-4">
                  <h2 className="text-lg font-medium text-gray-900 mb-2">User Details</h2>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li><strong>Name:</strong> {session.user.name}</li>
                    <li><strong>Email:</strong> {session.user.email}</li>
                    <li><strong>Role:</strong> {session.user.role}</li>
                    <li><strong>User ID:</strong> {session.user.id}</li>
                  </ul>
                </div>
                
                <div className="flex justify-between">
                  <Link 
                    href="/"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Home
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative">
                  <strong className="font-bold">Not Authenticated</strong>
                  <p className="block sm:inline">You are not logged in.</p>
                </div>
                
                <div className="flex justify-between">
                  <Link 
                    href="/login"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Login
                  </Link>
                  <Link 
                    href="/signup"
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    Sign Up
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}