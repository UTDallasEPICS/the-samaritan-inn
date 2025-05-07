'use client';

import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

type FormType = 'caseworker' | 'curfew';

const calendlyLinks: Record<FormType, string> = {
  caseworker: 'https://calendly.com/anbusiness04/caseworker',
  curfew: 'https://calendly.com/anbusiness04/curfew',
};

export default function SchedulePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [formType, setFormType] = useState<FormType>('caseworker');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // Redirect if unauthenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/unauthorized');
    }
  }, [status, router]);

  // Load Calendly script whenever formType changes
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [formType]);

  if (status === 'loading') return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <div className="flex-grow flex flex-col items-center bg-gray-100 p-4">
        <div
          className="w-full max-w-5xl p-8 bg-white shadow-md rounded-md overflow-hidden"
          style={{ height: '760px' }} // adjust as needed
        >
          {/* Form selector */}
          <div className="flex justify-between items-center mb-6">
            <Button
              onClick={e => setAnchorEl(e.currentTarget)}
              endIcon={<ExpandMoreIcon />}
              sx={{ fontSize: '1.25rem' }}
            >
              {formType === 'caseworker' ? 'Caseworker' : 'Curfew'}
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={() => setAnchorEl(null)}
            >
              <MenuItem
                onClick={() => {
                  setFormType('caseworker');
                  setAnchorEl(null);
                }}
              >
                Caseworker
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setFormType('curfew');
                  setAnchorEl(null);
                }}
              >
                Curfew
              </MenuItem>
            </Menu>
          </div>

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
                key={formType}
                className="calendly-inline-widget"
                data-url={calendlyLinks[formType]}
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
