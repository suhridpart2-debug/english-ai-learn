import { supabaseAdmin } from "@/lib/supabase/admin";
import { 
  CreditCard, 
  ArrowLeft,
  Calendar,
  User as UserIcon
} from "lucide-react";
import Link from "next/link";

export default async function AdminPaymentsPage() {
  const { data: payments, error } = await supabaseAdmin
    .from("payment_history")
    .select("*, profiles(name, email)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Payment History</h1>
          <p className="text-slate-500">Full audit trail of all transactions.</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/80">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">User</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Amount</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Gateway IDs</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {payments && payments.length > 0 ? (
                payments.map((payment: any) => (
                  <tr key={payment.id} className="hover:bg-slate-50 transition-colors dark:hover:bg-slate-800/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800">
                          <UserIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{payment.profiles?.name || 'Unknown'}</p>
                          <p className="text-xs text-slate-500">{payment.profiles?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <p className="font-bold text-slate-900 dark:text-white">₹{payment.amount / 100}</p>
                       <p className="text-xs text-slate-500 italic">{payment.plan_name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium uppercase text-green-600 bg-green-50 dark:bg-green-900/20">
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-mono text-slate-400">P: {payment.gateway_payment_id || 'N/A'}</p>
                      <p className="text-xs font-mono text-slate-400">O: {payment.gateway_order_id || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                      {new Date(payment.paid_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No payment history records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
