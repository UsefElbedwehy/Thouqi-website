import "server-only";
import { getCurrentUser } from "@/core/auth/user";

/**
 * Returns the current user if they are an admin, else null. Admin pages/actions
 * call this and redirect/deny when it returns null. Role is read from the
 * `customers.role` profile (RLS owner-scoped read).
 */
export async function getAdminUser() {
  const user = await getCurrentUser();
  if (!user || user.profile?.role !== "admin") return null;
  return user;
}

/** Throwing variant for use inside server actions (mutations). */
export async function assertAdmin() {
  const user = await getAdminUser();
  if (!user) throw new Error("Forbidden: admin only");
  return user;
}
