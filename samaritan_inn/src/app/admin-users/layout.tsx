import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { can } from '@/lib/permissions';

// Server-side guard for /admin-users and everything under it.
export default async function AdminUsersLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect('/auth/login');
  if (!can(session.user.role, 'MANAGE_USERS')) redirect('/');

  return <>{children}</>;
}
