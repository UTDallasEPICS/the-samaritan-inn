import Link from "next/link";
import Navigation from "@/components/Navigation";

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <div className="flex-grow flex items-center justify-center bg-gray-100 p-4">
        <div className="w-full max-w-md p-6 bg-white shadow-md rounded-md text-center">
          <div className="mb-6 text-red-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold mb-4 text-red-600">Unauthorized Access</h1>
          <p className="mb-6 text-gray-700">
            You do not have permission to access this page.
          </p>
          <div className="flex justify-center space-x-4">
            <Link 
              href="/"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Return Home
            </Link>
            <Link 
              href="/profile"
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Check your Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}