import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Wallet, TrendingUp, Package, Star } from "lucide-react";
import { getDriverEarningsApi } from "../../api/drivers";

export default function DriverEarnings() {
  const { data, isLoading } = useQuery({
    queryKey: ["driverEarnings"],
    queryFn: () => getDriverEarningsApi(),
  });

  const profile  = data?.profile;
  const orders   = data?.orders || [];
  const total    = profile?.earnings || 0;
  const delivered = orders.filter((o: any) => o.status === "delivered").length;
  const avg      = delivered > 0 ? total / delivered : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Earnings</h1>
        <p className="text-white/40 text-sm mt-0.5">
          Your delivery earnings overview
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Total Earnings",
            value: `£${total.toFixed(2)}`,
            icon: Wallet,
            color: "text-emerald-400",
            border: "border-emerald-500/20",
            bg: "bg-emerald-500/10",
          },
          {
            label: "Deliveries",
            value: delivered,
            icon: Package,
            color: "text-brand-400",
            border: "border-brand-500/20",
            bg: "bg-brand-500/10",
          },
          {
            label: "Avg Per Delivery",
            value: `£${avg.toFixed(2)}`,
            icon: TrendingUp,
            color: "text-purple-400",
            border: "border-purple-500/20",
            bg: "bg-purple-500/10",
          },
          {
            label: "Rating",
            value: profile?.rating?.toFixed(1) || "0.0",
            icon: Star,
            color: "text-yellow-400",
            border: "border-yellow-500/20",
            bg: "bg-yellow-500/10",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`stat-card border ${stat.border}`}
          >
            <div
              className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}
            >
              <stat.icon size={16} className={stat.color} />
            </div>
            <p className={`text-2xl font-bold font-mono ${stat.color}`}>
              {stat.value}
            </p>
            <p className="text-xs text-white/40">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Delivered Orders */}
      <div className="glass p-5">
        <h2 className="text-sm font-semibold text-white/70 mb-4">
          Delivery History
        </h2>

        {isLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 bg-white/5 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-8">
            No deliveries yet
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {orders.map((order: any, i: number) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-white/5 border border-white/5 transition-colors"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-mono text-white/80">
                    {order.trackingNumber}
                  </span>
                  <span className="text-xs text-white/40">
                    {new Date(order.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm text-emerald-400">
                    £{order.totalPrice?.toFixed(2)}
                  </span>
                  <span className="badge border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                    delivered
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}