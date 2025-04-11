import { requireAuth } from "@/lib/auth";
import Navigation from "@/components/Navigation";
import Link from "next/link";

export default async function Dashboard() {
  const user = await requireAuth();
  
  // Debug the user object to see what properties are available
  console.log("User object in dashboard:", JSON.stringify(user));
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Your Dashboard</h1>
          
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4">Welcome, {user.name}</h2>
            <div className="mb-4 p-4 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                You're logged in as <strong>{user.email}</strong>
              </p>
              
              {/* Add this debug info (can be removed in production) */}
              <div className="mt-2 p-2 bg-gray-100 text-xs font-mono">
                <p>Debug - Available user properties:</p>
                <p>{Object.keys(user).join(", ")}</p>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  href="/auth-status"
                  className="block p-3 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200"
                >
                  View Authentication Status
                </Link>
                <Link
                  href="/"
                  className="block p-3 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Your Activity</h2>
            <p className="text-gray-600 mb-4">
              This is a protected dashboard page that only authenticated users can access.
            </p>
            
            {user.role === 'admin' && (
              <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-md">
                <h3 className="text-lg font-medium text-purple-800 mb-2">Admin Controls</h3>
                <p className="text-purple-700 mb-2">
                  You have administrative privileges on this system.
                </p>
                <Link
                  href="/admin"
                  className="inline-block mt-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  Go to Admin Panel
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}