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

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
  specialization?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

const adminService = {
  /**
   * Get all users (admin only)
   */
  async getUsers(page = 1, limit = 10, search = '', role = '', status: boolean | null = null): Promise<{
    data: User[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(role && { role }),
        ...(status !== null && { status: status.toString() })
      });
      
      const response = await api.get(`/admin/users?${params.toString()}`);
      return {
        data: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  /**
   * Update user role (admin only)
   */
  async updateUserRole(userId: string, role: 'patient' | 'doctor' | 'admin', specialization?: string): Promise<User> {
    try {
      const response = await api.put(`/admin/users/${userId}/role`, { 
        role,
        ...(role === 'doctor' && { specialization })
      });
      return response.data.data;
    } catch (error) {
      console.error('Error updating user role:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to update user role');
    }
  },

  /**
   * Toggle user active status (admin only)
   */
  async toggleUserStatus(userId: string, isActive: boolean): Promise<User> {
    try {
      const response = await api.put(`/admin/users/${userId}/status`, { isActive });
      return response.data.data;
    } catch (error) {
      console.error('Error toggling user status:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to update user status');
    }
  },

  /**
   * Get user statistics (admin only)
   */
  async getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    doctors: number;
    patients: number;
    admins: number;
    newUsersLast7Days: number;
    newUsersLast30Days: number;
  }> {
    try {
      const response = await api.get('/admin/stats/users');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to fetch user statistics');
    }
  },
};

export default adminService;
