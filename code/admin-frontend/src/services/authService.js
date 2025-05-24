import { api } from "./api";

class AuthService {
  constructor() {
    // Hardcoded base URL for development
    this.baseURL = "http://localhost:5000";
  }

  // Set auth token in API headers
  setAuthToken(token) {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  }

  // Register new user
  async register(userData) {
    try {
      const response = await api.post("/api/users/register", userData);

      if (response.data.success) {
        const { user, token } = response.data.data;

        // Store auth data
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        this.setAuthToken(token);

        return response.data;
      } else {
        throw new Error(response.data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors
          .map((err) => err.msg)
          .join(", ");
        throw new Error(errorMessages);
      } else {
        throw new Error("Registration failed. Please try again.");
      }
    }
  }

  // Login user
  async login(email, password) {
    try {
      const response = await api.post("/api/users/login", { email, password });

      if (response.data.success) {
        const { user, token } = response.data.data;

        // Store auth data
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        this.setAuthToken(token);

        return response.data;
      } else {
        throw new Error(response.data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors
          .map((err) => err.msg)
          .join(", ");
        throw new Error(errorMessages);
      } else {
        throw new Error("Login failed. Please try again.");
      }
    }
  }

  // Logout user
  async logout() {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        this.setAuthToken(token);
        try {
          await api.post("/api/users/logout");
        } catch (err) {
          // Ignore error, still proceed with logout
          console.error("Logout API error:", err);
        }
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      this.setAuthToken(null);

      // Force navigate to login page
      window.location.href = "/login";
    }
  }

  // Get current user profile
  async getCurrentUserProfile() {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      this.setAuthToken(token);
      const response = await api.get("/api/users/profile");

      if (response.data.success) {
        const user = response.data.data.user;
        localStorage.setItem("user", JSON.stringify(user));
        return user;
      } else {
        throw new Error(
          response.data.message || "Failed to fetch user profile"
        );
      }
    } catch (error) {
      console.error("Get profile error:", error);

      if (error.response?.status === 401) {
        // Token is invalid, logout user
        this.logout();
        throw new Error("Session expired. Please login again.");
      }

      throw new Error(
        error.response?.data?.message || "Failed to fetch user profile"
      );
    }
  }

  // Update user profile
  async updateProfile(userData) {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      this.setAuthToken(token);
      const response = await api.put("/api/users/profile", userData);

      if (response.data.success) {
        const user = response.data.data.user;
        localStorage.setItem("user", JSON.stringify(user));
        return response.data;
      } else {
        throw new Error(response.data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Update profile error:", error);

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors
          .map((err) => err.msg)
          .join(", ");
        throw new Error(errorMessages);
      } else {
        throw new Error("Failed to update profile. Please try again.");
      }
    }
  }

  // Change password
  async changePassword(currentPassword, newPassword) {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      this.setAuthToken(token);
      const response = await api.post("/api/users/change-password", {
        currentPassword,
        newPassword,
      });

      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || "Failed to change password");
      }
    } catch (error) {
      console.error("Change password error:", error);

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors
          .map((err) => err.msg)
          .join(", ");
        throw new Error(errorMessages);
      } else {
        throw new Error("Failed to change password. Please try again.");
      }
    }
  }

  // Get current user from localStorage
  getCurrentUser() {
    try {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem("token");
    const user = this.getCurrentUser();

    if (token && user) {
      // Set token in headers for future requests
      this.setAuthToken(token);
      return true;
    }

    return false;
  }

  // Initialize auth state on app load
  initializeAuth() {
    const token = localStorage.getItem("token");
    if (token) {
      this.setAuthToken(token);
    }
  }
}

export const authService = new AuthService();

// Initialize auth on module load
authService.initializeAuth();
