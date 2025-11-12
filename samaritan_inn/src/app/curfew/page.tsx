'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import CurfewExtensionClient from "./CurfewExtensionClient";

export default function CurfewPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Allow only role === "user" or "resident"
  const isUserOrResident =
    session?.user?.role === "user" ||
    session?.user?.role === "resident";

  // Show loading while session loads
  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  // If not logged in → redirect to unauthorized
  if (status === "unauthenticated") {
    router.push("/unauthorized");
    return null;
  }

  // Logged in but wrong role → show restricted box
  if (!isUserOrResident) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white shadow-md p-8 rounded-md text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Access Restricted
          </h2>
          <p className="text-gray-600">
            Only residents/users can access this page.
          </p>
        </div>
      </div>
    );
  }

  // Allowed → show curfew form
  return <CurfewExtensionClient />;
}
