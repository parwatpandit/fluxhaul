import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Users, Star, Truck, ToggleLeft, ToggleRight } from "lucide-react";
import { getAllDriversApi } from "../../api/drivers";
import toast from "react-hot-toast";
import api from "../../api/axios";

export default function AdminDrivers() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["drivers"],
    queryFn: () => getAllDriversApi(),
  });

  const toggleBlock = useMutation({
    mutationFn: (userId: string) =>
      api.patch(`/users/${userId}/block`).then((r) => r.data),
    onSuccess: () => {
      toast.success("Driver status updated");
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
    },
    onError: () => toast.error("Failed to update driver"),
  });

  const drivers = data?.drivers || [];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Drivers</h1>
        <p className="text-white/40 text-sm mt-0.5">
          Manage your driver network
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="stat-card border border-orange-500/20">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
            <Users size={16} className="text-orange-400" />
          </div>
          <p className="text-2xl font-bold font-mono">{drivers.length}</p>
          <p className="text-xs text-white/40">Total Drivers</p>
        </div>
        <div className="stat-card border border-emerald-500/20">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <Truck size={16} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-bold font-mono">
            {drivers.filter((d: any) => d.isAvailable).length}
          </p>
          <p className="text-xs text-white/40">Available</p>
        </div>
        <div className="stat-card border border-brand-500/20">
          <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center">
            <Star size={16} className="text-brand-400" />
          </div>
          <p className="text-2xl font-bold font-mono">
            {drivers.length > 0
              ? (
                  drivers.reduce(
                    (sum: number, d: any) => sum + (d.rating || 0),
                    0
                  ) / drivers.length
                ).toFixed(1)
              : "0.0"}
          </p>
          <p className="text-xs text-white/40">Avg Rating</p>
        </div>
      </div>

      {/* Drivers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass p-5 animate-pulse h-44" />
          ))
        ) : drivers.length === 0 ? (
          <div className="col-span-3 text-center py-16 text-white/30">
            No drivers registered yet
          </div>
        ) : (
          drivers.map((driver: any, i: number) => (
            <motion.div
              key={driver._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass p-5 flex flex-col gap-4 hover:border-white/20 transition-all"
            >
              {/* Top */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-orange-400 font-bold">
                    {driver.user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {driver.user?.name}
                  </p>
                  <p className="text-xs text-white/40 truncate">
                    {driver.user?.email}
                  </p>
                </div>
                <div
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    driver.isAvailable ? "bg-emerald-400" : "bg-white/20"
                  }`}
                />
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/3 rounded-lg p-2.5">
                  <p className="text-xs text-white/30">Vehicle</p>
                  <p className="text-sm font-medium mt-0.5">
                    {driver.vehicleType}
                  </p>
                </div>
                <div className="bg-white/3 rounded-lg p-2.5">
                  <p className="text-xs text-white/30">Rating</p>
                  <p className="text-sm font-medium mt-0.5 flex items-center gap-1">
                    <Star size={12} className="text-yellow-400" fill="currentColor" />
                    {driver.rating?.toFixed(1) || "0.0"}
                  </p>
                </div>
                <div className="bg-white/3 rounded-lg p-2.5">
                  <p className="text-xs text-white/30">Earnings</p>
                  <p className="text-sm font-medium mt-0.5 font-mono text-emerald-400">
                    £{driver.earnings?.toFixed(2) || "0.00"}
                  </p>
                </div>
                <div className="bg-white/3 rounded-lg p-2.5">
                  <p className="text-xs text-white/30">License</p>
                  <p className="text-sm font-medium mt-0.5 truncate font-mono">
                    {driver.licenseNumber}
                  </p>
                </div>
              </div>

              {/* Block Toggle */}
              <button
                onClick={() => toggleBlock.mutate(driver.user?._id)}
                className={`flex items-center justify-center gap-2 w-full py-2 rounded-lg text-xs font-medium transition-colors border ${
                  driver.user?.isBlocked
                    ? "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20"
                    : "bg-white/5 text-white/50 border-white/10 hover:bg-white/10"
                }`}
              >
                {driver.user?.isBlocked ? (
                  <>
                    <ToggleLeft size={14} /> Unblock Driver
                  </>
                ) : (
                  <>
                    <ToggleRight size={14} /> Block Driver
                  </>
                )}
              </button>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}