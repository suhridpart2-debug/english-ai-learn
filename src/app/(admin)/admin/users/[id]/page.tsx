import { fetchUserDetail } from "@/lib/actions/adminActions";
import { 
  ArrowLeft, 
  Calendar, 
  Mail, 
  User as UserIcon,
  CreditCard,
  History,
  Activity,
  MousePointer2,
  Clock
} from "lucide-react";
import Link from "next/link";
import { UserManagementForm } from "./UserManagementForm";

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { profile, usage, payments, activities } = await fetchUserDetail(id);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/users"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{profile.name}</h1>
          <p className="text-slate-500">Manage user access and review activity history.</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Profile Card & Info */}
        <div className="space-y-6 lg:col-span-1">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                <UserIcon className="h-10 w-10" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{profile.name}</h2>
              <p className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                <Mail className="h-3 w-3" /> {profile.email}
              </p>
              
              <div className="mt-4 flex gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${
                  profile.plan === 'premium' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {profile.plan}
                </span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${
                  profile.subscription_status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {profile.subscription_status || 'inactive'}
                </span>
              </div>
            </div>

            <div className="mt-8 space-y-4 border-t border-slate-100 pt-6 dark:border-slate-800">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Joined</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {new Date(profile.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Last Sign In</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {profile.last_sign_in_at ? (
                    <span title={new Date(profile.last_sign_in_at).toLocaleString()}>
                      {(() => {
                        const date = new Date(profile.last_sign_in_at);
                        const diff = Date.now() - date.getTime();
                        const hours = Math.floor(diff / (1000 * 60 * 60));
                        const days = Math.floor(hours / 24);
                        if (days > 0) return `${days}d ago`;
                        if (hours > 0) return `${hours}h ago`;
                        return 'Just now';
                      })()}
                    </span>
                  ) : 'Never'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">End Date</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {profile.subscription_end_date ? new Date(profile.subscription_end_date).toLocaleDateString() : 'None'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Management Form */}
          <UserManagementForm user={profile} />
        </div>

        {/* Activity & Payments */}
        <div className="space-y-6 lg:col-span-2">
          {/* Usage Stats (Last 30 Days) */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
            <div className="flex items-center gap-2 border-b border-slate-100 p-6 dark:border-slate-800">
              <Activity className="h-5 w-5 text-orange-600" />
              <h3 className="font-bold text-slate-900 dark:text-white">Recent Usage (Last 30 Days)</h3>
            </div>
            <div className="p-6">
              {usage.length > 0 ? (
                <div className="space-y-4">
                   <div className="grid grid-cols-3 text-xs font-semibold uppercase text-slate-400">
                      <span>Date</span>
                      <span>AI Messages</span>
                      <span>Vocab Added</span>
                   </div>
                   <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {usage.map((entry: any) => (
                        <div key={entry.id} className="grid grid-cols-3 py-3 text-sm">
                           <span className="text-slate-600 dark:text-slate-400">{entry.usage_date}</span>
                           <span className="font-medium">{entry.ai_messages}</span>
                           <span className="font-medium">{entry.vocab_adds}</span>
                        </div>
                      ))}
                   </div>
                </div>
              ) : (
                <div className="py-8 text-center text-slate-500 italic">No usage recorded yet.</div>
              )}
            </div>
          </div>

          {/* Detailed Activity Log */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
            <div className="flex items-center gap-2 border-b border-slate-100 p-6 dark:border-slate-800">
              <MousePointer2 className="h-5 w-5 text-blue-600" />
              <h3 className="font-bold text-slate-900 dark:text-white">Detailed Activity Log</h3>
            </div>
            <div className="max-h-[400px] overflow-y-auto p-6">
              {activities.length > 0 ? (
                <div className="space-y-6">
                  {activities.map((activity: any, idx: number) => (
                    <div key={activity.id} className="relative flex gap-4">
                      {idx !== activities.length - 1 && (
                        <div className="absolute left-[11px] top-6 h-full w-px bg-slate-100 dark:bg-slate-800" />
                      )}
                      <div className="z-10 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                        <Clock className="h-3 w-3" />
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {activity.description}
                          </p>
                          <span className="text-xs text-slate-400">
                            {new Date(activity.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {new Date(activity.created_at).toLocaleDateString()}
                        </p>
                        {activity.metadata?.url && (
                          <div className="mt-2 text-[10px] font-mono text-slate-400">
                            Path: {activity.metadata.url}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-500 italic">No detailed activity recorded yet.</div>
              )}
            </div>
          </div>

          {/* Payment History */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
            <div className="flex items-center gap-2 border-b border-slate-100 p-6 dark:border-slate-800">
              <History className="h-5 w-5 text-purple-600" />
              <h3 className="font-bold text-slate-900 dark:text-white">Payment History</h3>
            </div>
            <div className="overflow-x-auto">
              {payments.length > 0 ? (
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 text-xs font-semibold uppercase text-slate-500 dark:bg-slate-900/80">
                    <tr>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Gateway ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm dark:divide-slate-800">
                    {payments.map((payment: any) => (
                      <tr key={payment.id}>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                          {new Date(payment.paid_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 font-bold">₹{payment.amount / 100}</td>
                        <td className="px-6 py-4">
                          <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-600 uppercase">
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs font-mono text-slate-400">
                          {payment.gateway_payment_id || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-slate-500 italic">No payment records found.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
