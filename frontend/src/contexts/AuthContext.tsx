import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/services/authService';
import { billingService } from '@/services/billingService';
import { User } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  hasActiveSubscription: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName?: string, consent?: any) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  checkSubscriptionStatus: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

  const checkSubscriptionStatus = async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Check if user is enterprise (always has access)
      if (user.plan === 'enterprise') {
        setHasActiveSubscription(true);
        return true;
      }
      
      // Check subscription status via billing service
      const isActive = await billingService.hasActiveSubscription();
      setHasActiveSubscription(isActive);
      return isActive;
    } catch (error) {
      console.error('Error checking subscription status:', error);
      setHasActiveSubscription(false);
      return false;
    }
  };

  useEffect(() => {
    // Check if user is already authenticated on app load
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const userData = await authService.getCurrentUser();
          setUser(userData);
          
          // Check subscription status after setting user
          if (userData.plan !== 'enterprise') {
            await checkSubscriptionStatus();
          } else {
            setHasActiveSubscription(true);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Re-check subscription when user changes
  useEffect(() => {
    if (user) {
      checkSubscriptionStatus();
    } else {
      setHasActiveSubscription(false);
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    const response = await authService.login(email, password);
    localStorage.setItem('token', response.access_token);
    localStorage.setItem('refreshToken', response.refresh_token);
    setUser(response.user);
    
    // Reinitialize token manager after login
    const { tokenManager } = await import('@/utils/tokenManager');
    tokenManager.init();
  };

  const register = async (email: string, password: string, fullName?: string, consent?: any) => {
    const response = await authService.register(email, password, fullName, consent);
    localStorage.setItem('token', response.access_token);
    localStorage.setItem('refreshToken', response.refresh_token);
    setUser(response.user);
    
    // If checkout URL is provided, redirect to Stripe for payment
    if (response.checkout_url) {
      // Store a flag to show success message after redirect back
      localStorage.setItem('registration_complete', 'true');
      window.location.href = response.checkout_url;
    }
    
    return response;
  };

  const loginWithGoogle = async () => {
    // Redirect to Google OAuth endpoint
    window.location.href = `/api/auth/google`;
  };

  const logout = async () => {
    try {
      await authService.logout();
      localStorage.removeItem('token');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Clear local state even if API call fails
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  const resetPassword = async (email: string) => {
    await authService.resetPassword(email);
  };

  const verifyEmail = async (token: string) => {
    await authService.verifyEmail(token);
    // Refresh user data after verification
    const userData = await authService.getCurrentUser();
    setUser(userData);
  };

  const updateProfile = async (data: Partial<User>) => {
    const updatedUser = await authService.updateProfile(data);
    setUser(updatedUser);
  };

  const value = {
    user,
    loading,
    hasActiveSubscription,
    login,
    register,
    loginWithGoogle,
    logout,
    resetPassword,
    verifyEmail,
    updateProfile,
    checkSubscriptionStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}