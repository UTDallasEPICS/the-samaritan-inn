'use client';

import React, { FormEvent, useState } from 'react';
import Link from 'next/link';
import Navigation from '@/components/shared/Navigation';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/password/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (response.status === 400) {
        setError('Enter a valid email address.');
      } else if (!response.ok) {
        throw new Error();
      } else {
        setSent(true);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <div className="flex-grow flex items-center justify-center bg-gray-100 p-4">
        <div className="w-full max-w-md p-6 bg-white shadow-md rounded-md">
          <h1 className="text-2xl font-bold mb-4 text-center text-black">Forgot your password?</h1>

          {sent ? (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              <p>
                If an account exists for {email}, we&apos;ve sent an email with a link to choose a
                new password. The link works for 1 hour.
              </p>
            </div>
          ) : (
            <form className="flex flex-col gap-y-4" onSubmit={handleSubmit}>
              <p className="text-sm text-gray-600">
                Enter your email and we&apos;ll send you a link to choose a new password.
              </p>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 text-black focus:outline-none focus:border-blue-500"
                required
              />
              {error && <p className="text-red-500">{error}</p>}
              <button
                type="submit"
                disabled={isLoading}
                className="bg-[#29abe2] text-white py-2 rounded hover:bg-[#64bee3] disabled:bg-[#64bee3]"
              >
                {isLoading ? 'Sending...' : 'Send reset link'}
              </button>
            </form>
          )}

          <p className="mt-4 text-center text-black">
            <Link href="/auth/login" className="text-blue-500 hover:underline">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
