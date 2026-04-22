import { fetchAdminStats } from "@/lib/actions/adminActions";
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  ShieldCheck,
  ChevronRight,
  BarChart3
} from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  const stats = await fetchAdminStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Admin Overview</h1>
        <p className="text-slate-500 dark:text-slate-400">Welcome back. Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-blue-100 p-3 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Users</p>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalUsers}</h2>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-purple-100 p-3 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Premium Users</p>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.premiumUsers}</h2>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-green-100 p-3 text-green-600 dark:bg-green-900/30 dark:text-green-400">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Conversion Rate</p>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.totalUsers > 0 
                  ? ((stats.premiumUsers / stats.totalUsers) * 100).toFixed(1) 
                  : 0}%
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Payments Section */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
        <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Payments</h3>
          <Link href="/admin/payments" className="text-sm font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400">
            View all
          </Link>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {stats.recentPayments.length > 0 ? (
            stats.recentPayments.map((payment: any) => (
              <div key={payment.id} className="flex items-center justify-between p-6 hover:bg-slate-50 transition-colors dark:hover:bg-slate-800/50">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center dark:bg-slate-800">
                    <CreditCard className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{payment.profiles?.name || 'Unknown'}</p>
                    <p className="text-xs text-slate-500">{new Date(payment.paid_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900 dark:text-white">₹{payment.amount / 100}</p>
                  <p className="text-xs text-green-500 font-medium uppercase">{payment.status}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-500">No recent payments found.</div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
         <Link 
            href="/admin/users" 
            className="group flex items-center justify-between p-6 rounded-2xl bg-orange-600 text-white hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/20"
         >
            <div className="flex items-center gap-4">
               <div className="p-3 bg-white/20 rounded-xl">
                  <Users className="h-6 w-6" />
               </div>
               <div>
                  <h3 className="font-bold text-lg">Manage All Users</h3>
                  <p className="text-white/80 text-sm">View details, activity, and update plans.</p>
               </div>
            </div>
            <ChevronRight className="h-6 w-6 opacity-50 group-hover:opacity-100 transition-opacity" />
         </Link>

         <div 
            className="flex items-center justify-between p-6 rounded-2xl bg-white border border-slate-200 dark:bg-slate-900/50 dark:border-slate-800 opacity-60 grayscale cursor-not-allowed"
         >
            <div className="flex items-center gap-4">
               <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400">
                  <BarChart3 className="h-6 w-6" />
               </div>
               <div>
                  <h3 className="font-bold text-lg">Detailed Analytics</h3>
                  <p className="text-slate-500 text-sm italic">Coming soon: Voice activity metrics.</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
