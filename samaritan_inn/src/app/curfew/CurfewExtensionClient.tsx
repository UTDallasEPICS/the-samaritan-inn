'use client';

import { useSession, signOut } from "next-auth/react";
import React, { useState } from 'react';
import { Check } from 'lucide-react';

interface Request {
  id: number;
  date: string;
  status: 'pending' | 'approved' | 'denied';
  reason: string;
  caseWorker: string;
}

interface FormData {
  caseWorker: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  reason: string;
  extraInfo: string;
  choreCoverage: string;
  signature: string;
}

export default function CurfewExtensionClient() {
  const { data: session } = useSession();

  const [requests, setRequests] = useState<Request[]>([
    { id: 1, date: '04/28/25', status: 'approved', reason: 'Medical appointment', caseWorker: 'Sarah Johnson' },
    { id: 2, date: '05/03/25', status: 'pending', reason: 'Job interview', caseWorker: 'Michael Chen' }
  ]);

  const [formData, setFormData] = useState<FormData>({
    caseWorker: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    reason: '',
    extraInfo: '',
    choreCoverage: '',
    signature: ''
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!formData.caseWorker || formData.caseWorker === 'Select Case Worker') {
      alert('Please select a case worker');
      return;
    }
    if (!formData.startDate || !formData.startTime || !formData.endDate || !formData.endTime || !formData.reason || !formData.signature) {
      alert('Please fill in all required fields');
      return;
    }

    const newRequest: Request = {
      id: requests.length + 1,
      date: new Date(formData.startDate).toLocaleDateString('en-US'),
      status: 'pending',
      reason: formData.reason,
      caseWorker: formData.caseWorker
    };

    setRequests([newRequest, ...requests]);
    setFormData({
      caseWorker: '',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      reason: '',
      extraInfo: '',
      choreCoverage: '',
      signature: ''
    });

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-3 py-1 rounded-md text-xs font-medium bg-green-100 text-green-700">Approved</span>;
      case 'denied':
        return <span className="px-3 py-1 rounded-md text-xs font-medium bg-red-100 text-red-700">Denied</span>;
      case 'pending':
        return <span className="px-3 py-1 rounded-md text-xs font-medium bg-yellow-100 text-yellow-700">Pending</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f8fc]">
      {/* NAVBAR */}
      <nav className="bg-gradient-to-r from-[#003399] to-[#001f66] shadow">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-14">
            <a href="/" className="text-white text-base font-semibold">The Samaritan Inn</a>
            <div className="flex items-center space-x-0">
              {['Home', 'Schedule', 'Curfew', 'Resources'].map((link, i) => (
                <a
                  key={i}
                  href={`/${link.toLowerCase()}`}
                  className="px-4 py-2 text-white text-sm hover:bg-[#002b80] rounded-md transition-colors"
                >
                  {link}
                </a>
              ))}
              <a
                href="/announcements"
                className="px-4 py-2 bg-[#00bcd4] text-[#002b80] text-sm font-medium rounded-md hover:bg-[#26c6da] transition-colors ml-1"
              >
                Announcements
              </a>
              <a href="/profile" className="px-4 py-2 text-white text-sm hover:bg-[#002b80] rounded-md ml-1">Profile</a>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="px-4 py-2 bg-[#f44336] text-white text-sm font-medium rounded-md ml-2 hover:bg-[#d32f2f] transition-colors"
              >
                Sign Out
              </button>
              <span className="text-white text-sm ml-3">
                {session?.user?.name ? `Hi, ${session.user.name}` : "Hi User"}
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* PAGE CONTENT */}
      <div className="max-w-5xl mx-auto px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Curfew Extension Request</h1>

        {showSuccess && (
          <div className="mb-6 bg-green-50 border border-green-300 rounded-md p-3 flex items-center space-x-2 shadow-sm">
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-sm text-green-700 font-medium">Request submitted successfully!</span>
          </div>
        )}

        {/* FORM */}
        <div className="mb-8 bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Submit New Request</h2>

          <div className="grid grid-cols-1 gap-5">
            {/* Case Worker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Case Worker <span className="text-red-500">*</span></label>
              <select
                name="caseWorker"
                value={formData.caseWorker}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#00bcd4]"
              >
                {caseWorkers.map((worker, idx) => (
                  <option key={idx} value={worker} disabled={idx === 0}>{worker}</option>
                ))}
              </select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date <span className="text-red-500">*</span></label>
                <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#00bcd4]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date <span className="text-red-500">*</span></label>
                <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#00bcd4]" />
              </div>
            </div>

            {/* Times */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time <span className="text-red-500">*</span></label>
                <input type="text" name="startTime" placeholder="7:00 PM" value={formData.startTime} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#00bcd4]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time <span className="text-red-500">*</span></label>
                <input type="text" name="endTime" placeholder="9:00 PM" value={formData.endTime} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#00bcd4]" />
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason <span className="text-red-500">*</span></label>
              <input type="text" name="reason" placeholder="e.g., Medical appointment, Job interview" value={formData.reason} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#00bcd4]" />
            </div>

            {/* Signature */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Signature (Full Name) <span className="text-red-500">*</span></label>
              <input type="text" name="signature" placeholder="Type your full name" value={formData.signature} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#00bcd4]" />
            </div>

            <div className="flex justify-end">
              <button onClick={handleSubmit} className="px-5 py-2 bg-[#00bcd4] text-[#002b80] font-medium text-sm rounded-md hover:bg-[#26c6da] transition-all">
                Submit Request
              </button>
            </div>
          </div>
        </div>

        {/* HISTORY */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Request History</h2>
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            {requests.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">No requests yet</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {requests.map(req => (
                  <div key={req.id} className="px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-all">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{req.date}</p>
                      <p className="text-sm text-gray-600">{req.reason}</p>
                    </div>
                    {getStatusBadge(req.status)}
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
