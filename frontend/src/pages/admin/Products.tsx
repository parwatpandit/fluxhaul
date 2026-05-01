import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, Plus, Trash2, Edit, X } from "lucide-react";
import {
  getProductsApi,
  createProductApi,
  deleteProductApi,
  updateStockApi,
} from "../../api/products";
import { getWarehousesApi } from "../../api/warehouses";
import toast from "react-hot-toast";

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    threshold: "",
    warehouse: "",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["products", page, search],
    queryFn: () => getProductsApi({ search, page }),
  });

  const { data: warehousesData } = useQuery({
    queryKey: ["warehouses"],
    queryFn: () => getWarehousesApi(),
  });

  const createProduct = useMutation({
    mutationFn: () => {
  const data: any = {};
  Object.entries(form).forEach(([k, v]) => {
    if (v) data[k] = v;
  });
  return createProductApi(data);
},
    onSuccess: () => {
      toast.success("Product created");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setModal(false);
      setForm({
        name: "",
        description: "",
        price: "",
        category: "",
        stock: "",
        threshold: "",
        warehouse: "",
      });
    },
    onError: () => toast.error("Failed to create product"),
  });

  const deleteProduct = useMutation({
    mutationFn: (id: string) => deleteProductApi(id),
    onSuccess: () => {
      toast.success("Product deleted");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: () => toast.error("Failed to delete product"),
  });

  const products = data?.products || [];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-white/40 text-sm mt-0.5">
            Manage your product catalogue
          </p>
        </div>
        <button onClick={() => setModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={15} />
          Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
        />
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-9 max-w-md"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="glass p-4 animate-pulse h-40" />
          ))
        ) : products.length === 0 ? (
          <div className="col-span-4 text-center py-16 text-white/30">
            No products found
          </div>
        ) : (
          products.map((product: any, i: number) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="glass p-4 flex flex-col gap-3 hover:border-white/20 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{product.name}</p>
                  <p className="text-xs text-white/40 mt-0.5">{product.category}</p>
                </div>
                <button
                  onClick={() => deleteProduct.mutate(product._id)}
                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-colors flex-shrink-0"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-lg font-bold font-mono text-brand-400">
                  £{product.price}
                </span>
                <span
                  className={`badge border ${
                    product.stock <= product.threshold
                      ? "bg-red-500/10 text-red-400 border-red-500/20"
                      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  }`}
                >
                  {product.stock} in stock
                </span>
              </div>

              <div className="pt-2 border-t border-white/5">
                <p className="text-xs text-white/30 truncate">
                  {product.warehouse?.name || "No warehouse"}
                </p>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Pagination */}
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

      {/* Create Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold">Add New Product</h3>
              <button
                onClick={() => setModal(false)}
                className="p-1.5 rounded-lg hover:bg-white/5 text-white/40"
              >
                <X size={15} />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {[
                { key: "name", label: "Product Name", type: "text" },
                { key: "description", label: "Description", type: "text" },
                { key: "price", label: "Price (£)", type: "number" },
                { key: "category", label: "Category", type: "text" },
                { key: "stock", label: "Stock", type: "number" },
                { key: "threshold", label: "Low Stock Threshold", type: "number" },
              ].map(({ key, label, type }) => (
                <div key={key} className="flex flex-col gap-1.5">
                  <label className="text-xs text-white/50">{label}</label>
                  <input
                    type={type}
                    value={form[key as keyof typeof form]}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, [key]: e.target.value }))
                    }
                    className="input-field"
                    placeholder={label}
                  />
                </div>
              ))}

              {/* Warehouse Select */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-white/50">Warehouse</label>
                <select
                  value={form.warehouse}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, warehouse: e.target.value }))
                  }
                  className="input-field"
                >
                  <option value="">Select warehouse</option>
                  {warehousesData?.map((w: any) => (
                    <option key={w._id} value={w._id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => setModal(false)}
                  className="btn-ghost flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={() => createProduct.mutate()}
                  disabled={createProduct.isPending}
                  className="btn-primary flex-1"
                >
                  {createProduct.isPending ? "Creating..." : "Create Product"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}