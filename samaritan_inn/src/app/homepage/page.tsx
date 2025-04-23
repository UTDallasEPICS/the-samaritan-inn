'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

// HomePage functional component
const HomePage = () => {
  return (
    // Main container with full height and background color
    <div className="min-h-screen bg-[#F7F6F6] font-[Montserrat]">
      
      {/* Navigation Bar */}
      <nav className="bg-[#00167c] text-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          
          {/* Logo/Home Button */}
          <div className="flex items-center space-x-6">
            <Link href="/homepage" className="flex items-center">
              <span className="font-bold text-xl">The Samaritan Inn</span>
            </Link>
            
            {/* Navigation Buttons (visible on medium screens and larger) */}
            <div className="hidden md:flex space-x-4">
              {/* Home Button */}
              <Link href="/homepage" className="py-2 px-4 bg-[#0caebb] rounded-md hover:bg-[#29abe2] transition duration-300">
                Home
              </Link>
              {/* Curfew Scheduling Button */}
              <Link href="/curfew" className="py-2 px-4 hover:bg-[#29abe2] rounded-md transition duration-300">
                Pass Request
              </Link>
              {/* Case Worker Button */}
              <Link href="/caseworker" className="py-2 px-4 hover:bg-[#29abe2] rounded-md transition duration-300">
                Case Worker
              </Link>
            </div>
          </div>
          
          {/* Login/Signup Circle Button */}
          <div className="flex items-center">
            <Link href="/login" className="bg-white text-[#00167c] rounded-full w-12 h-12 flex items-center justify-center hover:bg-gray-100 transition duration-300">
              {/* User Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        
        {/* Welcome Section */}
        <div className="flex flex-col items-center justify-center text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-[#00167c] mb-6">
            Welcome to The Samaritan Inn
          </h1>
          <p className="text-xl text-[#231f20] max-w-2xl">
            A safe place providing shelter, support, and hope for those in need.
          </p>
        </div>

        {/* Quick Access Buttons */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          
          {/* Pass Request Button - with Career Development Logo */}
          <div className="bg-white border-2 border-[#0caebb] rounded-lg p-6 text-center hover:shadow-lg transition duration-300">
            <div className="mb-4 flex justify-center">
              {/* Career Development Logo SVG - Asterisk/Star */}
              <svg width="120" height="120" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
                <circle cx="200" cy="200" r="200" fill="#0caebb" />
                <path d="M200 60V340" stroke="white" strokeWidth="24" />
                <path d="M60 200H340" stroke="white" strokeWidth="24" />
                <path d="M107.574 107.574L292.426 292.426" stroke="white" strokeWidth="24" />
                <path d="M107.574 292.426L292.426 107.574" stroke="white" strokeWidth="24" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#00167c] mb-2">Pass Request</h2>
            <p className="text-[#231f20] mb-4">Schedule or update your curfew time</p>
            <Link href="/curfew" className="inline-block bg-[#0caebb] text-white py-2 px-6 rounded-md hover:bg-[#29abe2] transition duration-300">
              Schedule
            </Link>
          </div>
          
          {/* Case Worker Button - with Case Management Logo */}
          <div className="bg-white border-2 border-[#0caebb] rounded-lg p-6 text-center hover:shadow-lg transition duration-300">
            <div className="mb-4 flex justify-center">
              {/* Case Management Logo SVG - Ring Circle */}
              <svg width="120" height="120" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
                <circle cx="200" cy="200" r="200" fill="#0caebb" />
                <circle cx="200" cy="200" r="100" stroke="white" strokeWidth="40" fill="none" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#00167c] mb-2">Case Worker</h2>
            <p className="text-[#231f20] mb-4">Connect with your assigned case worker</p>
            <Link href="/caseworker" className="inline-block bg-[#0caebb] text-white py-2 px-6 rounded-md hover:bg-[#29abe2] transition duration-300">
              Contact
            </Link>
          </div>
          
          {/* Resources Button - with Career Development Logo */}
          <div className="bg-white border-2 border-[#0caebb] rounded-lg p-6 text-center hover:shadow-lg transition duration-300">
            <div className="mb-4 flex justify-center">
              {/* Career Development Logo SVG - Asterisk/Star */}
              <svg width="120" height="120" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
                <circle cx="200" cy="200" r="200" fill="#0caebb" />
                <path d="M200 60V340" stroke="white" strokeWidth="24" />
                <path d="M60 200H340" stroke="white" strokeWidth="24" />
                <path d="M107.574 107.574L292.426 292.426" stroke="white" strokeWidth="24" />
                <path d="M107.574 292.426L292.426 107.574" stroke="white" strokeWidth="24" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#00167c] mb-2">Resources</h2>
            <p className="text-[#231f20] mb-4">Access helpful community resources</p>
            <Link href="/Resources" className="inline-block bg-[#0caebb] text-white py-2 px-6 rounded-md hover:bg-[#29abe2] transition duration-300">
              View
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;