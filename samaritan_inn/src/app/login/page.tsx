'use client';

import React, { FormEvent, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/Navigation';

const Login = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (response?.error) {
        setError('Invalid email or password');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFEFE] font-montserrat">
      <Navigation />
      <main className="container mx-auto px-4 py-8 max-w-md">
      <h1 className="text-3xl font-bold mb-6 text-center text-black">
  Welcome to The Samaritan Inn
</h1>


        {registered && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4 text-green-800">
            Account created successfully! Please log in.
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-4 border border-gray-300 rounded px-3 py-2 text-black focus:outline-none focus:border-[#00167c]"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-4 border border-gray-300 rounded px-3 py-2 text-black focus:outline-none focus:border-[#00167c]"
            required
          />
          {error && (
            <p className="text-red-600 mb-4">{error}</p>
          )}
          <button
            type="submit"
            className="w-full bg-[#00167c] text-white py-2 px-4 rounded hover:bg-blue-900"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-[#191E21]">
          New User?{' '}
          <Link href="/signup" className="text-[#04A8F3] hover:underline">
            Create an account
          </Link>
        </p>
      </main>
    </div>
  );
};

export default Login;
