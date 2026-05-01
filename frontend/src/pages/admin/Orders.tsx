import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Search, UserCheck, X, Package, MapPin, User } from "lucide-react";
import {
  getAllOrdersApi,
  updateOrderStatusApi,
  assignDriverApi,
} from "../../api/orders";
import { getAllDriversApi } from "../../api/drivers";
import toast from "react-hot-toast";

const statusColor: Record<string, string> = {
  pending:    "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  processing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  dispatched: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  delivered:  "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  cancelled:  "bg-red-500/10 text-red-400 border-red-500/20",
};

const statuses = ["pending", "processing", "dispatched", "delivered", "cancelled"];

export default function AdminOrders() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [detailModal, setDetailModal] = useState(false);
  const [driverModal, setDriverModal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["orders", page],
    queryFn: () => getAllOrdersApi(page),
  });

  const { data: driversData } = useQuery({
    queryKey: ["drivers"],
    queryFn: () => getAllDriversApi(),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateOrderStatusApi(id, status),
    onSuccess: () => {
      toast.success("Status updated");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: () => toast.error("Failed to update status"),
  });

  const assignDriver = useMutation({
    mutationFn: ({ id, driverId }: { id: string; driverId: string }) =>
      assignDriverApi(id, driverId),
    onSuccess: () => {
      toast.success("Driver assigned");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setDriverModal(false);
    },
    onError: () => toast.error("Failed to assign driver"),
  });

  const orders = data?.orders || [];
  const filtered = orders.filter(
    (o: any) =>
      o.trackingNumber?.toLowerCase().includes(search.toLowerCase()) ||
      o.customer?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-white/40 text-sm mt-0.5">
            Click any order to view full details
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
        />
        <input
          type="text"
          placeholder="Search by tracking number or customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-9 max-w-md"
        />
      </div>

      {/* Table */}
      <div className="glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-4 py-3 text-white/40 font-medium">Tracking</th>
                <th className="text-left px-4 py-3 text-white/40 font-medium">Customer</th>
                <th className="text-left px-4 py-3 text-white/40 font-medium">Driver</th>
                <th className="text-left px-4 py-3 text-white/40 font-medium">Total</th>
                <th className="text-left px-4 py-3 text-white/40 font-medium">Status</th>
                <th className="text-left px-4 py-3 text-white/40 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-white/30">
                    Loading...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-white/30">
                    No orders found
                  </td>
                </tr>
              ) : (
                filtered.map((order: any, i: number) => (
                  <motion.tr
                    key={order._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => {
                      setSelectedOrder(order);
                      setDetailModal(true);
                    }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3 font-mono text-white/70 text-xs">
                      {order.trackingNumber}
                    </td>
                    <td className="px-4 py-3 text-white/80">
                      {order.customer?.name || "—"}
                    </td>
                    <td className="px-4 py-3 text-white/60">
                      {order.driver?.name || (
                        <span className="text-white/20">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-white/70">
                      £{order.totalPrice?.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge border ${statusColor[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td
                      className="px-4 py-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-2">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            updateStatus.mutate({
                              id: order._id,
                              status: e.target.value,
                            })
                          }
                          className="text-xs bg-surface-200 border border-white/10 rounded-lg px-2 py-1 text-white/60 focus:outline-none focus:border-brand-500/40 cursor-pointer"
                        >
                          {statuses.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setDriverModal(true);
                          }}
                          className="p-1.5 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 transition-colors"
                          title="Assign Driver"
                        >
                          <UserCheck size={13} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
          <span className="text-xs text-white/30">
            Page {page} of {data?.totalPages || 1}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-ghost text-xs px-3 py-1.5 disabled:opacity-30"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= (data?.totalPages || 1)}
              className="btn-ghost text-xs px-3 py-1.5 disabled:opacity-30"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {detailModal && selectedOrder && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="font-bold text-lg">Order Details</h3>
                  <p className="text-xs font-mono text-brand-400 mt-0.5">
                    {selectedOrder.trackingNumber}
                  </p>
                </div>
                <button
                  onClick={() => setDetailModal(false)}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-white/40"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Status */}
              <div className="flex items-center gap-2 mb-5">
                <span className={`badge border ${statusColor[selectedOrder.status]}`}>
                  {selectedOrder.status}
                </span>
                <span className="text-xs text-white/30">
                  {new Date(selectedOrder.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                </span>
              </div>

              {/* Customer & Driver */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <User size={12} className="text-white/30" />
                    <p className="text-xs text-white/30">Customer</p>
                  </div>
                  <p className="text-sm font-medium">
                    {selectedOrder.customer?.name || "—"}
                  </p>
                  <p className="text-xs text-white/40 mt-0.5">
                    {selectedOrder.customer?.email || "—"}
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <User size={12} className="text-white/30" />
                    <p className="text-xs text-white/30">Driver</p>
                  </div>
                  <p className="text-sm font-medium">
                    {selectedOrder.driver?.name || "Not assigned"}
                  </p>
                  <p className="text-xs text-white/40 mt-0.5">
                    {selectedOrder.driver?.email || "—"}
                  </p>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-white/5 rounded-lg p-3 mb-4 flex items-start gap-2">
                <MapPin size={13} className="text-brand-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-white/30 mb-0.5">Delivery Address</p>
                  <p className="text-sm text-white/80">
                    {selectedOrder.deliveryAddress}
                  </p>
                </div>
              </div>

              {/* Items */}
              <div className="mb-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <Package size={13} className="text-white/30" />
                  <p className="text-xs text-white/30">Order Items</p>
                </div>
                <div className="flex flex-col gap-2">
                  {selectedOrder.items?.map((item: any, i: number) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-2.5 px-3 bg-white/5 rounded-lg border border-white/5"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {item.product?.name || "Product"}
                        </p>
                        <p className="text-xs text-white/40 mt-0.5">
                          {item.product?.category || "—"} · Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-mono text-brand-400">
                          £{(item.price * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-xs text-white/30">
                          £{item.price} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between py-3 px-4 bg-brand-500/10 border border-brand-500/20 rounded-lg">
                <span className="text-sm font-medium">Total Amount</span>
                <span className="text-lg font-bold font-mono text-brand-400">
                  £{selectedOrder.totalPrice?.toFixed(2)}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setDetailModal(false)}
                  className="btn-ghost flex-1"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setDetailModal(false);
                    setDriverModal(true);
                  }}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <UserCheck size={14} />
                  Assign Driver
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Assign Driver Modal */}
      <AnimatePresence>
        {driverModal && selectedOrder && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass p-6 w-full max-w-sm"
            >
              <h3 className="font-semibold mb-1">Assign Driver</h3>
              <p className="text-xs text-white/40 mb-4">
                Order: {selectedOrder.trackingNumber}
              </p>
              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                {driversData?.drivers?.map((driver: any) => (
                  <button
                    key={driver._id}
                    onClick={() =>
                      assignDriver.mutate({
                        id: selectedOrder._id,
                        driverId: driver.user._id,
                      })
                    }
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 border border-white/5 transition-colors text-left"
                  >
                    <div className="w-7 h-7 rounded-full bg-orange-500/20 flex items-center justify-center">
                      <span className="text-orange-400 text-xs font-bold">
                        {driver.user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{driver.user?.name}</p>
                      <p className="text-xs text-white/40">{driver.vehicleType}</p>
                    </div>
                  </button>
                ))}
                {!driversData?.drivers?.length && (
                  <p className="text-white/30 text-sm text-center py-4">
                    No drivers available
                  </p>
                )}
              </div>
              <button
                onClick={() => setDriverModal(false)}
                className="btn-ghost w-full mt-4"
              >
                Cancel
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}