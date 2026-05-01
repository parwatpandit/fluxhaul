import api from "./axios";

export const loginApi = async (email: string, password: string) => {
  const res = await api.post("/auth/login", { email, password });
  return res.data;
};

export const registerApi = async (
  name: string,
  email: string,
  password: string,
  role: string
) => {
  const res = await api.post("/auth/register", { name, email, password, role });
  return res.data;
};

export const logoutApi = async () => {
  const res = await api.post("/auth/logout");
  return res.data;
};