'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { can, ROLES, ROLE_LABELS, type Role } from '@/lib/permissions';

interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  emailVerified: string | null; // set the first time they create/reset a password from an emailed link
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const canManageUsers = can(session?.user?.role, 'MANAGE_USERS');

  useEffect(() => {
    if (status !== 'authenticated' || !canManageUsers) return;

    const getJson = (url: string) =>
      fetch(url).then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      });

    // The user list and each user's email-confirmed date come from separate endpoints.
    Promise.all([getJson('/api/users'), getJson('/api/admin-users/email-status')])
      .then(([list, confirmed]: [Omit<ManagedUser, 'emailVerified'>[], Record<string, string | null>]) =>
        setUsers(list.map(u => ({ ...u, emailVerified: confirmed[u.id] ?? null })))
      )
      .catch(() => setError('Failed to load users'))
      .finally(() => setLoading(false));
  }, [status, canManageUsers]);

  if (status === 'loading') return null;
  if (status === 'unauthenticated') {
    router.replace('/auth/login');
    return null;
  }
  if (!canManageUsers) {
    router.replace('/user-pass-form');
    return null;
  }

  const handleRoleChange = async (userId: string, newRole: Role) => {
    setSavingId(userId);
    setError(null);
    const previous = users;
    setUsers(prev => prev.map(u => (u.id === userId ? { ...u, role: newRole } : u)));

    try {
      const res = await fetch(`/api/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error);
      }
    } catch (err) {
      setUsers(previous);
      setError(err instanceof Error && err.message ? err.message : 'Failed to update role. Please try again.');
    } finally {
      setSavingId(null);
    }
  };

  const resendSetupEmail = async (user: ManagedUser) => {
    setSendingId(user.id);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch(`/api/admin-users/${user.id}/setup-email`, { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error);
      if (data.emailSent) {
        setNotice(`Setup email sent to ${user.email}. The new link works for 72 hours; earlier links no longer work.`);
      } else {
        setError(`Couldn't send email to ${user.email}. Check the email settings, or give them their temporary password.`);
      }
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : 'Failed to send setup email.');
    } finally {
      setSendingId(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <div className="flex-grow bg-gray-100 p-4 flex flex-col items-center">
        <div className="w-full max-w-4xl pt-4">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6 text-center">
            Manage Users
          </h1>

          <div className="mb-4 flex justify-end">
            <Link
              href="/admin-users/create"
              className="rounded bg-[#5cc26b] px-4 py-2 text-white hover:opacity-90"
            >
              Add resident
            </Link>
          </div>

          {error && (
            <div className="mb-4 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          )}
          {notice && (
            <div role="status" className="mb-4 rounded-md border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-900">
              {notice}
            </div>
          )}

          <div className="bg-white rounded-md shadow overflow-hidden">
            {loading ? (
              <p className="text-sm text-gray-400 py-6 text-center">Loading users…</p>
            ) : users.length === 0 ? (
              <p className="text-sm text-gray-400 py-6 text-center">No users found.</p>
            ) : (
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-100">
                  <tr className="text-left border-b border-gray-200 text-gray-700">
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Email confirmed</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-700">{u.name}</td>
                      <td className="py-3 px-4 text-gray-700">{u.email}</td>
                      <td className="py-3 px-4">
                        <select
                          value={u.role}
                          // Admins can't change their own role, so the site always keeps an admin.
                          disabled={savingId === u.id || u.id === session?.user?.id}
                          title={u.id === session?.user?.id ? "You can't change your own role" : undefined}
                          onChange={e => handleRoleChange(u.id, e.target.value as Role)}
                          className="border border-gray-300 rounded px-2 py-1 text-gray-700 disabled:opacity-50"
                        >
                          {ROLES.map(role => (
                            <option key={role} value={role}>
                              {ROLE_LABELS[role]}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        {u.emailVerified ? (
                          <span className="text-green-800">
                            Yes, {new Date(u.emailVerified).toLocaleDateString()}
                          </span>
                        ) : (
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-gray-600">Not yet</span>
                            <button
                              onClick={() => resendSetupEmail(u)}
                              disabled={sendingId === u.id}
                              className="rounded border border-gray-400 px-2 py-1 text-xs font-medium text-gray-900 hover:bg-gray-50 disabled:opacity-50"
                            >
                              {sendingId === u.id ? 'Sending…' : 'Resend setup email'}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
