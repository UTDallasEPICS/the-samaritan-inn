import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * Gets the current session.
 */
export async function getSession() {
  return await getServerSession(authOptions);
}

/**
 * Gets the current authenticated user.
 */
export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

/**
 * Restricts access to authenticated residents or users.
 */
export async function requireUser() {
  const user = await getCurrentUser();

  if (!user || (user.role !== "user" && user.role !== "resident")) {
    redirect("/unauthorized");
  }

  return user;
}

/**
 * Restricts access to admin users only.
 */
export async function requireAdmin() {
  const user = await getCurrentUser();

  if (!user || user.role !== "admin") {
    redirect("/unauthorized");
  }

  return user;
}
