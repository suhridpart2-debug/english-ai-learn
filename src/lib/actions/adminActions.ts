"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function updateUserSubscription(
  userId: string,
  updates: {
    plan?: string;
    subscription_status?: string;
    subscription_end_date?: string | null;
  }
) {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select();

  if (error) {
    console.error("Error updating user subscription:", error);
    throw new Error(error.message);
  }

  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin/users");
  return data;
}

export async function deleteUser(userId: string) {
  // 1. Delete from Auth (this cascades to profiles and other linked tables)
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (error) {
    console.error("Error deleting user:", error);
    throw new Error(error.message);
  }

  revalidatePath("/admin/users");
  return { success: true };
}

export async function fetchAdminStats() {
  // Fetch total users
  const { count: totalUsers } = await supabaseAdmin
    .from("profiles")
    .select("*", { count: "exact", head: true });

  // Fetch premium users
  const { count: premiumUsers } = await supabaseAdmin
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("plan", "premium");

  // Fetch recent payments
  const { data: recentPayments } = await supabaseAdmin
    .from("payment_history")
    .select("*, profiles(name)")
    .order("created_at", { ascending: false })
    .limit(5);

  return {
    totalUsers: totalUsers || 0,
    premiumUsers: premiumUsers || 0,
    recentPayments: recentPayments || [],
  };
}

export async function fetchAllUsers(query: string = "") {
  let q = supabaseAdmin.from("admin_users_view").select("*");

  if (query) {
    q = q.or(`name.ilike.%${query}%,email.ilike.%${query}%`);
  }

  const { data, error } = await q.order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching users:", error);
    throw new Error(error.message);
  }

  return data;
}

export async function fetchUserDetail(userId: string) {
  const { data: profile, error: profileError } = await supabaseAdmin
    .from("admin_users_view")
    .select("*")
    .eq("id", userId)
    .single();

  if (profileError) throw profileError;

  const { data: usage } = await supabaseAdmin
    .from("daily_usage")
    .select("*")
    .eq("user_id", userId)
    .order("usage_date", { ascending: false })
    .limit(30);

  const { data: payments } = await supabaseAdmin
    .from("payment_history")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const { data: activities } = await supabaseAdmin
    .from("user_activities")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  return {
    profile,
    usage: usage || [],
    payments: payments || [],
    activities: activities || [],
  };
}
