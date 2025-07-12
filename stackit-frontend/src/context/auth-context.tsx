// src/context/auth-context.tsx
import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';

// Types for authentication - keeping your existing structure
interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: 'guest' | 'user' | 'admin';
  reputation: number;
  avatar?: string;
  createdAt?: string;
}

interface AuthResponse {
  success: boolean;
  message?: string;
  user?: AuthUser;
  token?: string;
  error?: string;
  data?: {
    user: AuthUser;
    token: string;
  };
}

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

// Auth state interface
interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authToken: string | null;
}

// Auth actions for reducer
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: { user: AuthUser; token: string } }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'RESTORE_SESSION'; payload: { user: AuthUser; token: string } }

interface AuthContextType extends AuthState {
  // Actions - keeping your existing function signatures
  login: (credentials: LoginData) => Promise<AuthResponse>;
  register: (userData: RegisterData) => Promise<AuthResponse>;
  logout: () => void;
  
  // Utilities - keeping your existing utilities
  hasPermission: (requiredRole: 'guest' | 'user' | 'admin') => boolean;
  getRoleBadgeColor: (role: string) => string;
}

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  authToken: null,
};

// Reducer for better state management
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        authToken: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        authToken: null,
        isAuthenticated: false,
        isLoading: false,
      };
    
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        authToken: null,
        isAuthenticated: false,
        isLoading: false,
      };
    
    case 'RESTORE_SESSION':
      return {
        ...state,
        user: action.payload.user,
        authToken: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // API Base URL - keeping your existing setup
  const API_BASE_URL = 'http://localhost:5000/api';

  // Check for existing authentication on app load - improved version
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('stackit_token');
        const userData = localStorage.getItem('stackit_user');
        
        if (token && userData) {
          const parsedUser = JSON.parse(userData) as AuthUser;
          
          // Optional: Verify token with backend (like the reducer version)
          try {
            const response = await fetch(`${API_BASE_URL}/auth/profile`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });

            if (response.ok) {
              // Token is valid, restore session
              dispatch({
                type: 'RESTORE_SESSION',
                payload: { user: parsedUser, token }
              });
              console.log('✅ Session restored and verified for user:', parsedUser.username, 'Role:', parsedUser.role);
            } else {
              // Token is invalid, clear it
              localStorage.removeItem('stackit_token');
              localStorage.removeItem('stackit_user');
              dispatch({ type: 'LOGIN_FAILURE' });
              console.log('❌ Stored token is invalid, cleared session');
            }
          } catch (error) {
            // If profile check fails, still restore session (fallback to your original behavior)
            dispatch({
              type: 'RESTORE_SESSION',
              payload: { user: parsedUser, token }
            });
            console.log('⚠️ Could not verify token, but restored session anyway:', parsedUser.username);
          }
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        // Clear invalid data
        localStorage.removeItem('stackit_token');
        localStorage.removeItem('stackit_user');
        dispatch({ type: 'LOGIN_FAILURE' });
      }
    };

    initializeAuth();
  }, []);

  // API call helper - keeping your existing implementation
  const makeApiCall = async (endpoint: string, data: any): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (!response.ok) {
        // Handle specific error messages from backend
        const errorMessage = result.error || result.message || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }

      return result;
    } catch (error: any) {
      console.error(`API call failed for ${endpoint}:`, error);
      
      // Handle network errors vs API errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please check if the backend is running.');
      }
      
      throw new Error(error.message || 'Network error occurred');
    }
  };

  // Login function - keeping your existing logic but with reducer
  const login = async (credentials: LoginData): Promise<AuthResponse> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      console.log('🔐 Attempting login with:', { email: credentials.email });
      
      const response = await makeApiCall('/auth/login', credentials);
      
      console.log('🔐 Login API response:', response);

      // Handle both response formats (direct user/token and nested data.user/data.token)
      let user: AuthUser | undefined;
      let token: string | undefined;

      if (response.data && response.data.user && response.data.token) {
        // Backend returns { success: true, data: { user: {...}, token: "..." } }
        user = response.data.user;
        token = response.data.token;
      } else if (response.user && response.token) {
        // Backend returns { success: true, user: {...}, token: "..." }
        user = response.user;
        token = response.token;
      }

      if (response.success && user && token) {
        // Store user data and token using reducer
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, token }
        });
        
        // Persist to localStorage
        localStorage.setItem('stackit_token', token);
        localStorage.setItem('stackit_user', JSON.stringify(user));
        
        console.log(`✅ Login successful for ${user.username} with role: ${user.role}`);
        console.log(`✅ isAuthenticated set to: true`);
        
        return { success: true, user, token };
      } else {
        console.log('❌ Login failed - missing user or token in response:', response);
        dispatch({ type: 'LOGIN_FAILURE' });
        return {
          success: false,
          error: response.error || response.message || 'Login failed - invalid response'
        };
      }
    } catch (error: any) {
      console.error('❌ Login error:', error);
      dispatch({ type: 'LOGIN_FAILURE' });
      return {
        success: false,
        error: error.message || 'Login failed'
      };
    }
  };

  // Register function - keeping your existing logic but with reducer
  const register = async (userData: RegisterData): Promise<AuthResponse> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      console.log('📝 Attempting registration with:', { 
        username: userData.username, 
        email: userData.email 
      });
      
      const response = await makeApiCall('/auth/register', userData);
      
      console.log('📝 Registration API response:', response);

      // Handle both response formats
      let user: AuthUser | undefined;
      let token: string | undefined;

      if (response.data && response.data.user && response.data.token) {
        user = response.data.user;
        token = response.data.token;
      } else if (response.user && response.token) {
        user = response.user;
        token = response.token;
      }

      if (response.success && user && token) {
        // Store user data and token using reducer
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, token }
        });
        
        // Persist to localStorage
        localStorage.setItem('stackit_token', token);
        localStorage.setItem('stackit_user', JSON.stringify(user));
        
        console.log(`✅ Registration successful for ${user.username} with role: ${user.role}`);
        console.log(`✅ isAuthenticated set to: true`);
        
        return { success: true, user, token };
      } else {
        console.log('❌ Registration failed - missing user or token in response:', response);
        dispatch({ type: 'LOGIN_FAILURE' });
        return {
          success: false,
          error: response.error || response.message || 'Registration failed - invalid response'
        };
      }
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      dispatch({ type: 'LOGIN_FAILURE' });
      return {
        success: false,
        error: error.message || 'Registration failed'
      };
    }
  };

  // Logout function - keeping your existing implementation
  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    
    // Clear localStorage
    localStorage.removeItem('stackit_token');
    localStorage.removeItem('stackit_user');
    
    console.log('🚪 User logged out');
  };

  // Role-based permissions helper - keeping your existing implementation
  const hasPermission = (requiredRole: 'guest' | 'user' | 'admin'): boolean => {
    if (!state.user) return requiredRole === 'guest';
    
    const roleHierarchy = { guest: 0, user: 1, admin: 2 };
    return roleHierarchy[state.user.role] >= roleHierarchy[requiredRole];
  };

  // Get role badge color - keeping your existing implementation
  const getRoleBadgeColor = (role: string): string => {
    switch (role) {
      case 'admin': return 'bg-red-500';
      case 'user': return 'bg-blue-500';
      case 'guest': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const value: AuthContextType = {
    // State from reducer
    ...state,
    
    // Actions - keeping your existing function signatures
    login,
    register,
    logout,
    
    // Utilities - keeping your existing utilities
    hasPermission,
    getRoleBadgeColor,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context - keeping your existing implementation
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};