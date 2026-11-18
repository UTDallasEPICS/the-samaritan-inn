'use client';

import React, { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import CalendlyLinkSetting from '@/components/classes/CalendlyLinkSetting';
import { can } from '@/lib/permissions';
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

export default function SchedulePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const canManageClasses = can(session?.user?.role, 'MANAGE_CLASSES');

  // The Calendly link is stored in the database so admins can change it on
  // this page (see CalendlyLinkSetting); null until it has loaded.
  const [calendlyUrl, setCalendlyUrl] = useState<string | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);

  // Redirect if unauthenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/unauthorized');
    }
  }, [status, router]);

  // Load the current Calendly link
  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/classes/calendly')
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data: { url: string }) => setCalendlyUrl(data.url))
      .catch(() => setLinkError('Unable to load the class calendar. Please try again later.'));
  }, [status]);

  // Load Calendly script and initialize inline widget (again whenever an
  // admin saves a new link)
  useEffect(() => {
    if (status !== 'authenticated' || !calendlyUrl) return;

    const initCalendly = () => {
      const container = document.getElementById('calendly-inline-widget');
      if (window.Calendly && container) {
        container.innerHTML = '';
        window.Calendly.initInlineWidget({
          url: calendlyUrl,
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
  }, [status, calendlyUrl]);

  if (status === 'loading') return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <div className="flex-grow flex flex-col items-center bg-gray-100 p-4">
        <div className="w-full max-w-5xl bg-white shadow-md rounded-md overflow-hidden">
          <div className="p-4 sm:p-8">
            <h1 className="text-2xl font-semibold mb-4 text-black">Classes</h1>
            {canManageClasses && calendlyUrl && (
              <CalendlyLinkSetting url={calendlyUrl} onSaved={setCalendlyUrl} />
            )}
            {linkError && <p className="text-red-600">{linkError}</p>}
          </div>
          <div
            id="calendly-inline-widget"
            style={{ minWidth: '320px', height: '700px' }}
          />
        </div>
      </div>
    </div>
  );
}
