import { useState, useEffect, useCallback } from "react";
import { User, LoginCredentials, RegisterData } from "../types";
import authService from "../services/auth.service";

interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  hasRole: (role: "admin" | "student") => boolean;
  refreshAuth: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Error initializing auth:", error);
        authService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<void> => {
      setIsLoading(true);
      try {
        const authData = await authService.login(credentials);
        setUser(authData.user);
      } catch (error) {
        setUser(null);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const register = useCallback(
    async (userData: RegisterData): Promise<void> => {
      setIsLoading(true);
      try {
        const authData = await authService.register(userData);
        setUser(authData.user);
      } catch (error) {
        setUser(null);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback((): void => {
    setUser(null);
    authService.logout();
  }, []);

  const hasRole = useCallback(
    (role: "admin" | "student"): boolean => {
      return user?.role === role;
    },
    [user]
  );

  const refreshAuth = useCallback((): void => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  const isAuthenticated = authService.isAuthenticated() && !!user;

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    hasRole,
    refreshAuth,
  };
};
