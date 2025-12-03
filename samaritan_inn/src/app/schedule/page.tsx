'use client';

import React, { useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Allow TypeScript to know about window.Calendly
declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (options: {
        url: string;
        parentElement: HTMLElement | null;
        prefill?: Record<string, unknown>;
        utm?: Record<string, unknown>;
      }) => void;
    };
  }
}

// 👉 Put your Calendly event link here
const CALENDLY_URL = 'https://calendly.com/navi82singh00/new-meeting';

export default function SchedulePage() {
  const { status } = useSession();
  const router = useRouter();

  // Redirect if unauthenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/unauthorized');
    }
  }, [status, router]);

  // Load Calendly script and initialize inline widget
  useEffect(() => {
    if (status !== 'authenticated') return;

    const initCalendly = () => {
      const container = document.getElementById('calendly-inline-widget');
      if (window.Calendly && container) {
        window.Calendly.initInlineWidget({
          url: CALENDLY_URL,
          parentElement: container,
          prefill: {},
          utm: {},
        });
      }
    };

    // Reuse script if it's already on the page
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://assets.calendly.com/assets/external/widget.js"]'
    );

    if (existingScript) {
      if (window.Calendly) {
        initCalendly();
      } else {
        existingScript.addEventListener('load', initCalendly);
      }
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    script.onload = initCalendly;
    document.body.appendChild(script);

    return () => {
      const container = document.getElementById('calendly-inline-widget');
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [status]);

  if (status === 'loading') return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <div className="flex-grow flex flex-col items-center bg-gray-100 p-4">
        <div
          className="w-full max-w-5xl p-8 bg-white shadow-md rounded-md overflow-hidden"
          style={{ height: '760px' }}
        >
          <h1 className="text-2xl font-semibold mb-6 text-black">Classes</h1>

          {/* Calendly Embed */}
          <div className="w-full h-full relative">
            <div
              className="absolute top-0 left-0"
              style={{
                transform: 'scale(0.85)',
                transformOrigin: 'top left',
                width: `${100 / 0.85}%`,
              }}
            >
              <div
                id="calendly-inline-widget"
                style={{
                  minWidth: '320px',
                  height: '700px',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
