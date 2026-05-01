import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { io } from "socket.io-client";
import { useAuthStore } from "../../store/authStore";
import { getOrderApi } from "../../api/orders";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Truck, Package, CheckCircle } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix leaflet marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const steps = [
  { label: "Order Placed",  icon: Package,      status: "pending" },
  { label: "Processing",    icon: Package,      status: "processing" },
  { label: "Dispatched",    icon: Truck,        status: "dispatched" },
  { label: "Delivered",     icon: CheckCircle,  status: "delivered" },
];

const statusIndex: Record<string, number> = {
  pending: 0, processing: 1, dispatched: 2, delivered: 3,
};

export default function CustomerTrack() {
  const { orderId } = useParams();
  const { token } = useAuthStore();
  const [driverLocation, setDriverLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const { data: orderData } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => getOrderApi(orderId!),
    refetchInterval: 10000,
  });

  const order = orderData?.order;
  const currentStep = statusIndex[order?.status] ?? 0;

  useEffect(() => {
    if (!orderId || !token) return;

    const socket = io("http://localhost:8000", {
      auth: { token },
    });

    socket.on("connect", () => {
      socket.emit("trackOrder", orderId);
    });

    socket.on("driverLocation", (data: { lat: number; lng: number }) => {
      setDriverLocation(data);
    });

    return () => {
      socket.disconnect();
    };
  }, [orderId, token]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Live Tracking</h1>
        <p className="text-white/40 text-sm mt-0.5 font-mono">
          {order?.trackingNumber}
        </p>
      </div>

      {/* Progress Steps */}
      <div className="glass p-5">
        <div className="flex items-center justify-between relative">
          {/* Line */}
          <div className="absolute left-0 right-0 top-4 h-px bg-white/5 mx-8" />
          <div
            className="absolute left-0 top-4 h-px bg-brand-500 mx-8 transition-all duration-700"
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          />

          {steps.map((step, i) => {
            const done   = i <= currentStep;
            const active = i === currentStep;
            return (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center gap-2 relative z-10"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    done
                      ? "bg-brand-500 border-brand-500 shadow-glow-sm"
                      : "bg-surface-200 border-white/10"
                  } ${active ? "animate-pulse-glow" : ""}`}
                >
                  <step.icon
                    size={14}
                    className={done ? "text-black" : "text-white/30"}
                  />
                </div>
                <span
                  className={`text-xs text-center ${
                    done ? "text-white/70" : "text-white/20"
                  }`}
                >
                  {step.label}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Map */}
      <div className="glass overflow-hidden h-96 relative">
        {driverLocation ? (
          <MapContainer
            center={[driverLocation.lat, driverLocation.lng]}
            zoom={14}
            className="h-full w-full"
            zoomControl={false}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            />
            <Marker position={[driverLocation.lat, driverLocation.lng]}>
              <Popup>Driver is here</Popup>
            </Marker>
          </MapContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
              <Truck size={20} className="text-brand-400" />
            </div>
            <p className="text-white/30 text-sm">
              Waiting for driver location...
            </p>
            <p className="text-white/20 text-xs">
              Location will appear once driver is dispatched
            </p>
          </div>
        )}
      </div>

      {/* Order Info */}
      {order && (
        <div className="glass p-5 flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-white/70">Order Details</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/3 rounded-lg p-3">
              <p className="text-xs text-white/30">Driver</p>
              <p className="text-sm font-medium mt-0.5">
                {order.driver?.name || "Not assigned yet"}
              </p>
            </div>
            <div className="bg-white/3 rounded-lg p-3">
              <p className="text-xs text-white/30">Total</p>
              <p className="text-sm font-bold font-mono text-brand-400 mt-0.5">
                £{order.totalPrice?.toFixed(2)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-white/30">
            <MapPin size={11} />
            {order.deliveryAddress}
          </div>
        </div>
      )}
    </div>
  );
}