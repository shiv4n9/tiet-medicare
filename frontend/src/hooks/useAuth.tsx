import React, { createContext, useContext, useState, useEffect } from 'react';
import authService, { User } from '@/services/authService';

// This would normally be in an environment variable
const JWT_SECRET = "your_jwt_secret_key";

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          // Try to get user info from server
          const userData = await authService.getMe();
          setUser(userData);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Clear invalid auth data
        authService.clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response = await authService.login({ email, password });
      
      if (response.success) {
        const userData = {
          _id: response.data._id,
          name: response.data.name,
          email: response.data.email,
          authProvider: response.data.authProvider
        };
        
        authService.storeAuthData(response.data.token, userData);
        setUser(userData);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // For now, simulate Google login
      // In a real implementation, you would integrate with Google OAuth
      const googleUser = {
        googleId: `google_${Date.now()}`,
        name: "Google User",
        email: `user_${Date.now()}@gmail.com`
      };
      
      const response = await authService.googleAuth(googleUser);
      
      if (response.success) {
        const userData = {
          _id: response.data._id,
          name: response.data.name,
          email: response.data.email,
          authProvider: response.data.authProvider
        };
        
        authService.storeAuthData(response.data.token, userData);
        setUser(userData);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Google login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response = await authService.register({ name, email, password });
      
      if (response.success) {
        // Don't automatically log in after registration
        // User should log in separately
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithGoogle,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
