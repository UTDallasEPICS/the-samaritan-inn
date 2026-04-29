import Link from 'next/link';
import { redirect } from 'next/navigation';
import Navigation from '@/components/Navigation';
import AdminUserCreateForm from '@/components/admin/AdminUserCreateForm';
import { getCurrentUser } from '@/lib/auth';

export default async function CreateUserPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (user.role !== 'admin') {
    redirect('/unauthorized');
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <div className="flex-grow bg-gray-100 p-4">
        <div className="mx-auto w-full max-w-4xl pt-4">
          <div className="mb-6">
            <Link href="/profile" className="text-sm font-semibold text-secondary hover:underline">
              Back to Profile
            </Link>
          </div>

          <div className="rounded-md bg-white p-6 shadow">
            <h1 className="text-3xl font-bold text-primary">Create User</h1>
            <p className="mt-2 text-sm text-gray-600">
              Admin-only account creation for residents, staff, case workers, and admins.
            </p>
          </div>

          <AdminUserCreateForm />
        </div>
      </div>
    </div>
  );
}
