import api from "./axios";

export const getProductsApi = async (params?: {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}) => {
  const res = await api.get("/products", { params });
  return res.data;
};

export const getProductApi = async (id: string) => {
  const res = await api.get(`/products/${id}`);
  return res.data;
};

export const createProductApi = async (data: object) => {
  const res = await api.post("/products", data);
  return res.data;
};

export const updateProductApi = async (id: string, data: object) => {
  const res = await api.put(`/products/${id}`, data);
  return res.data;
};

export const deleteProductApi = async (id: string) => {
  const res = await api.delete(`/products/${id}`);
  return res.data;
};

export const updateStockApi = async (id: string, stock: number) => {
  const res = await api.patch(`/products/${id}/stock`, { stock });
  return res.data;
};