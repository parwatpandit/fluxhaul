import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { MapPin, CheckCircle, Truck } from "lucide-react";
import {
  getAssignedOrdersApi,
  updateDeliveryStatusApi,
} from "../../api/orders";
import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";

const statusColor: Record<string, string> = {
  pending:    "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  processing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  dispatched: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  delivered:  "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  cancelled:  "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function DriverOrders() {
  const queryClient = useQueryClient();
  const { token } = useAuthStore();
  const socketRef = useRef<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["assignedOrders"],
    queryFn: () => getAssignedOrdersApi(),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateDeliveryStatusApi(id, status),
    onSuccess: () => {
      toast.success("Status updated");
      queryClient.invalidateQueries({ queryKey: ["assignedOrders"] });
    },
    onError: () => toast.error("Failed to update status"),
  });

  // Send live location every 3 seconds
  useEffect(() => {
    if (!token) return;

    const socket = io("http://localhost:8000", { auth: { token } });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("driverJoin");
    });

    const interval = setInterval(() => {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition((pos) => {
        socket.emit("updateLocation", {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      });
    }, 3000);

    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, [token]);

  const orders = Array.isArray(data) ? data : data?.orders || [];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Orders</h1>
          <p className="text-white/40 text-sm mt-0.5">
            Your assigned deliveries
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
          <span className="text-xs text-white/40">Location Broadcasting</span>
        </div>
      </div>

      {/* Orders */}
      <div className="flex flex-col gap-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass p-5 animate-pulse h-40" />
          ))
        ) : orders.length === 0 ? (
          <div className="glass p-10 text-center">
            <Truck size={32} className="text-white/20 mx-auto mb-3" />
            <p className="text-white/30 text-sm">No orders assigned yet</p>
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
              {/* Top */}
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-sm text-white/80">
                    {order.trackingNumber}
                  </p>
                  <p className="text-xs text-white/40 mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <span className={`badge border ${statusColor[order.status]}`}>
                  {order.status}
                </span>
              </div>

              {/* Customer & Address */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/3 rounded-lg p-3">
                  <p className="text-xs text-white/30">Customer</p>
                  <p className="text-sm font-medium mt-0.5">
                    {order.customer?.name || "—"}
                  </p>
                </div>
                <div className="bg-white/3 rounded-lg p-3">
                  <p className="text-xs text-white/30">Total</p>
                  <p className="text-sm font-bold font-mono text-brand-400 mt-0.5">
                    £{order.totalPrice?.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-center gap-1.5 text-xs text-white/30">
                <MapPin size={11} />
                {order.deliveryAddress}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-1">
                {order.status === "processing" && (
                  <button
                    onClick={() =>
                      updateStatus.mutate({
                        id: order._id,
                        status: "dispatched",
                      })
                    }
                    disabled={updateStatus.isPending}
                    className="btn-primary flex items-center gap-1.5 flex-1 justify-center"
                  >
                    <Truck size={13} />
                    Mark as Dispatched
                  </button>
                )}
                {order.status === "dispatched" && (
                  <button
                    onClick={() =>
                      updateStatus.mutate({
                        id: order._id,
                        status: "delivered",
                      })
                    }
                    disabled={updateStatus.isPending}
                    className="flex items-center gap-1.5 flex-1 justify-center px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg text-sm font-medium transition-colors"
                  >
                    <CheckCircle size={13} />
                    Mark as Delivered
                  </button>
                )}
                {order.status === "delivered" && (
                  <div className="flex items-center gap-1.5 text-emerald-400 text-sm">
                    <CheckCircle size={13} />
                    Delivered
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}