'use client';

import React from 'react';
import Navigation from '@/components/Navigation';
import Link from 'next/link';

const ResourcesPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <div className="flex-grow bg-gray-100 p-4 flex flex-col items-center">
        <div className="w-full max-w-4xl p-6 bg-white shadow-md rounded-md">
          <h1 className="text-4xl font-bold mb-4 text-black">Community Resources</h1>
          <p className="text-lg mb-6 text-black">
            Here you can find helpful resources from The Samaritan Inn.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    </div>
  );
};

const ResourceCard = ({
  title,
  href,
  color,
}: {
  title: string;
  href: string;
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'orange';
}) => {
  const colorClasses = {
    blue: 'border-blue-600 hover:bg-blue-50',
    green: 'border-green-600 hover:bg-green-50',
    yellow: 'border-yellow-600 hover:bg-yellow-50',
    purple: 'border-purple-600 hover:bg-purple-50',
    orange: 'border-orange-600 hover:bg-orange-50',
  };
  const textColors = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
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
        <span className={textColors[color]}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </span>
      </div>
    </Link>
  );
};

export default ResourcesPage;
