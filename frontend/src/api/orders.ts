import api from "./axios";

export const createOrderApi = async (data: {
  items: { product: string; quantity: number }[];
  deliveryAddress: string;
}) => {
  const res = await api.post("/orders", data);
  return res.data;
};

export const getMyOrdersApi = async (page = 1) => {
  const res = await api.get("/orders/my-orders", { params: { page } });
  return res.data;
};

export const getAllOrdersApi = async (page = 1) => {
  const res = await api.get("/orders", { params: { page } });
  return res.data;
};

export const getOrderApi = async (id: string) => {
  const res = await api.get(`/orders/${id}`);
  return res.data;
};

export const updateOrderStatusApi = async (id: string, status: string) => {
  const res = await api.put(`/orders/${id}/status`, { status });
  return res.data;
};

export const assignDriverApi = async (id: string, driverId: string) => {
  const res = await api.put(`/orders/${id}/assign-driver`, { driverId });
  return res.data;
};

export const getAssignedOrdersApi = async () => {
  const res = await api.get("/orders/assigned");
  return res.data;
};

export const updateDeliveryStatusApi = async (id: string, status: string) => {
  const res = await api.put(`/orders/${id}/delivery-status`, { status });
  return res.data;
};