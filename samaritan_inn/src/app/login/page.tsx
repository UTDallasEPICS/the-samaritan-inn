'use client';

import React, { FormEvent, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';

const Login = () => {
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
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
    } catch {
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <div className="flex-grow flex items-center justify-center bg-gray-100 p-4">
        <div className="w-full max-w-md p-6 bg-white shadow-md rounded-md">
          <h1 className="text-2xl font-bold mb-4 text-center text-black">
            Welcome to The Samaritan Inn
          </h1>

          <div className="mb-4 rounded border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            User accounts are created by admins only. Contact an admin if you need login credentials.
          </div>
          
          <form className="flex flex-col gap-y-4" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-black focus:outline-none focus:border-blue-500"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-black focus:outline-none focus:border-blue-500"
              required
            />
            {error && <p className="text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={isLoading}
              className="bg-[#29abe2] text-white py-2 rounded hover:bg-[#64bee3] disabled:bg-[#64bee3]"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
            <p className="text-center text-sm text-gray-600">
              Need an account? Ask an admin to create one for you.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
