import api from "./axios";

export const createDriverProfileApi = async (data: {
  vehicleType: string;
  vehicleNumber: string;
  licenseNumber: string;
}) => {
  const res = await api.post("/drivers/profile", data);
  return res.data;
};

export const getMyDriverProfileApi = async () => {
  const res = await api.get("/drivers/profile");
  return res.data;
};

export const getAllDriversApi = async (page = 1) => {
  const res = await api.get("/drivers", { params: { page } });
  return res.data;
};

export const getDriverEarningsApi = async () => {
  const res = await api.get("/drivers/earnings");
  return res.data;
};

export const toggleAvailabilityApi = async () => {
  const res = await api.patch("/drivers/availability");
  return res.data;
};