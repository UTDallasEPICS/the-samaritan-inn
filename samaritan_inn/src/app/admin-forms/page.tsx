'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

import Navigation from '@/components/Navigation';

export default function AdminPassFormPage() {
  const { data: session } = useSession();
  
  return (
    <>
      <Navigation />
      <main>
        {/* admin content */}
      </main>
    </>
  );
}