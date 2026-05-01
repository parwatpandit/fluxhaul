import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Truck, Star, Wallet, ToggleLeft, ToggleRight } from "lucide-react";
import {
  getMyDriverProfileApi,
  toggleAvailabilityApi,
  createDriverProfileApi,
} from "../../api/drivers";
import { getAssignedOrdersApi } from "../../api/orders";
import toast from "react-hot-toast";

const statusColor: Record<string, string> = {
  pending:    "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  processing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  dispatched: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  delivered:  "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  cancelled:  "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function DriverDashboard() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    vehicleType: "",
    vehicleNumber: "",
    licenseNumber: "",
  });

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ["driverProfile"],
    queryFn: () => getMyDriverProfileApi(),
  });

  const { data: ordersData } = useQuery({
    queryKey: ["assignedOrders"],
    queryFn: () => getAssignedOrdersApi(),
  });

  const toggleAvailability = useMutation({
    mutationFn: toggleAvailabilityApi,
    onSuccess: () => {
      toast.success("Availability updated");
      queryClient.invalidateQueries({ queryKey: ["driverProfile"] });
    },
    onError: () => toast.error("Failed to update availability"),
  });

  const createProfile = useMutation({
    mutationFn: () => createDriverProfileApi(form),
    onSuccess: () => {
      toast.success("Profile created!");
      queryClient.invalidateQueries({ queryKey: ["driverProfile"] });
    },
    onError: () => toast.error("Failed to create profile"),
  });

  const profile = profileData?.profile || profileData;
  const orders = Array.isArray(ordersData) ? ordersData : ordersData?.orders || [];
  const active  = orders.filter((o: any) => o.status !== "delivered").length;

  // Show setup screen if no profile
  if (!profileLoading && !profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="glass p-8 w-full max-w-md flex flex-col gap-4">
          <h2 className="text-xl font-bold">Setup Your Driver Profile</h2>
          <p className="text-white/40 text-sm">
            Fill in your vehicle details to get started
          </p>
          {[
            { key: "vehicleType", label: "Vehicle Type (e.g. Van, Truck)" },
            { key: "vehicleNumber", label: "Vehicle Number Plate" },
            { key: "licenseNumber", label: "License Number" },
          ].map(({ key, label }) => (
            <div key={key} className="flex flex-col gap-1.5">
              <label className="text-xs text-white/50">{label}</label>
              <input
                type="text"
                placeholder={label}
                value={form[key as keyof typeof form]}
                onChange={(e) =>
                  setForm((f) => ({ ...f, [key]: e.target.value }))
                }
                className="input-field"
              />
            </div>
          ))}
          <button
            onClick={() => createProfile.mutate()}
            disabled={createProfile.isPending}
            className="btn-primary w-full py-2.5"
          >
            {createProfile.isPending ? "Creating..." : "Create Profile"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Driver Dashboard</h1>
          <p className="text-white/40 text-sm mt-0.5">
            Manage your deliveries
          </p>
        </div>
        <button
          onClick={() => toggleAvailability.mutate()}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
            profile?.isAvailable
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
              : "bg-white/5 text-white/40 border-white/10 hover:bg-white/10"
          }`}
        >
          {profile?.isAvailable ? (
            <><ToggleRight size={16} /> Available</>
          ) : (
            <><ToggleLeft size={16} /> Offline</>
          )}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="stat-card border border-orange-500/20">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
            <Truck size={16} className="text-orange-400" />
          </div>
          <p className="text-2xl font-bold font-mono">{active}</p>
          <p className="text-xs text-white/40">Active Deliveries</p>
        </div>
        <div className="stat-card border border-emerald-500/20">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <Wallet size={16} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-400">
            £{profile?.earnings?.toFixed(2) || "0.00"}
          </p>
          <p className="text-xs text-white/40">Total Earnings</p>
        </div>
        <div className="stat-card border border-brand-500/20">
          <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center">
            <Star size={16} className="text-brand-400" />
          </div>
          <p className="text-2xl font-bold font-mono">
            {profile?.rating?.toFixed(1) || "0.0"}
          </p>
          <p className="text-xs text-white/40">Rating</p>
        </div>
      </div>

      {/* Profile Card */}
      {profile && (
        <div className="glass p-5 flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-white/70">Vehicle Info</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { label: "Vehicle Type", value: profile.vehicleType },
              { label: "Vehicle Number", value: profile.vehicleNumber },
              { label: "License", value: profile.licenseNumber },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/3 rounded-lg p-3">
                <p className="text-xs text-white/30">{label}</p>
                <p className="text-sm font-medium mt-0.5 font-mono">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div className="glass p-5">
        <h2 className="text-sm font-semibold text-white/70 mb-4">
          Assigned Orders
        </h2>
        <div className="flex flex-col gap-2">
          {orders.slice(0, 5).map((order: any, i: number) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-white/5 border border-white/5 transition-colors"
            >
              <div>
                <p className="text-sm font-mono text-white/80">
                  {order.trackingNumber}
                </p>
                <p className="text-xs text-white/40 mt-0.5">
                  {order.deliveryAddress}
                </p>
              </div>
              <span className={`badge border ${statusColor[order.status]}`}>
                {order.status}
              </span>
            </motion.div>
          ))}
          {orders.length === 0 && (
            <p className="text-white/30 text-sm text-center py-6">
              No orders assigned yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
}