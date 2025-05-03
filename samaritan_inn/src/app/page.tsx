import { getCurrentUser } from '@/lib/auth';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const Home = async () => {
  const posts = await prisma.post.findMany();
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#FFFEFE', fontFamily: 'Montserrat, sans-serif' }}>
      <div className="bg-[#00167c]">
        <Navigation />
      </div>
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-black">Welcome to The Samaritan Inn</h1>
          
          {user ? (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
              <p className="text-green-800">
                You are logged in as <strong>{user.name}</strong>.
                <Link href="/dashboard" className="text-[#00167c] hover:underline ml-2">
                  View your dashboard
                </Link>
              </p>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
              <p className="text-blue-800">
                Please{" "}
                <Link href="/login" className="text-[#04A8F3] hover:underline mx-1">
                  login
                </Link>{" "}
                or{" "}
                <Link href="/signup" className="text-[#04A8F3] hover:underline mx-1">
                  sign up
                </Link>{" "}
                to access all features.
              </p>
            </div>
          )}

          <h2 className="text-2xl font-semibold mb-4 text-black">Latest Announcements</h2>
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <ul className="divide-y divide-gray-200">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <li key={post.id} className="py-4">
                    <h3 className="text-lg font-medium">{post.name}</h3>
                  </li>
                ))
              ) : (
                <li className="py-4 text-gray-500">No announcements yet.</li>
              )}
            </ul>
          </div>

          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4 text-black">Quick Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/auth-status"
                className="block p-4 bg-[#00167c] text-white rounded-md hover:bg-[#001463] text-center"
              >
                Check Authentication Status
              </Link>
              {user ? (
                <Link
                  href="/dashboard"
                  className="block p-4 bg-green-500 text-white rounded-md hover:bg-green-600 text-center"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="block p-4 bg-[#00167c] text-white rounded-md hover:bg-[#001463] text-center"
                >
                  Login to Your Account
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>
      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto px-4">
          <p className="text-center">&copy; 2025 The Samaritan Inn. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;