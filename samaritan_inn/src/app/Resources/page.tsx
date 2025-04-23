'use client';

import React from 'react';
import Link from 'next/link';

const ResourcesPage = () => {
  return (
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
              <Link href="/homepage" className="py-2 px-4 hover:bg-[#29abe2] rounded-md transition duration-300">
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
              {/* Resources Button - Highlighted since we're on this page */}
              <Link href="/Resources" className="py-2 px-4 bg-[#0caebb] rounded-md hover:bg-[#29abe2] transition duration-300">
                Resources
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

      {/* Resources Content */}
      <div className="container mx-auto flex flex-col items-center justify-center p-8">
        <h1 className="text-4xl font-bold mb-8 text-[#000000]">Community Resources</h1>
        <p className="text-lg mb-8 text-black">Here you can find helpful resources from The Samaritan Inn.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
          <ResourceCard 
            title="Get Help" 
            href="https://saminn.org/get-help/" 
            color="blue"
          />
          <ResourceCard 
            title="About Us" 
            href="https://saminn.org/about-us/" 
            color="green"
          />
          <ResourceCard 
            title="Donate" 
            href="https://saminn.org/donate/" 
            color="yellow"
          />
          <ResourceCard 
            title="Events" 
            href="https://saminn.org/events/" 
            color="purple"
          />
          <ResourceCard 
            title="Volunteer" 
            href="https://saminn.org/volunteer/" 
            color="orange"
          />
        </div>
      </div>
    </div>
  );
};

// Resource Card Component
const ResourceCard = ({ title, href, color }) => {
  const colorClasses = {
    blue: "border-blue-600 hover:bg-blue-50",
    green: "border-green-600 hover:bg-green-50",
    yellow: "border-yellow-600 hover:bg-yellow-50",
    purple: "border-purple-600 hover:bg-purple-50",
    orange: "border-orange-600 hover:bg-orange-50"
  };
  
  const textColors = {
    blue: "text-blue-600",
    green: "text-green-600",
    yellow: "text-yellow-600",
    purple: "text-purple-600",
    orange: "text-orange-600"
  };

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`block p-6 bg-white rounded-lg shadow-md border-2 ${colorClasses[color]} transition duration-300`}
    >
      <h2 className={`text-xl font-semibold ${textColors[color]}`}>{title}</h2>
      <div className="mt-4 flex justify-end">
        <span className={`${textColors[color]}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </span>
      </div>
    </Link>
  );
};

export default ResourcesPage;