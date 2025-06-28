import axios from 'axios';

// Get API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance with base URL
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable sending/receiving cookies with CORS requests
});

// Add a request interceptor to include auth token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle specific status codes
      switch (error.response.status) {
        case 401:
          // Handle unauthorized (e.g., redirect to login)
          console.error('Unauthorized access - please log in');
          break;
        case 403:
          // Handle forbidden
          console.error('You do not have permission to perform this action');
          break;
        case 404:
          console.error('The requested resource was not found');
          break;
        case 500:
          console.error('Internal server error');
          break;
        default:
          console.error('An error occurred with the request');
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from server. Please check your connection.');
    } else {
      // Something happened in setting up the request
      console.error('Error setting up the request:', error.message);
    }
    return Promise.reject(error);
  }
);

export interface User {
  _id: string;
  name: string;
  email: string;
  authProvider?: 'email' | 'google';
  isActive?: boolean;
  lastLogin?: string;
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    _id: string;
    name: string;
    email: string;
    authProvider: 'email' | 'google';
    token: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface GoogleAuthCredentials {
  googleId: string;
  name: string;
  email: string;
}

class AuthService {
  // Register a new user
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/register', credentials);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  }

  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  // Google OAuth login/register
  async googleAuth(credentials: GoogleAuthCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/google', credentials);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Google authentication failed');
    }
  }

  // Get current user profile
  async getProfile(): Promise<User> {
    try {
      const response = await api.get('/auth/profile');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get profile');
    }
  }

  // Update user profile
  async updateProfile(updates: Partial<User>): Promise<AuthResponse> {
    try {
      const response = await api.put('/auth/profile', updates);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  }

  // Check if user is authenticated
  async getMe(): Promise<User> {
    try {
      const response = await api.get('/auth/me');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get user info');
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error: any) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage regardless of server response
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  // Store authentication data
  storeAuthData(token: string, user: User): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  // Get stored token
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Get stored user
  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Clear authentication data
  clearAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}

export default new AuthService(); 