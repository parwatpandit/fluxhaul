import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  Users,
  Package,
  Warehouse,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { getAllOrdersApi } from "../../api/orders";
import { getAllDriversApi } from "../../api/drivers";
import { getProductsApi } from "../../api/products";
import { getWarehousesApi } from "../../api/warehouses";

const statusColor: Record<string, string> = {
  pending:    "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  processing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  dispatched: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  delivered:  "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  cancelled:  "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function AdminDashboard() {
  const { data: ordersData }    = useQuery({ queryKey: ["orders"],     queryFn: () => getAllOrdersApi() });
  const { data: driversData }   = useQuery({ queryKey: ["drivers"],    queryFn: () => getAllDriversApi() });
  const { data: productsData }  = useQuery({ queryKey: ["products"],   queryFn: () => getProductsApi() });
  const { data: warehousesData }= useQuery({ queryKey: ["warehouses"], queryFn: () => getWarehousesApi() });

  const orders     = ordersData?.orders     || [];
  const drivers    = driversData?.drivers   || [];
  const products   = productsData?.products || [];
  const warehouses = warehousesData         || [];

  const totalRevenue = orders.reduce((sum: number, o: any) => sum + (o.totalPrice || 0), 0);
  const pendingOrders   = orders.filter((o: any) => o.status === "pending").length;
  const deliveredOrders = orders.filter((o: any) => o.status === "delivered").length;
  const lowStock        = products.filter((p: any) => p.stock <= p.threshold).length;

  const stats = [
    {
      label: "Total Orders",
      value: orders.length,
      icon: ShoppingCart,
      color: "text-brand-400",
      bg: "bg-brand-500/10",
      border: "border-brand-500/20",
    },
    {
      label: "Total Revenue",
      value: `£${totalRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      label: "Active Drivers",
      value: drivers.length,
      icon: Users,
      color: "text-orange-400",
      bg: "bg-orange-500/10",
      border: "border-orange-500/20",
    },
    {
      label: "Products",
      value: products.length,
      icon: Package,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
    },
    {
      label: "Warehouses",
      value: warehouses.length,
      icon: Warehouse,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      label: "Pending Orders",
      value: pendingOrders,
      icon: Clock,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/20",
    },
    {
      label: "Delivered",
      value: deliveredOrders,
      icon: CheckCircle,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      label: "Low Stock",
      value: lowStock,
      icon: AlertTriangle,
      color: "text-red-400",
      bg: "bg-red-500/10",
      border: "border-red-500/20",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-white/40 text-sm mt-0.5">
          Welcome back — here's what's happening
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`stat-card border ${stat.border}`}
          >
            <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
              <stat.icon size={16} className={stat.color} />
            </div>
            <p className="text-2xl font-bold font-mono">{stat.value}</p>
            <p className="text-xs text-white/40">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="glass p-5">
        <h2 className="text-sm font-semibold mb-4 text-white/70">
          Recent Orders
        </h2>
        <div className="flex flex-col gap-2">
          {orders.slice(0, 8).map((order: any, i: number) => (
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
                  {order.customer?.name || "Customer"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-mono text-white/60">
                  £{order.totalPrice?.toFixed(2)}
                </span>
                <span
                  className={`badge border ${statusColor[order.status] || "bg-white/5 text-white/40"}`}
                >
                  {order.status}
                </span>
              </div>
            </motion.div>
          ))}
          {orders.length === 0 && (
            <p className="text-white/30 text-sm text-center py-6">
              No orders yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
}