'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="bg-blue-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-6">
            {/* Logo/Home Button */}
            <Link href="/" className="flex items-center">
              <span className="font-bold text-xl">The Samaritan Inn</span>
            </Link>
            
            {/* Navigation Buttons */}
            <div className="hidden md:flex space-x-4">
              <Link href="/" className="py-2 px-4 bg-blue-700 rounded-md hover:bg-blue-800 transition duration-300">
                Home
              </Link>
              <Link href="/curfew" className="py-2 px-4 hover:bg-blue-700 rounded-md transition duration-300">
                Scheduling Curfew
              </Link>
              <Link href="/caseworker" className="py-2 px-4 hover:bg-blue-700 rounded-md transition duration-300">
                Case Worker
              </Link>
            </div>
          </div>
          
          {/* Login/Signup Circle Button */}
          <div className="flex items-center">
            <Link href="/login" className="bg-white text-blue-600 rounded-full w-12 h-12 flex items-center justify-center hover:bg-gray-100 transition duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button className="text-white focus:outline-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation Menu (hidden by default) */}
        <div className="hidden md:hidden px-4 pb-4">
          <Link href="/" className="block py-2 px-4 text-white hover:bg-blue-700 rounded-md">
            Home
          </Link>
          <Link href="/curfew" className="block py-2 px-4 text-white hover:bg-blue-700 rounded-md">
            Scheduling Curfew
          </Link>
          <Link href="/caseworker" className="block py-2 px-4 text-white hover:bg-blue-700 rounded-md">
            Case Worker
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        {/* Welcome Section */}
        <div className="flex flex-col items-center justify-center text-center">
          <div className="bg-blue-600 rounded-full w-24 h-24 flex items-center justify-center mb-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-blue-600 mb-6">
            Welcome to The Samaritan Inn
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl">
            A safe place providing shelter, support, and hope for those in need.
          </p>
        </div>

        {/* Quick Access Buttons */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {/* Curfew Scheduling Button */}
          <div className="bg-white border-2 border-blue-600 rounded-lg p-6 text-center hover:shadow-lg transition duration-300">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-blue-600 mb-2">Curfew Scheduling</h2>
            <p className="text-gray-600 mb-4">Schedule or update your curfew time</p>
            <Link href="/curfew" className="inline-block bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition duration-300">
              Schedule
            </Link>
          </div>
          
          {/* Case Worker Button */}
          <div className="bg-white border-2 border-blue-600 rounded-lg p-6 text-center hover:shadow-lg transition duration-300">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-blue-600 mb-2">Case Worker</h2>
            <p className="text-gray-600 mb-4">Connect with your assigned case worker</p>
            <Link href="/caseworker" className="inline-block bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition duration-300">
              Contact
            </Link>
          </div>
          
          {/* Resources Button */}
          <div className="bg-white border-2 border-blue-600 rounded-lg p-6 text-center hover:shadow-lg transition duration-300">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-blue-600 mb-2">Resources</h2>
            <p className="text-gray-600 mb-4">Access helpful community resources</p>
            <Link href="/resources" className="inline-block bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition duration-300">
              View
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-blue-600 text-white py-6 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} The Samaritan Inn. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
