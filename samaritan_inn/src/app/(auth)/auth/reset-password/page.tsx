'use client';

import React, { FormEvent, Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Navigation from '@/components/shared/Navigation';

const ResetPassword = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const email = searchParams.get('email') ?? '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Something went wrong');

      router.push('/auth/login?reset=true');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    'border border-gray-300 rounded px-3 py-2 text-black focus:outline-none focus:border-blue-500';

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <div className="flex-grow flex items-center justify-center bg-gray-100 p-4">
        <div className="w-full max-w-md p-6 bg-white shadow-md rounded-md">
          <h1 className="text-2xl font-bold mb-4 text-center text-black">Choose a new password</h1>

          {!token || !email ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <p>
                This link is missing information.{' '}
                <Link href="/auth/forgot-password" className="underline">
                  Request a new one
                </Link>
                .
              </p>
            </div>
          ) : (
            <form className="flex flex-col gap-y-4" onSubmit={handleSubmit}>
              <p className="text-sm text-gray-600">Setting a new password for {email}.</p>
              <input
                type="password"
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className={inputClass}
                required
              />
              <p className="text-xs text-gray-500">Password must be at least 8 characters long.</p>
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className={inputClass}
                required
              />
              {error && (
                <p className="text-red-500">
                  {error}{' '}
                  {error.includes('expired') && (
                    <Link href="/auth/forgot-password" className="underline">
                      Request a new link
                    </Link>
                  )}
                </p>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="bg-[#29abe2] text-white py-2 rounded hover:bg-[#64bee3] disabled:bg-[#64bee3]"
              >
                {isLoading ? 'Saving...' : 'Save new password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

// useSearchParams needs a Suspense boundary or `next build` fails to prerender.
export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPassword />
    </Suspense>
  );
}
