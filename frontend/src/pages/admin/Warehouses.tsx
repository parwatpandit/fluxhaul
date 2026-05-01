import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Plus, Trash2, Warehouse, X } from "lucide-react";
import {
  getWarehousesApi,
  createWarehouseApi,
  deleteWarehouseApi,
} from "../../api/warehouses";
import toast from "react-hot-toast";

export default function AdminWarehouses() {
  const queryClient = useQueryClient();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    location: "",
    address: "",
  });

  const { data: warehouses, isLoading } = useQuery({
    queryKey: ["warehouses"],
    queryFn: () => getWarehousesApi(),
  });

  const createWarehouse = useMutation({
    mutationFn: () => createWarehouseApi(form),
    onSuccess: () => {
      toast.success("Warehouse created");
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      setModal(false);
      setForm({ name: "", location: "", address: "" });
    },
    onError: () => toast.error("Failed to create warehouse"),
  });

  const deleteWarehouse = useMutation({
    mutationFn: (id: string) => deleteWarehouseApi(id),
    onSuccess: () => {
      toast.success("Warehouse deleted");
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
    },
    onError: () => toast.error("Failed to delete warehouse"),
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Warehouses</h1>
          <p className="text-white/40 text-sm mt-0.5">
            Manage your warehouse network
          </p>
        </div>
        <button
          onClick={() => setModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={15} />
          Add Warehouse
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass p-5 animate-pulse h-36" />
          ))
        ) : warehouses?.length === 0 ? (
          <div className="col-span-3 text-center py-16 text-white/30">
            No warehouses yet
          </div>
        ) : (
          warehouses?.map((warehouse: any, i: number) => (
            <motion.div
              key={warehouse._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass p-5 flex flex-col gap-3 hover:border-white/20 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <Warehouse size={17} className="text-blue-400" />
                </div>
                <button
                  onClick={() => deleteWarehouse.mutate(warehouse._id)}
                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              <div>
                <p className="font-semibold">{warehouse.name}</p>
                <p className="text-xs text-white/40 mt-0.5">
                  {warehouse.location}
                </p>
              </div>

              <div className="pt-2 border-t border-white/5">
                <p className="text-xs text-white/30">{warehouse.address}</p>
              </div>

              <div className="flex items-center gap-1.5">
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    warehouse.isActive ? "bg-emerald-400" : "bg-red-400"
                  }`}
                />
                <span className="text-xs text-white/40">
                  {warehouse.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold">Add New Warehouse</h3>
              <button
                onClick={() => setModal(false)}
                className="p-1.5 rounded-lg hover:bg-white/5 text-white/40"
              >
                <X size={15} />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {[
                { key: "name", label: "Warehouse Name" },
                { key: "location", label: "Location (City)" },
                { key: "address", label: "Full Address" },
              ].map(({ key, label }) => (
                <div key={key} className="flex flex-col gap-1.5">
                  <label className="text-xs text-white/50">{label}</label>
                  <input
                    type="text"
                    value={form[key as keyof typeof form]}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, [key]: e.target.value }))
                    }
                    className="input-field"
                    placeholder={label}
                  />
                </div>
              ))}

              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => setModal(false)}
                  className="btn-ghost flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={() => createWarehouse.mutate()}
                  disabled={createWarehouse.isPending}
                  className="btn-primary flex-1"
                >
                  {createWarehouse.isPending ? "Creating..." : "Create Warehouse"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}