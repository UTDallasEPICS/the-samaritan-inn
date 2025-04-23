'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Link from 'next/link';

type ScheduleType = 'caseworker' | 'curfew';
type TimeSlot = string;

interface ScheduleFormData {
  date: Date | null;
  time: TimeSlot | null;
  type: ScheduleType | null;
  reason?: string;
}

const SchedulingCurfewPage: React.FC = () => {
  const [formData, setFormData] = useState<ScheduleFormData>({
    date: null,
    time: null,
    type: null,
    reason: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const availableTimeSlots: TimeSlot[] = [
    '09:00 AM', '10:00 AM', '11:00 AM',
    '02:00 PM', '03:00 PM', '04:00 PM'
  ];

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.date) newErrors.date = 'Please select a date';
    if (!formData.time) newErrors.time = 'Please select a time slot';
    if (!formData.type) newErrors.type = 'Please select a request type';
    if (formData.type === 'curfew' && !formData.reason) {
      newErrors.reason = 'Please provide a reason for curfew extension';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDateChange = (date: Date) => {
    setFormData(prev => ({ ...prev, date }));
    setErrors(prev => ({ ...prev, date: '' }));
  };

  const handleTypeChange = (type: ScheduleType) => {
    setFormData(prev => ({ ...prev, type, reason: '' }));
    setErrors(prev => ({ ...prev, type: '' }));
  };

  const handleTimeSelect = (time: TimeSlot) => {
    setFormData(prev => ({ ...prev, time }));
    setErrors(prev => ({ ...prev, time: '' }));
  };

  const handleReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, reason: e.target.value }));
    setErrors(prev => ({ ...prev, reason: '' }));
  };

  const tileDisabled = ({ date }: { date: Date }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      console.log('Submitted:', formData);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setFormData({ date: null, time: null, type: null, reason: '' });
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred while submitting your request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calendarStyles = {
    '.react-calendar': {
      width: '100%',
      maxWidth: '400px',
      backgroundColor: '#fff',
      color: '#000',
      borderRadius: '8px',
      fontFamily: 'Arial, Helvetica, sans-serif',
    },
    '.react-calendar__month-view__days__day': {
      color: '#000 !important',
    },
    '.react-calendar__navigation button': {
      color: '#000',
      fontSize: '16px',
      fontWeight: 'bold',
    },
    '.react-calendar__month-view__weekdays__weekday': {
      color: '#000',
      fontWeight: 'bold',
    },
    '.react-calendar__tile:enabled:hover': {
      backgroundColor: '#e6e6e6',
    },
    '.react-calendar__tile--active': {
      backgroundColor: '#29abe2 !important',
      color: '#fff !important',
    },
    '.react-calendar__tile:disabled': {
      color: '#757575 !important',
    },
  };

  return (
    <div className="min-h-screen bg-[#FFFEFE] font-[Montserrat]">
      {/* Navigation Bar */}
      <nav className="bg-[#00167c] text-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">

          {/* Logo/Home Button */}
          <div className="flex items-center space-x-6">
            <Link href="/homepage" className="flex items-center">
              <span className="font-bold text-xl">The Samaritan Inn</span>
            </Link>

            {/* Navigation Buttons (visible on medium screens and larger) */}
            <div className="hidden md:flex space-x-4">
              {/* Home Button */}
              <Link href="/homepage" className="py-2 px-4 bg-[#0caebb] rounded-md hover:bg-[#29abe2] transition duration-300">
                Home
              </Link>
              {/* Curfew Scheduling Button */}
              <Link href="/curfew" className="py-2 px-4 hover:bg-[#29abe2] rounded-md transition duration-300">
                Pass Request
              </Link>
              {/* Case Worker Button */}
              <Link href="/caseworker" className="py-2 px-4 hover:bg-[#29abe2] rounded-md transition duration-300">
                Case Worker
              </Link>
            </div>
          </div>

          {/* Login/Signup Circle Button */}
          <div className="flex items-center">
            <Link href="/login" className="bg-white text-[#00167c] rounded-full w-12 h-12 flex items-center justify-center hover:bg-gray-100 transition duration-300">
              {/* User Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
          </div>
        </div>
      </nav>

      <div className="flex items-center justify-center bg-white">
        <div className="max-w-4xl w-full p-6 bg-white text-blue-900 rounded-lg shadow-lg font-montserrat">
          <h1 className="text-3xl font-bold mb-6 text-center text-[#29abe2]">Schedule / Request Curfew</h1>

          {showSuccess && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
              <span className="block sm:inline">Your request has been submitted successfully!</span>
            </div>
          )}

          <div className="mb-6 flex justify-center gap-4">
            <button
              className={`px-4 py-2 rounded-lg ${formData.type === 'caseworker' ? 'bg-[#29abe2] text-white' : 'bg-[#29abe2] hover:bg-[#8cc63f] text-white'}`}
              onClick={() => handleTypeChange('caseworker')}
            >
              Schedule Caseworker Meeting
            </button>
            <button
              className={`px-4 py-2 rounded-lg ${formData.type === 'curfew' ? 'bg-[#8cc63f] text-white' : 'bg-[#29abe2] hover:bg-[#fbb03b] text-white'}`}
              onClick={() => handleTypeChange('curfew')}
            >
              Request Curfew Extension
            </button>
          </div>

          {formData.type && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-xl mb-4 text-[#29abe2]">Select Date</h2>
                  <Calendar
                    onChange={handleDateChange}
                    value={formData.date}
                    minDate={new Date()}
                    tileDisabled={tileDisabled}
                    className="border rounded-lg shadow-sm"
                    style={calendarStyles}
                  />
                </div>

                {formData.date && (
                  <div>
                    <h2 className="text-xl mb-4 text-[#29abe2]">Available Time Slots</h2>
                    <div className="grid grid-cols-2 gap-2">
                      {availableTimeSlots.map((time) => (
                        <button
                          key={time}
                          type="button"
                          className={`p-2 border rounded-lg ${formData.time === time ? 'bg-[#8cc63f] text-white' : 'bg-[#29abe2] hover:bg-[#fbb03b] text-white'}`}
                          onClick={() => handleTimeSelect(time)}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {formData.type === 'curfew' && (
                <div>
                  <h2 className="text-xl mb-2 text-[#29abe2]">Reason for Extension</h2>
                  <textarea
                    className="w-full p-2 border rounded-lg bg-[#f3f8f8]"
                    rows={4}
                    value={formData.reason}
                    onChange={handleReasonChange}
                    placeholder="Provide a reason for your curfew extension request..."
                    required
                  />
                </div>
              )}

              {formData.date && formData.time && (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full px-6 py-2 rounded-lg ${isSubmitting ? 'bg-[#29abe2] opacity-70' : 'bg-[#29abe2] hover:bg-[#8cc63f]'} text-white`}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchedulingCurfewPage;