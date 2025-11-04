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
  startDatetime: string;
  endDatetime: string;
  reason: string;
  extraInfo: string;
  choreCoverage: string;
  signature: string;
  pdfFile: File | null;
}

export default function CurfewExtensionPage() {
  const [requests, setRequests] = useState<Request[]>([
    { id: 1, date: '04/28/25', status: 'approved', reason: 'Medical appointment', caseWorker: 'Sarah Johnson' },
    { id: 2, date: '05/03/25', status: 'pending', reason: 'Job interview', caseWorker: 'Michael Chen' }
  ]);

  const [formData, setFormData] = useState<FormData>({
    caseWorker: '',
    startDatetime: '',
    endDatetime: '',
    reason: '',
    extraInfo: '',
    choreCoverage: '',
    signature: '',
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
    if (!formData.startDatetime || !formData.endDatetime || !formData.reason || !formData.signature) {
      alert('Please fill in all required fields');
      return;
    }

    const newRequest: Request = {
      id: requests.length + 1,
      date: new Date(formData.startDatetime).toLocaleDateString('en-US'),
      status: 'pending',
      reason: formData.reason,
      caseWorker: formData.caseWorker
    };

    setRequests([newRequest, ...requests]);
    
    setFormData({
      caseWorker: '',
      startDatetime: '',
      endDatetime: '',
      reason: '',
      extraInfo: '',
      choreCoverage: '',
      signature: '',
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

              {/* Start Date/Time */}
              <div>
                <label className="block text-base font-medium text-gray-900 mb-2">
                  Start Date & Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="startDatetime"
                  value={formData.startDatetime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                />
              </div>

              {/* End Date/Time */}
              <div>
                <label className="block text-base font-medium text-gray-900 mb-2">
                  End Date & Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="endDatetime"
                  value={formData.endDatetime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                />
              </div>

              {/* Reason */}
              <div>
                <label className="block text-base font-medium text-gray-900 mb-2">
                  Reason for Extension <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  placeholder="e.g., Medical appointment, Job interview, Family emergency"
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                />
              </div>

              {/* Extra Info */}
              <div>
                <label className="block text-base font-medium text-gray-900 mb-2">
                  Additional Information
                </label>
                <input
                  type="text"
                  name="extraInfo"
                  value={formData.extraInfo}
                  onChange={handleInputChange}
                  placeholder="Any additional context or details (optional)"
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                />
              </div>

              {/* Chore Coverage */}
              <div>
                <label className="block text-base font-medium text-gray-900 mb-2">
                  Fellow Resident Covering Chores
                </label>
                <input
                  type="text"
                  name="choreCoverage"
                  value={formData.choreCoverage}
                  onChange={handleInputChange}
                  placeholder="Name of resident who will cover your chores (if applicable)"
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                />
              </div>

              {/* Signature */}
              <div>
                <label className="block text-base font-medium text-gray-900 mb-2">
                  Signature (Type Full Name) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="signature"
                  value={formData.signature}
                  onChange={handleInputChange}
                  placeholder="Type your full name as signature"
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                />
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
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Request History</h2>
          <div className="bg-white border-2 border-cyan-400 rounded-lg overflow-hidden shadow-md">
            {requests.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">No requests yet</p>
              </div>
            ) : (
              <div className="divide-y-2 divide-gray-200">
                {requests.map((request) => (
                  <div key={request.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm font-semibold text-gray-900">{request.date}</span>
                        <span className="text-sm text-gray-600">{request.reason}</span>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}