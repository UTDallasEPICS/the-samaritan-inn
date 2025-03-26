'use client';
import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

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
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const availableTimeSlots: TimeSlot[] = [
    '09:00 AM', '10:00 AM', '11:00 AM',
    '02:00 PM', '03:00 PM', '04:00 PM'
  ];

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
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
      // Add your API call here
      console.log('Submitted:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
      setFormData({
        date: null,
        time: null,
        type: null,
        reason: '',
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred while submitting your request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white text-blue-900 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">
        Schedule / Request Curfew
      </h1>

      {showSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
          <span className="block sm:inline">Your request has been submitted successfully!</span>
        </div>
      )}

      <div className="mb-6">
        <div className="flex gap-4 mb-4 justify-center">
          <button
            className={`px-4 py-2 rounded-lg transition-all duration-300 ${
              formData.type === 'caseworker' 
                ? 'bg-blue-700 text-white' 
                : 'bg-blue-100 hover:bg-blue-200'
            }`}
            onClick={() => handleTypeChange('caseworker')}
          >
            Schedule Caseworker Meeting
          </button>
          <button
            className={`px-4 py-2 rounded-lg transition-all duration-300 ${
              formData.type === 'curfew' 
                ? 'bg-blue-700 text-white' 
                : 'bg-blue-100 hover:bg-blue-200'
            }`}
            onClick={() => handleTypeChange('curfew')}
          >
            Request Curfew Extension
          </button>
        </div>
        {errors.type && (
          <p className="text-red-500 text-sm text-center">{errors.type}</p>
        )}
      </div>

      {formData.type && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl mb-4 text-blue-700">Select Date</h2>
              <Calendar
                onChange={handleDateChange}
                value={formData.date}
                minDate={new Date()}
                tileDisabled={tileDisabled}
                className="border rounded-lg shadow-sm"
              />
              {errors.date && (
                <p className="text-red-500 text-sm mt-2">{errors.date}</p>
              )}
            </div>

            {formData.date && (
              <div>
                <h2 className="text-xl mb-4 text-blue-700">Available Time Slots</h2>
                <div className="grid grid-cols-2 gap-2">
                  {availableTimeSlots.map((time) => (
                    <button
                      key={time}
                      type="button"
                      className={`p-2 border rounded-lg transition-all duration-300 ${
                        formData.time === time 
                          ? 'bg-blue-700 text-white' 
                          : 'bg-blue-100 hover:bg-blue-200'
                      }`}
                      onClick={() => handleTimeSelect(time)}
                    >
                      {time}
                    </button>
                  ))}
                </div>
                {errors.time && (
                  <p className="text-red-500 text-sm mt-2">{errors.time}</p>
                )}
              </div>
            )}
          </div>

          {formData.type === 'curfew' && (
            <div>
              <h2 className="text-xl mb-2 text-blue-700">Reason for Extension</h2>
              <textarea
                className="w-full p-2 border rounded-lg bg-blue-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                rows={4}
                value={formData.reason}
                onChange={handleReasonChange}
                placeholder="Please provide a reason for your curfew extension request..."
                required
              />
              {errors.reason && (
                <p className="text-red-500 text-sm mt-2">{errors.reason}</p>
              )}
            </div>
          )}

          {formData.date && formData.time && (
            <button
              type="submit"
              disabled={isSubmitting}
              className={`${
                isSubmitting 
                  ? 'bg-blue-400' 
                  : 'bg-blue-700 hover:bg-blue-800'
              } text-white px-6 py-2 rounded-lg transition-all duration-300 w-full`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </button>
          )}
        </form>
      )}
    </div>
  );
};

export default SchedulingCurfewPage;
