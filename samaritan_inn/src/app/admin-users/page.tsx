'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { can, ROLES, type Role } from '@/lib/permissions';

interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const canManageUsers = can(session?.user?.role, 'MANAGE_USERS');

  useEffect(() => {
    if (status !== 'authenticated' || !canManageUsers) return;

    fetch('/api/users')
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(setUsers)
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
      if (!res.ok) throw new Error();
    } catch {
      setUsers(previous);
      setError('Failed to update role. Please try again.');
    } finally {
      setSavingId(null);
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

          {error && (
            <div className="mb-4 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
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
                          disabled={savingId === u.id}
                          onChange={e => handleRoleChange(u.id, e.target.value as Role)}
                          className="border border-gray-300 rounded px-2 py-1 text-gray-700 disabled:opacity-50"
                        >
                          {ROLES.map(role => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
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
