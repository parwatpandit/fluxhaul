import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Package, MapPin, Star } from "lucide-react";
import { getMyOrdersApi } from "../../api/orders";
import { Link } from "react-router-dom";
import axios from "../../api/axios";
import toast from "react-hot-toast";

const statusColor: Record<string, string> = {
  pending:    "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  processing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  dispatched: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  delivered:  "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  cancelled:  "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function CustomerOrders() {
  const [page, setPage] = useState(1);
  const [ratingOrder, setRatingOrder] = useState<string | null>(null);
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["myOrders", page],
    queryFn: () => getMyOrdersApi(page),
  });

  const submitRating = useMutation({
    mutationFn: ({ orderId, rating }: { orderId: string; rating: number }) =>
      axios.post(`/orders/${orderId}/rate`, { rating }),
    onSuccess: () => {
      toast.success("Rating submitted!");
      setRatingOrder(null);
      setSelectedRating(0);
      queryClient.invalidateQueries({ queryKey: ["myOrders"] });
    },
    onError: () => toast.error("Failed to submit rating"),
  });

  const orders = data?.orders || [];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">My Orders</h1>
        <p className="text-white/40 text-sm mt-0.5">
          Track and manage your orders
        </p>
      </div>

      {/* Orders List */}
      <div className="flex flex-col gap-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass p-5 animate-pulse h-32" />
          ))
        ) : orders.length === 0 ? (
          <div className="glass p-10 text-center">
            <Package size={32} className="text-white/20 mx-auto mb-3" />
            <p className="text-white/30 text-sm">No orders yet</p>
            <Link
              to="/customer/products"
              className="text-brand-400 text-sm hover:text-brand-300 transition-colors mt-1 inline-block"
            >
              Start shopping →
            </Link>
          </div>
        ) : (
          orders.map((order: any, i: number) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass p-5 flex flex-col gap-4 hover:border-white/20 transition-all"
            >
              {/* Top Row */}
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-sm text-white/80">
                    {order.trackingNumber}
                  </p>
                  <p className="text-xs text-white/40 mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </p>
                </div>
                <span className={`badge border ${statusColor[order.status]}`}>
                  {order.status}
                </span>
              </div>

              {/* Items */}
              <div className="flex flex-col gap-1.5">
                {order.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="text-white/60">
                      {item.product?.name || "Product"} × {item.quantity}
                    </span>
                    <span className="font-mono text-white/40">
                      £{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Bottom Row */}
              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-xs text-white/30">Total</p>
                    <p className="font-bold font-mono text-brand-400">
                      £{order.totalPrice?.toFixed(2)}
                    </p>
                  </div>
                  {order.driver && (
                    <div>
                      <p className="text-xs text-white/30">Driver</p>
                      <p className="text-sm text-white/60">{order.driver?.name}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {order.status === "dispatched" && (
                    <Link
                      to={`/customer/track/${order._id}`}
                      className="btn-primary flex items-center gap-1.5 text-xs"
                    >
                      <MapPin size={12} />
                      Track Live
                    </Link>
                  )}

                  {order.status === "delivered" && !order.isRated && (
                    <button
                      onClick={() => setRatingOrder(order._id)}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 transition-colors"
                    >
                      <Star size={12} />
                      Rate Driver
                    </button>
                  )}

                  {order.status === "delivered" && order.isRated && (
                    <div className="flex items-center gap-1 text-xs text-yellow-400">
                      <Star size={12} fill="currentColor" />
                      <span>Rated {order.driverRating}/5</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Rating UI */}
              {ratingOrder === order._id && (
                <div className="pt-3 border-t border-white/5">
                  <p className="text-sm text-white/60 mb-3">Rate your driver:</p>
                  <div className="flex items-center gap-2 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setSelectedRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          size={28}
                          className={
                            star <= (hoveredRating || selectedRating)
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-white/20"
                          }
                        />
                      </button>
                    ))}
                    {selectedRating > 0 && (
                      <span className="text-sm text-white/40 ml-1">
                        {["", "Poor", "Fair", "Good", "Great", "Excellent"][selectedRating]}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setRatingOrder(null);
                        setSelectedRating(0);
                      }}
                      className="btn-ghost text-xs px-3 py-1.5"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() =>
                        submitRating.mutate({ orderId: order._id, rating: selectedRating })
                      }
                      disabled={selectedRating === 0 || submitRating.isPending}
                      className="btn-primary text-xs px-3 py-1.5 disabled:opacity-30"
                    >
                      Submit Rating
                    </button>
                  </div>
                </div>
              )}

              {/* Delivery Address */}
              <div className="flex items-center gap-1.5 text-xs text-white/30">
                <MapPin size={11} />
                {order.deliveryAddress}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Pagination */}
      {orders.length > 0 && (
        <div className="flex items-center justify-between">
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
      )}
    </div>
  );
}