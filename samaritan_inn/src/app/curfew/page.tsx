'use client';

import React, { useState } from 'react';
import { FileText, Upload, Check, X, Clock, Send } from 'lucide-react';

interface Request {
  id: number;
  date: string;
  status: 'pending' | 'approved' | 'denied';
  reason: string;
  caseWorker: string;
}

interface FormData {
  caseWorker: string;
  datetime: string;
  reason: string;
  extraInfo: string;
  pdfFile: File | null;
}

export default function CurfewExtensionPage() {
  const [requests, setRequests] = useState<Request[]>([
    { id: 1, date: '04/28/25', status: 'approved', reason: 'Medical appointment', caseWorker: 'Sarah Johnson' },
    { id: 2, date: '05/03/25', status: 'pending', reason: 'Job interview', caseWorker: 'Michael Chen' }
  ]);

  const [formData, setFormData] = useState<FormData>({
    caseWorker: '',
    datetime: '',
    reason: '',
    extraInfo: '',
    pdfFile: null
  });

  const [showSuccess, setShowSuccess] = useState(false);

  const caseWorkers = [
    'Select Case Worker',
    'Sarah Johnson',
    'Michael Chen',
    'Emma Williams',
    'David Martinez',
    'Lisa Anderson'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setFormData(prev => ({ ...prev, pdfFile: file }));
    } else {
      alert('Please upload a PDF file');
    }
  };

  const handleSubmit = () => {
    if (!formData.caseWorker || formData.caseWorker === 'Select Case Worker') {
      alert('Please select a case worker');
      return;
    }
    if (!formData.datetime || !formData.reason) {
      alert('Please fill in all required fields');
      return;
    }

    const newRequest: Request = {
      id: requests.length + 1,
      date: new Date(formData.datetime).toLocaleDateString('en-US'),
      status: 'pending',
      reason: formData.reason,
      caseWorker: formData.caseWorker
    };

    setRequests([newRequest, ...requests]);
    
    setFormData({
      caseWorker: '',
      datetime: '',
      reason: '',
      extraInfo: '',
      pdfFile: null
    });

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 2000);
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'approved':
        return (
          <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-green-200 text-green-800 flex items-center space-x-1">
            <Check className="w-4 h-4" />
            <span>Approved</span>
          </span>
        );
      case 'denied':
        return (
          <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-red-200 text-red-800 flex items-center space-x-1">
            <X className="w-4 h-4" />
            <span>Denied</span>
          </span>
        );
      case 'pending':
        return (
          <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-yellow-200 text-yellow-800 flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>Pending Review</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      <nav className="bg-blue-900 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <a href="/" className="text-white text-xl font-bold">
              The Samaritan Inn
            </a>
            
            <div className="flex space-x-2">
              <a href="/homepage" className="px-4 py-2 text-white hover:bg-cyan-500 rounded transition-colors text-sm font-medium">
                Home
              </a>
              <a href="/schedule" className="px-4 py-2 text-white hover:bg-cyan-500 rounded transition-colors text-sm font-medium">
                Schedule
              </a>
              <a href="/Resources" className="px-4 py-2 text-white hover:bg-cyan-500 rounded transition-colors text-sm font-medium">
                Resources
              </a>
              <a href="/announcements" className="px-4 py-2 text-white hover:bg-cyan-500 rounded transition-colors text-sm font-medium">
                Announcements
              </a>
              <a href="/curfew" className="px-4 py-2 bg-cyan-500 text-white rounded text-sm font-medium">
                Curfew
              </a>
              <a href="/profile" className="px-4 py-2 text-white hover:bg-cyan-500 rounded transition-colors text-sm font-medium">
                Profile
              </a>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-white text-sm">Hi, Poojith Sureshkumar</span>
              <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm font-medium">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-900">Curfew Extension Requests</h1>
          <p className="text-gray-600 mt-2">Submit and track your curfew extension requests</p>
        </div>

        {showSuccess && (
          <div className="mb-6 bg-green-50 border-2 border-green-400 rounded-lg p-4 flex items-center space-x-3">
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">Request submitted successfully! Your case worker will review it within 24-48 hours.</span>
          </div>
        )}

        {/* New Extension Request Section */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Submit New Request</h2>
          <div className="bg-white border-2 border-cyan-400 rounded-lg shadow-md p-6">
            <div className="space-y-5">
              {/* Case Worker Dropdown */}
              <div>
                <label className="block text-base font-medium text-gray-900 mb-2">
                  Case Worker <span className="text-red-500">*</span>
                </label>
                <select
                  name="caseWorker"
                  value={formData.caseWorker}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                >
                  {caseWorkers.map((worker, idx) => (
                    <option key={idx} value={worker} disabled={idx === 0}>
                      {worker}
                    </option>
                  ))}
                </select>
              </div>

              {/* Day/time */}
              <div>
                <label className="block text-base font-medium text-gray-900 mb-2">
                  Extension Date & Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="datetime"
                  value={formData.datetime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                />
                <p className="mt-1 text-xs text-gray-500">When do you need the curfew extension?</p>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-base font-medium text-gray-900 mb-2">
                  Reason for Extension <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Please provide a detailed reason (e.g., medical appointment, job interview, family emergency)..."
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded bg-white text-gray-900 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                />
              </div>

              {/* Extra Info */}
              <div>
                <label className="block text-base font-medium text-gray-900 mb-2">
                  Additional Information
                </label>
                <textarea
                  name="extraInfo"
                  value={formData.extraInfo}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="Any additional context or details (optional)..."
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded bg-white text-gray-900 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                />
              </div>

              {/* PDF Upload */}
              <div>
                <label className="block text-base font-medium text-gray-900 mb-2">
                  Supporting Documentation
                </label>
                <div className="border-2 border-dashed border-gray-400 rounded-lg p-6 text-center hover:border-cyan-500 hover:bg-cyan-50 transition-all cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="pdf-upload"
                  />
                  <label htmlFor="pdf-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center space-y-2">
                      {formData.pdfFile ? (
                        <>
                          <FileText className="w-12 h-12 text-green-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{formData.pdfFile.name}</p>
                            <p className="text-xs text-gray-500 mt-1">Click to change file</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <Upload className="w-12 h-12 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Upload PDF Document</p>
                            <p className="text-xs text-gray-500 mt-1">Optional: Appointment letters, schedules, etc.</p>
                          </div>
                        </>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4 border-t-2 border-gray-200">
                <button
                  onClick={handleSubmit}
                  className="px-10 py-3 bg-cyan-500 text-white rounded-lg text-sm font-bold hover:bg-cyan-600 transition-colors shadow-md flex items-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Request</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* My Requests Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">My Request History</h2>
          <div className="bg-white border-2 border-cyan-400 rounded-lg overflow-hidden shadow-md">
            {requests.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">No requests yet</p>
                <p className="text-sm text-gray-500 mt-2">Submit your first curfew extension request above</p>
              </div>
            ) : (
              <div className="divide-y-2 divide-cyan-400">
                {requests.map((request) => (
                  <div key={request.id} className="px-6 py-5 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-lg font-bold text-gray-900">{request.date}</span>
                          {getStatusBadge(request.status)}
                        </div>
                        <p className="text-sm text-gray-700 mb-1">
                          <span className="font-semibold">Reason:</span> {request.reason}
                        </p>
                        <p className="text-xs text-gray-500">
                          <span className="font-semibold">Case Worker:</span> {request.caseWorker}
                        </p>
                      </div>
                    </div>
                    {request.status === 'pending' && (
                      <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded p-3">
                        <p className="text-xs text-yellow-800">
                          <span className="font-semibold">⏳ Under Review:</span> Your case worker will review this request within 24-48 hours. You'll be notified once a decision is made.
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-cyan-50 border-2 border-cyan-400 rounded-lg p-5">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-cyan-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-bold text-cyan-900">Important Information</h3>
              <ul className="mt-2 text-sm text-cyan-800 space-y-1">
                <li>• Submit requests at least 48 hours in advance when possible</li>
                <li>• Your case worker will review and respond within 24-48 hours</li>
                <li>• Include supporting documentation to strengthen your request</li>
                <li>• Contact your case worker directly for urgent situations</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}