// contexts/AuthContext.tsx (updated with axios)
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthContextType, AuthResponse, AuthState, User, LoginCredentials, RegisterData } from '../types/auth.types';

// Create the context with undefined initial value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props for the provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  // Check for existing session on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const mapSupabaseUser = (supabaseUser: any): User => ({
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    name: supabaseUser.user_metadata?.name || '',
    role: (supabaseUser.user_metadata?.role as 'user' | 'admin') || 'user',
    avatar: supabaseUser.user_metadata?.avatar || undefined,
  });

  const checkAuthStatus = async (): Promise<void> => {
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      const user = mapSupabaseUser(data.session.user);
      setState({
        user,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      });
    } catch (error) {
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      });
    }
  };

  const fetchUserData = async (): Promise<User> => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw new Error('Failed to fetch user data');
    }
    return mapSupabaseUser(data.user);
  };

  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error || !data.session || !data.user) {
        const message = error?.message || 'Unable to sign in. Please check your credentials.';
        throw new Error(message);
      }

      const user = mapSupabaseUser(data.user);

      setState({
        user,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      });

      return {
        status: 'success',
        message: 'Login successful',
        user,
      };
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        isAuthenticated: false,
        error: error.message || 'An error occurred during login',
      }));
      return {
        status: 'error',
        message: error.message || 'An error occurred during login',
      };
    }
  };

  const register = async (data: RegisterData): Promise<AuthResponse> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const { data: signUpData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      const user = signUpData.user ? mapSupabaseUser(signUpData.user) : null;

      setState({
        user,
        isLoading: false,
        isAuthenticated: Boolean(signUpData.user),
        error: null,
      });

      return {
        status: 'success',
        message: 'Registration successful. Check your email to confirm your account.',
        user,
      };
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        isAuthenticated: false,
        error: error.message || 'An error occurred during registration',
      }));
      return {
        status: 'error',
        message: error.message || 'An error occurred during registration',
      };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error.message);
      }
    } catch (error: any) {
      console.error('Logout error:', error);
    } finally {
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      });
    }
  };

  const updateUser = async (userData: Partial<User>): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const updateData: any = {};
      if (userData.name !== undefined) updateData.name = userData.name;
      if (userData.role !== undefined) updateData.role = userData.role;
      if (userData.avatar !== undefined) updateData.avatar = userData.avatar;

      const { data, error } = await supabase.auth.updateUser({
        data: updateData,
      });

      if (error || !data.user) {
        throw new Error(error?.message || 'Failed to update user');
      }

      setState(prev => ({
        ...prev,
        user: mapSupabaseUser(data.user),
        isLoading: false,
        error: null,
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'An error occurred while updating user',
      }));
      throw error;
    }
  };

  const clearError = (): void => {
    setState(prev => ({ ...prev, error: null }));
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// Optional: Protected route component
interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
  requiredRole?: 'user' | 'admin';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback,
  requiredRole,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return fallback || <div>Please log in to access this page</div>;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <div>You don't have permission to access this page</div>;
  }

  return <>{children}</>;
};