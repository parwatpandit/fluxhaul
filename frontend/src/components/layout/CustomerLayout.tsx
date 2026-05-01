import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  MapPin,
  Zap,
  LogOut,
  Menu,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { logoutApi } from "../../api/auth";
import toast from "react-hot-toast";

const navItems = [
  { to: "/customer", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/customer/products", icon: Package, label: "Products" },
  { to: "/customer/orders", icon: ShoppingCart, label: "My Orders" },
];

export default function CustomerLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch {}
    logout();
    toast.success("Logged out");
    navigate("/login");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-white/5">
        <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center shadow-glow-sm flex-shrink-0">
          <Zap size={16} className="text-black" fill="black" />
        </div>
        <AnimatePresence>
          {sidebarOpen && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="font-bold text-base tracking-tight overflow-hidden whitespace-nowrap"
            >
              FluxHaul
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Role badge */}
      {sidebarOpen && (
        <div className="px-4 py-3">
          <span className="badge bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Customer
          </span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative
              ${isActive
                ? "bg-brand-500/10 text-brand-400 border border-brand-500/20"
                : "text-white/50 hover:text-white hover:bg-white/5"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="activeNavCustomer"
                    className="absolute inset-0 bg-brand-500/10 rounded-lg border border-brand-500/20"
                  />
                )}
                <item.icon size={17} className="flex-shrink-0 relative z-10" />
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="relative z-10 whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-white/5 p-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
            <span className="text-emerald-400 text-xs font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-white/40 truncate">{user?.email}</p>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-red-400 transition-colors flex-shrink-0"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: sidebarOpen ? 220 : 64 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="hidden md:flex flex-col bg-surface-50 border-r border-white/5 flex-shrink-0 relative"
      >
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-6 w-6 h-6 bg-surface-200 border border-white/10 rounded-full flex items-center justify-center hover:bg-surface-300 transition-colors z-10"
        >
          <ChevronRight
            size={12}
            className={`transition-transform duration-300 ${sidebarOpen ? "rotate-180" : ""}`}
          />
        </button>
        <SidebarContent />
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -220 }}
              animate={{ x: 0 }}
              exit={{ x: -220 }}
              transition={{ duration: 0.3 }}
              className="fixed left-0 top-0 h-full w-[220px] bg-surface-50 border-r border-white/5 z-50 md:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-14 border-b border-white/5 flex items-center px-4 gap-4 bg-surface-50/50 backdrop-blur-md sticky top-0 z-30">
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-1.5 rounded-lg hover:bg-white/5 text-white/60"
          >
            <Menu size={18} />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <MapPin size={13} className="text-brand-400" />
            <span className="text-xs text-white/40">Live Tracking Ready</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 bg-grid overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}