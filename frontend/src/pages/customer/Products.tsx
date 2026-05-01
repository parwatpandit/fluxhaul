import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, ShoppingCart, Filter, Plus, Minus } from "lucide-react";
import { getProductsApi } from "../../api/products";
import { createOrderApi } from "../../api/orders";
import toast from "react-hot-toast";

export default function CustomerProducts() {
  const [search, setSearch]       = useState("");
  const [category, setCategory]   = useState("");
  const [minPrice, setMinPrice]   = useState("");
  const [maxPrice, setMaxPrice]   = useState("");
  const [page, setPage]           = useState(1);
  const [cart, setCart]           = useState<Record<string, number>>({});
  const [address, setAddress]     = useState("");
  const [cartOpen, setCartOpen]   = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["products", search, category, minPrice, maxPrice, page],
    queryFn: () =>
      getProductsApi({
        search,
        category,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        page,
      }),
  });

  const placeOrder = useMutation({
    mutationFn: () =>
      createOrderApi({
        items: Object.entries(cart).map(([product, quantity]) => ({
          product,
          quantity,
        })),
        deliveryAddress: address,
      }),
    onSuccess: () => {
      toast.success("Order placed successfully!");
      setCart({});
      setCartOpen(false);
      setAddress("");
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message || "Failed to place order"),
  });

  const products   = data?.products || [];
  const cartCount  = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartTotal  = Object.entries(cart).reduce((sum, [id, qty]) => {
    const p = products.find((p: any) => p._id === id);
    return sum + (p?.price || 0) * qty;
  }, 0);

  const addToCart = (id: string) =>
    setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));

  const removeFromCart = (id: string) =>
    setCart((c) => {
      const next = { ...c };
      if (next[id] > 1) next[id]--;
      else delete next[id];
      return next;
    });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-white/40 text-sm mt-0.5">
            Browse and order products
          </p>
        </div>
        {cartCount > 0 && (
          <button
            onClick={() => setCartOpen(true)}
            className="btn-primary flex items-center gap-2 relative"
          >
            <ShoppingCart size={15} />
            Cart
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-black text-brand-400 text-xs rounded-full flex items-center justify-center font-bold border border-brand-500/40">
              {cartCount}
            </span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-48">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
          />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-field pl-9"
          />
        </div>
        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          className="input-field w-32"
        />
        <input
          type="number"
          placeholder="Min £"
          value={minPrice}
          onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
          className="input-field w-24"
        />
        <input
          type="number"
          placeholder="Max £"
          value={maxPrice}
          onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
          className="input-field w-24"
        />
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="glass p-4 animate-pulse h-48" />
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
              {/* Product Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-sm">{product.name}</p>
                    <p className="text-xs text-white/40 mt-0.5">
                      {product.category}
                    </p>
                  </div>
                  <span
                    className={`badge border flex-shrink-0 ${
                      product.stock > 0
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-red-500/10 text-red-400 border-red-500/20"
                    }`}
                  >
                    {product.stock > 0 ? `${product.stock} left` : "Out"}
                  </span>
                </div>
                <p className="text-xs text-white/30 mt-2 line-clamp-2">
                  {product.description}
                </p>
              </div>

              {/* Price & Cart */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <span className="text-lg font-bold font-mono text-brand-400">
                  £{product.price}
                </span>
                {cart[product._id] ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => removeFromCart(product._id)}
                      className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-sm font-mono w-4 text-center">
                      {cart[product._id]}
                    </span>
                    <button
                      onClick={() => addToCart(product._id)}
                      disabled={product.stock <= 0}
                      className="w-7 h-7 rounded-lg bg-brand-500/20 hover:bg-brand-500/30 text-brand-400 flex items-center justify-center transition-colors disabled:opacity-30"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => addToCart(product._id)}
                    disabled={product.stock <= 0}
                    className="btn-primary px-3 py-1.5 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                )}
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

      {/* Cart Modal */}
      {cartOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <h3 className="font-semibold mb-4">Your Cart</h3>

            <div className="flex flex-col gap-2 mb-4">
              {Object.entries(cart).map(([id, qty]) => {
                const p = products.find((p: any) => p._id === id);
                if (!p) return null;
                return (
                  <div
                    key={id}
                    className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/5 border border-white/5"
                  >
                    <div>
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-white/40">
                        £{p.price} × {qty}
                      </p>
                    </div>
                    <span className="font-mono text-sm text-brand-400">
                      £{(p.price * qty).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between py-3 border-t border-white/10 mb-4">
              <span className="text-sm text-white/60">Total</span>
              <span className="font-bold font-mono text-brand-400">
                £{cartTotal.toFixed(2)}
              </span>
            </div>

            <div className="flex flex-col gap-1.5 mb-4">
              <label className="text-xs text-white/50">Delivery Address</label>
              <input
                type="text"
                placeholder="Enter your delivery address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setCartOpen(false)}
                className="btn-ghost flex-1"
              >
                Cancel
              </button>
              <button
                onClick={() => placeOrder.mutate()}
                disabled={!address || placeOrder.isPending}
                className="btn-primary flex-1 disabled:opacity-30"
              >
                {placeOrder.isPending ? "Placing..." : "Place Order"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}