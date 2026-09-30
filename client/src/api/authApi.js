import apiClient from "./apiClient.js";

export const registerUser = async (userData) => {
  const response = await apiClient.post("/auth/register", userData);

  return response.data;
};

export const loginUser = async (userData) => {
  const response = await apiClient.post("/auth/login", userData);

  return response.data;
};

export const getCurrentUser = async (token) => {
  const response = await apiClient.get("/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};