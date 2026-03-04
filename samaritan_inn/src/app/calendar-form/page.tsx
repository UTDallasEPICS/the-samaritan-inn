'use client';

import React, { useState } from 'react';
import Navigation from '@/components/Navigation';

const CalendarFormPage = () => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value });
    setError('');
    setSuccess(false);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.startDate || !form.endDate) {
      setError('Please fill in the Event Title, Start Date, and End Date.');
      return;
    }
    if (new Date(form.endDate) <= new Date(form.startDate)) {
      setError('End date must be after the start date.');
      return;
    }

    const res = await fetch('/api/submit-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setSuccess(true);
      setForm({ title: '', description: '', startDate: '', endDate: '', location: '' });
    } else {
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <div className="flex-grow bg-gray-100 p-4 flex flex-col items-center">
        <div className="w-full max-w-4xl p-6 bg-white shadow-md rounded-md">
          <h1 className="text-4xl font-bold mb-4 text-black">Schedule a Calendar Event</h1>
          <p className="text-lg mb-6 text-black">
            Fill in the details below and your event will be added to the Salesforce calendar automatically.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              id="title"
              label="Event Title"
              type="text"
              placeholder="e.g. Client Meeting"
              value={form.title}
              onChange={handleChange}
              color="blue"
              required
            />
            <FormField
              id="location"
              label="Location (optional)"
              type="text"
              placeholder="e.g. Conference Room B"
              value={form.location}
              onChange={handleChange}
              color="green"
            />
            <FormField
              id="startDate"
              label="Start Date & Time"
              type="datetime-local"
              value={form.startDate}
              onChange={handleChange}
              color="purple"
              required
            />
            <FormField
              id="endDate"
              label="End Date & Time"
              type="datetime-local"
              value={form.endDate}
              onChange={handleChange}
              color="orange"
              required
            />
            <div className="md:col-span-2">
              <FormField
                id="description"
                label="Description (optional)"
                type="textarea"
                placeholder="Add any notes or details about this event..."
                value={form.description}
                onChange={handleChange}
                color="yellow"
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
              ✓ Your event has been successfully added to the calendar.
            </div>
          )}

          <div className="mt-6">
            <button
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition duration-300"
            >
              Submit Event
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>

          <p className="mt-4 text-sm text-gray-500">
            This form submits directly to Salesforce via the REST API.
          </p>
        </div>
      </div>
    </div>
  );
};

type Color = 'blue' | 'green' | 'yellow' | 'purple' | 'orange';

const FormField = ({
  id,
  label,
  type,
  placeholder,
  value,
  onChange,
  color,
  required,
}: {
  id: string;
  label: string;
  type: 'text' | 'datetime-local' | 'textarea';
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  color: Color;
  required?: boolean;
}) => {
  const borderColors: Record<Color, string> = {
    blue: 'border-blue-600 focus-within:bg-blue-50',
    green: 'border-green-600 focus-within:bg-green-50',
    yellow: 'border-yellow-600 focus-within:bg-yellow-50',
    purple: 'border-purple-600 focus-within:bg-purple-50',
    orange: 'border-orange-600 focus-within:bg-orange-50',
  };
  const labelColors: Record<Color, string> = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
  };

  return (
    <div className={`p-4 bg-white rounded-lg shadow-md border-2 ${borderColors[color]} transition duration-300`}>
      <label htmlFor={id} className={`block text-sm font-semibold mb-2 ${labelColors[color]}`}>
        {label}{required && <span className="ml-1 text-red-400">*</span>}
      </label>
      {type === 'textarea' ? (
        <textarea
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          rows={3}
          className="w-full text-sm text-gray-800 bg-transparent outline-none resize-none placeholder-gray-400"
        />
      ) : (
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full text-sm text-gray-800 bg-transparent outline-none placeholder-gray-400"
        />
      )}
    </div>
  );
};

export default CalendarFormPage;