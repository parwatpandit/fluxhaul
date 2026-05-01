import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { getAllOrdersApi } from "../../api/orders";
import { getProductsApi } from "../../api/products";

const COLORS = ["#06b6d4", "#22d3ee", "#0891b2", "#0e7490", "#155e75"];

export default function AdminAnalytics() {
  const { data: ordersData } = useQuery({
    queryKey: ["orders"],
    queryFn: () => getAllOrdersApi(),
  });

  const { data: productsData } = useQuery({
    queryKey: ["products"],
    queryFn: () => getProductsApi(),
  });

  const orders = ordersData?.orders || [];
  const products = productsData?.products || [];

  // Revenue by day
  const revenueByDay = orders.reduce((acc: any, order: any) => {
    const date = new Date(order.createdAt).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    });
    acc[date] = (acc[date] || 0) + (order.totalPrice || 0);
    return acc;
  }, {});

  const revenueData = Object.entries(revenueByDay).map(([date, revenue]) => ({
    date,
    revenue,
  }));

  // Orders by status
  const statusCount = orders.reduce((acc: any, order: any) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});

  const statusData = Object.entries(statusCount).map(([name, value]) => ({
    name,
    value,
  }));

  // Top products by category
  const categoryCount = products.reduce((acc: any, product: any) => {
    acc[product.category] = (acc[product.category] || 0) + 1;
    return acc;
  }, {});

  const categoryData = Object.entries(categoryCount).map(([name, count]) => ({
    name,
    count,
  }));

  const totalRevenue = orders.reduce(
    (sum: number, o: any) => sum + (o.totalPrice || 0),
    0
  );
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-white/40 text-sm mt-0.5">
          Business performance overview
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Total Revenue",
            value: `£${totalRevenue.toLocaleString()}`,
            color: "text-emerald-400",
            border: "border-emerald-500/20",
          },
          {
            label: "Total Orders",
            value: orders.length,
            color: "text-brand-400",
            border: "border-brand-500/20",
          },
          {
            label: "Avg Order Value",
            value: `£${avgOrderValue.toFixed(2)}`,
            color: "text-purple-400",
            border: "border-purple-500/20",
          },
          {
            label: "Total Products",
            value: products.length,
            color: "text-orange-400",
            border: "border-orange-500/20",
          },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`stat-card border ${kpi.border}`}
          >
            <p className={`text-2xl font-bold font-mono ${kpi.color}`}>
              {kpi.value}
            </p>
            <p className="text-xs text-white/40">{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Revenue Chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass p-5"
      >
        <h2 className="text-sm font-semibold mb-4 text-white/70">
          Revenue Over Time
        </h2>
        {revenueData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-white/20 text-sm">
            No data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="date"
                tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `£${v}`}
              />
              <Tooltip
                contentStyle={{
                  background: "#161616",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "rgba(255,255,255,0.6)" }}
                itemStyle={{ color: "#06b6d4" }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#06b6d4"
                strokeWidth={2}
                fill="url(#revenueGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Bottom Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Orders by Status */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass p-5"
        >
          <h2 className="text-sm font-semibold mb-4 text-white/70">
            Orders by Status
          </h2>
          {statusData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-white/20 text-sm">
              No data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusData.map((_: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#161616",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
          {/* Legend */}
          <div className="flex flex-wrap gap-2 mt-2">
            {statusData.map((s: any, i: number) => (
              <div key={s.name} className="flex items-center gap-1.5">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: COLORS[i % COLORS.length] }}
                />
                <span className="text-xs text-white/40 capitalize">
                  {s.name} ({s.value})
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Products by Category */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass p-5"
        >
          <h2 className="text-sm font-semibold mb-4 text-white/70">
            Products by Category
          </h2>
          {categoryData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-white/20 text-sm">
              No data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={categoryData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "#161616",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  itemStyle={{ color: "#06b6d4" }}
                />
                <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>
    </div>
  );
}