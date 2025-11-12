"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function CurfewExtensionResident() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Allowed roles for this page
  const allowedRoles = ["resident", "user"];

  // Show loading while session loads
  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen text-gray-700">
        Loading...
      </div>
    );
  }

  // Redirect if not logged in or role not allowed
  if (!session || !allowedRoles.includes(session.user.role)) {
    router.push("/unauthorized");
    return null;
  }

  // ------------------------------
  // FORM STATE
  // ------------------------------
  const [formData, setFormData] = useState({
    caseWorker: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    reason: "",
    extraInfo: "",
    signature: "",
  });

  const [popupSuccess, setPopupSuccess] = useState(false);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ------------------------------
  // SUBMIT FORM → API ROUTE
  // ------------------------------
  const handleSubmit = async () => {
    const res = await fetch("/api/curfew/submit", {
      method: "POST",
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      alert("Failed to submit request.");
      return;
    }

    setPopupSuccess(true);

    // Reset form
    setFormData({
      caseWorker: "",
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: "",
      reason: "",
      extraInfo: "",
      signature: "",
    });

    // Hide popup after 2 seconds
    setTimeout(() => setPopupSuccess(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Curfew Extension Request
      </h1>

      {/* SUCCESS POPUP */}
      {popupSuccess && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <p className="text-lg font-semibold text-green-600">
              Request Submitted Successfully!
            </p>
          </div>
        </div>
      )}

      {/* REQUEST FORM */}
      <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto w-full border">
        <div className="grid gap-5">

          <input
            name="caseWorker"
            placeholder="Case Worker"
            className="border p-2 rounded"
            value={formData.caseWorker}
            onChange={handleChange}
          />

          {/* DATES */}
          <div className="grid grid-cols-2 gap-4">
            <input
              type="date"
              name="startDate"
              className="border p-2 rounded"
              value={formData.startDate}
              onChange={handleChange}
            />
            <input
              type="date"
              name="endDate"
              className="border p-2 rounded"
              value={formData.endDate}
              onChange={handleChange}
            />
          </div>

          {/* TIMES */}
          <div className="grid grid-cols-2 gap-4">
            <input
              name="startTime"
              placeholder="Start Time"
              className="border p-2 rounded"
              value={formData.startTime}
              onChange={handleChange}
            />
            <input
              name="endTime"
              placeholder="End Time"
              className="border p-2 rounded"
              value={formData.endTime}
              onChange={handleChange}
            />
          </div>

          {/* REASON */}
          <input
            name="reason"
            placeholder="Reason for Extension"
            className="border p-2 rounded"
            value={formData.reason}
            onChange={handleChange}
          />

          {/* EXTRA INFO */}
          <input
            name="extraInfo"
            placeholder="Additional Information (optional)"
            className="border p-2 rounded"
            value={formData.extraInfo}
            onChange={handleChange}
          />

          {/* SIGNATURE */}
          <input
            name="signature"
            placeholder="Signature (Full Name)"
            className="border p-2 rounded"
            value={formData.signature}
            onChange={handleChange}
          />

          {/* SUBMIT BUTTON */}
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
          >
            Submit Request
          </button>
        </div>
      </div>
    </div>
  );
}
