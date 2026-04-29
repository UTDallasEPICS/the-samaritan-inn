'use client';

import { useState } from 'react';
import {
  PASSWORD_MIN_LENGTH,
  USER_ROLE_LABELS,
  USER_ROLES,
  type CreateUserInput,
} from '@/lib/user-config';

const initialForm: CreateUserInput = {
  firstName: '',
  lastName: '',
  caseWorkerName: '',
  salesforceAccountId: '',
  role: 'resident',
  email: '',
  password: '',
};

export default function AdminUserCreateForm() {
  const [form, setForm] = useState<CreateUserInput>(initialForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = <K extends keyof CreateUserInput,>(field: K, value: CreateUserInput[K]) => {
    setForm(current => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message ?? 'Unable to create user');
      }

      setSuccess(`Created user ${payload.user.name} (${payload.user.email}).`);
      setForm(initialForm);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Unable to create user'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mt-8 rounded-md border-2 border-secondary bg-white p-6 shadow">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary">Create User</h2>
        <p className="mt-2 text-sm text-gray-600">
          Admins create accounts here and share the credentials directly with the user.
        </p>
      </div>

      <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="First name"
          value={form.firstName}
          onChange={event => updateField('firstName', event.target.value)}
          className="rounded border border-gray-300 px-3 py-2 text-black focus:outline-none focus:border-blue-500"
          required
        />
        <input
          type="text"
          placeholder="Last name"
          value={form.lastName}
          onChange={event => updateField('lastName', event.target.value)}
          className="rounded border border-gray-300 px-3 py-2 text-black focus:outline-none focus:border-blue-500"
          required
        />
        <input
          type="text"
          placeholder="Case worker ID"
          value={form.caseWorkerName}
          onChange={event => updateField('caseWorkerName', event.target.value)}
          className="rounded border border-gray-300 px-3 py-2 text-black focus:outline-none focus:border-blue-500"
          required
        />
        <input
          type="text"
          placeholder="Salesforce account ID"
          value={form.salesforceAccountId}
          onChange={event => updateField('salesforceAccountId', event.target.value)}
          className="rounded border border-gray-300 px-3 py-2 text-black focus:outline-none focus:border-blue-500"
          required
        />
        <select
          value={form.role}
          onChange={event => updateField('role', event.target.value)}
          className="rounded border border-gray-300 px-3 py-2 text-black focus:outline-none focus:border-blue-500"
          required
        >
          {USER_ROLES.map(role => (
            <option key={role} value={role}>
              {USER_ROLE_LABELS[role]}
            </option>
          ))}
        </select>
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={event => updateField('email', event.target.value)}
          className="rounded border border-gray-300 px-3 py-2 text-black focus:outline-none focus:border-blue-500"
          required
        />
        <div className="md:col-span-2">
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={event => updateField('password', event.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-black focus:outline-none focus:border-blue-500"
            minLength={PASSWORD_MIN_LENGTH}
            required
          />
          <p className="mt-2 text-xs text-gray-500">
            Password must be at least {PASSWORD_MIN_LENGTH} characters long.
          </p>
        </div>

        {error && (
          <p className="md:col-span-2 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        {success && (
          <p className="md:col-span-2 rounded border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-700">
            {success}
          </p>
        )}

        <div className="md:col-span-2 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded bg-[#29abe2] px-5 py-2 font-semibold text-white hover:bg-[#1f8fbf] disabled:bg-[#64bee3]"
          >
            {isSubmitting ? 'Creating User...' : 'Create User'}
          </button>
        </div>
      </form>
    </section>
  );
}
