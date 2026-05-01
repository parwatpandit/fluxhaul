import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ShoppingCart, Clock, CheckCircle, Package } from "lucide-react";
import { getMyOrdersApi } from "../../api/orders";
import { useAuthStore } from "../../store/authStore";
import { Link } from "react-router-dom";

const statusColor: Record<string, string> = {
  pending:    "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  processing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  dispatched: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  delivered:  "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  cancelled:  "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function CustomerDashboard() {
  const { user } = useAuthStore();
  const { data, isLoading } = useQuery({
    queryKey: ["myOrders"],
    queryFn: () => getMyOrdersApi(),
  });

  const orders = data?.orders || [];
  const pending   = orders.filter((o: any) => o.status === "pending").length;
  const delivered = orders.filter((o: any) => o.status === "delivered").length;
  const dispatched = orders.filter((o: any) => o.status === "dispatched").length;

  const stats = [
    {
      label: "Total Orders",
      value: orders.length,
      icon: ShoppingCart,
      color: "text-brand-400",
      border: "border-brand-500/20",
      bg: "bg-brand-500/10",
    },
    {
      label: "Pending",
      value: pending,
      icon: Clock,
      color: "text-yellow-400",
      border: "border-yellow-500/20",
      bg: "bg-yellow-500/10",
    },
    {
      label: "On The Way",
      value: dispatched,
      icon: Package,
      color: "text-purple-400",
      border: "border-purple-500/20",
      bg: "bg-purple-500/10",
    },
    {
      label: "Delivered",
      value: delivered,
      icon: CheckCircle,
      color: "text-emerald-400",
      border: "border-emerald-500/20",
      bg: "bg-emerald-500/10",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-white/40 text-sm mt-0.5">
            Here's your order summary
          </p>
        </div>
        <Link to="/customer/products" className="btn-primary">
          Shop Now
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`stat-card border ${stat.border}`}
          >
            <div
              className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}
            >
              <stat.icon size={16} className={stat.color} />
            </div>
            <p className="text-2xl font-bold font-mono">{stat.value}</p>
            <p className="text-xs text-white/40">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="glass p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white/70">Recent Orders</h2>
          <Link
            to="/customer/orders"
            className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
          >
            View all →
          </Link>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-14 bg-white/5 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-white/30 text-sm">No orders yet</p>
            <Link
              to="/customer/products"
              className="text-brand-400 text-sm hover:text-brand-300 transition-colors mt-1 inline-block"
            >
              Start shopping →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {orders.slice(0, 5).map((order: any, i: number) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-white/5 transition-colors border border-white/5"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-mono text-white/80">
                    {order.trackingNumber}
                  </span>
                  <span className="text-xs text-white/40">
                    {order.items?.length} item(s) · £{order.totalPrice?.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`badge border ${statusColor[order.status]}`}
                  >
                    {order.status}
                  </span>
                  {order.status === "dispatched" && (
                    <Link
                      to={`/customer/track/${order._id}`}
                      className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
                    >
                      Track →
                    </Link>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}