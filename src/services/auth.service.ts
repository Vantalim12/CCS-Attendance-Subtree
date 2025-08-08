import axios from "axios";
import { LoginCredentials, RegisterData, AuthResponse, User } from "../types";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

console.log("API Base URL:", API_BASE_URL); // Debug log

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message); // Debug log
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log("Attempting login with:", {
        email: credentials.email,
        apiUrl: API_BASE_URL,
      });
      // Corrected line: Add the missing "/api" prefix here
      const response = await api.post("/api/auth/login", credentials);
      const authData = response.data;

      localStorage.setItem("token", authData.token);
      localStorage.setItem("user", JSON.stringify(authData.user));

      return authData;
    } catch (error: any) {
      console.error(
        "Login error details:",
        error.response?.data || error.message
      );
      throw new Error(error.response?.data?.message || "Login failed");
    }
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      // Corrected line: Add the missing "/api" prefix here
      const response = await api.post("/api/auth/register", userData);
      const authData = response.data;

      localStorage.setItem("token", authData.token);
      localStorage.setItem("user", JSON.stringify(authData.user));

      return authData;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Registration failed");
    }
  }

  // You should also update the token refresh method
  async refreshToken(): Promise<void> {
    try {
      // Corrected line: Add the missing "/api" prefix here
      await api.get("/api/auth/me");
    } catch (error) {
      this.logout();
    }
  }

export const authService = new AuthService();
export { api };
export default authService;
