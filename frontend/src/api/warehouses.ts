import api from "./axios";

export const getWarehousesApi = async () => {
  const res = await api.get("/warehouses");
  return res.data;
};

export const getWarehouseApi = async (id: string) => {
  const res = await api.get(`/warehouses/${id}`);
  return res.data;
};

export const createWarehouseApi = async (data: {
  name: string;
  location: string;
  address: string;
}) => {
  const res = await api.post("/warehouses", data);
  return res.data;
};

export const updateWarehouseApi = async (id: string, data: object) => {
  const res = await api.put(`/warehouses/${id}`, data);
  return res.data;
};

export const deleteWarehouseApi = async (id: string) => {
  const res = await api.delete(`/warehouses/${id}`);
  return res.data;
};