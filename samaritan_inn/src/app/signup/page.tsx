import React from 'react';

const Signup = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md p-6 bg-white shadow-md rounded-md">
        <h1 className="text-2xl font-bold mb-4 text-center text-black">
          Welcome to The Samaritan Inn
        </h1>
        <form className="flex flex-col gap-y-4">
          <input
            type="email"
            placeholder="Email (ex. john@email.com)"
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
          />
          <input
            type="password"
            placeholder="Enter a password"
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
          />
          <input
            type="password"
            placeholder="Confirm your password"
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            Create an account
          </button>
          <p className="text-center text-black">
            Already have an account?{' '}
            <a href="/login" className="text-blue-500 hover:underline">
              Log in
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;