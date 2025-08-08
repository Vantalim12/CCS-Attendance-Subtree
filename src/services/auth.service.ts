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
      }); // Debug log // Fix: Correctly prepend the /api prefix to the endpoint
      const response = await api.post("/api/auth/login", credentials);
      const authData = response.data; // Store token and user data

      localStorage.setItem("token", authData.token);
      localStorage.setItem("user", JSON.stringify(authData.user));

      return authData;
    } catch (error: any) {
      console.error(
        "Login error details:",
        error.response?.data || error.message
      ); // Debug log
      throw new Error(error.response?.data?.message || "Login failed");
    }
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      // Fix: Correctly prepend the /api prefix to the endpoint
      const response = await api.post("/api/auth/register", userData);
      const authData = response.data; // Store token and user data

      localStorage.setItem("token", authData.token);
      localStorage.setItem("user", JSON.stringify(authData.user));

      return authData;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Registration failed");
    }
  }

  logout(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }

  getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  getToken(): string | null {
    return localStorage.getItem("token");
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getCurrentUser();
    return !!(token && user);
  }

  async refreshToken(): Promise<void> {
    try {
      // Fix: Correctly prepend the /api prefix to the endpoint
      await api.get("/api/auth/me");
    } catch (error) {
      this.logout();
    }
  }
}

export const authService = new AuthService();
export { api };
export default authService;
