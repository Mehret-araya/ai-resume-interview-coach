import { createContext, useContext, useEffect, useState } from "react";
import {
  getCurrentUser,
  loginUser,
  registerUser,
} from "../api/authApi.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    () => localStorage.getItem("authToken")
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCurrentUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await getCurrentUser(token);

        if (data.success) {
          setUser(data.user);
        }
      } catch (error) {
        console.error("Failed to load current user:", error);

        localStorage.removeItem("authToken");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadCurrentUser();
  }, [token]);

  const register = async (userData) => {
    const data = await registerUser(userData);

    if (data.success && data.token) {
      localStorage.setItem("authToken", data.token);
      setToken(data.token);
      setUser(data.user);
    }

    return data;
  };

  const login = async (userData) => {
    const data = await loginUser(userData);

    if (data.success && data.token) {
      localStorage.setItem("authToken", data.token);
      setToken(data.token);
      setUser(data.user);
    }

    return data;
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: Boolean(token && user),
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};