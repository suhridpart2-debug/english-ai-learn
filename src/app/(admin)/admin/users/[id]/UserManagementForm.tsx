"use client";

import { useState } from "react";
import { ShieldAlert, Save, Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { deleteUser, updateUserSubscription } from "@/lib/actions/adminActions";

export function UserManagementForm({ user }: { user: any }) {
  const [plan, setPlan] = useState(user.plan || "free");
  const [status, setStatus] = useState(user.subscription_status || "inactive");
  const [endDate, setEndDate] = useState(
    user.subscription_end_date 
      ? new Date(user.subscription_end_date).toISOString().split('T')[0] 
      : ""
  );
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      await updateUserSubscription(user.id, {
        plan,
        subscription_status: status,
        subscription_end_date: endDate || null,
      });
      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert("Failed to update user subscription");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`ARE YOU SURE? This will permanently delete ${user.name} and ALL their data. This cannot be undone.`)) {
      return;
    }

    setDeleting(true);
    try {
      await deleteUser(user.id);
      router.push("/admin/users");
      router.refresh();
    } catch (err) {
      alert("Failed to delete user");
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-orange-200 bg-orange-50 p-6 dark:border-orange-900/30 dark:bg-orange-950/20">
        <div className="mb-4 flex items-center gap-2 text-orange-600 dark:text-orange-400">
          <ShieldAlert className="h-5 w-5" />
          <h3 className="font-bold">Subscription Control</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">Plan Type</label>
            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white p-2 text-sm focus:border-orange-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900"
            >
              <option value="free">Free</option>
              <option value="premium">Premium</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">Subscription Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white p-2 text-sm focus:border-orange-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">Expiry Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white p-2 text-sm focus:border-orange-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900"
            />
          </div>

          <button
            type="submit"
            disabled={loading || deleting}
            className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all ${
              success 
                ? 'bg-green-600 text-white' 
                : 'bg-orange-600 text-white hover:bg-orange-700'
            } disabled:opacity-50`}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : success ? (
              "Successfully Updated!"
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900/30 dark:bg-red-950/20">
        <div className="mb-4 flex items-center gap-2 text-red-600 dark:text-red-400">
          <Trash2 className="h-5 w-5" />
          <h3 className="font-bold font-display">Danger Zone</h3>
        </div>
        <p className="text-xs text-red-600/70 dark:text-red-400/70 mb-4">
          Deleting a user is permanent and cannot be undone. All their history and progress will be lost.
        </p>
        <button
          onClick={handleDelete}
          disabled={loading || deleting}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white py-2.5 text-sm font-bold text-red-600 transition-all hover:bg-red-600 hover:text-white dark:border-red-900/40 dark:bg-red-950 dark:hover:bg-red-600"
        >
          {deleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Trash2 className="h-4 w-4" />
              Delete User Account
            </>
          )}
        </button>
      </div>
    </div>
  );
}
