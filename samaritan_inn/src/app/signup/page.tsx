import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function SignupPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (user.role === 'admin') {
    redirect('/admin-forms');
  }

  redirect('/unauthorized');
}
