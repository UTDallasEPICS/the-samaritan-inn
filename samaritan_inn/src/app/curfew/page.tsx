"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";

export default function CurfewRequestPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Restrict to residents only
  const isResident = session?.user?.role === "resident";

  // Redirect unauthenticated users
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/unauthorized");
    }
  }, [status, router]);

  // Show Loading Screen
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  // Block admins/staff from using the form
  if (!isResident) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-100">
        <Navigation />
        <div className="flex-grow flex items-center justify-center">
          <div className="bg-white shadow-md p-8 rounded-md text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Access Restricted
            </h2>
            <p className="text-gray-600">
              Only residents may submit curfew extension requests.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // =============== ORIGINAL USER FORM CODE =====================
  // ============================================================

  const [caseWorkers, setCaseWorkers] = useState([]);

  const [formData, setFormData] = useState({
    caseWorker: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    reason: "",
    signature: "",
  });

  useEffect(() => {
    async function loadWorkers() {
      try {
        const res = await fetch("/api/caseworkers");
        const data = await res.json();
        setCaseWorkers(data);
      } catch (err) {
        console.error("Error loading workers:", err);
      }
    }
    loadWorkers();
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const res = await fetch("/api/curfew/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      alert("Request Submitted Successfully!");
    } else {
      alert("Error submitting request");
    }
  };

  return (
    <div className="bg-[#f5f7fa] min-h-screen">
      <Navigation />

      <div className="max-w-[900px] mx-auto mt-10 bg-white shadow-md p-8 rounded-md">
        <h1 className="text-2xl font-semibold text-[#000000] mb-6">
          Curfew Extension Request
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Case Worker */}
          <div>
            <label className="font-medium text-gray-700">Case Worker *</label>
            <select
              value={formData.caseWorker}
              onChange={(e) =>
                setFormData({ ...formData, caseWorker: e.target.value })
              }
              className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="" disabled>
                Select Case Worker
              </option>

              {caseWorkers.map((cw: any) => (
                <option key={cw.id} value={cw.name}>
                  {cw.name}
                </option>
              ))}
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="font-medium text-gray-700">Start Date *</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="font-medium text-gray-700">End Date *</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          {/* Time */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="font-medium text-gray-700">Start Time *</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) =>
                  setFormData({ ...formData, startTime: e.target.value })
                }
                className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="font-medium text-gray-700">End Time *</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) =>
                  setFormData({ ...formData, endTime: e.target.value })
                }
                className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="font-medium text-gray-700">Reason *</label>
            <input
              type="text"
              placeholder="e.g., Medical appointment, job interview"
              value={formData.reason}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
              className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Signature */}
          <div>
            <label className="font-medium text-gray-700">
              Signature (Full Name) *
            </label>
            <input
              type="text"
              placeholder="Your full name"
              value={formData.signature}
              onChange={(e) =>
                setFormData({ ...formData, signature: e.target.value })
              }
              className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-[#29abe2] text-white px-6 py-3 rounded-md hover:bg-[#218ebb]"
            >
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
