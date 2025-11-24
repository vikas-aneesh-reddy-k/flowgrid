import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (userData: any) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on app load
    const checkAuth = () => {
      const authToken = localStorage.getItem("authToken");
      const isAuthenticated = localStorage.getItem("isAuthenticated");
      const userEmail = localStorage.getItem("userEmail");
      const userName = localStorage.getItem("userName");

      // Only consider authenticated if we have a token
      if (isAuthenticated === "true" && userEmail && authToken) {
        setUser({
          email: userEmail,
          name: userName || undefined,
        });
      } else {
        // Clear invalid auth state
        localStorage.removeItem("authToken");
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userName");
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Call the real login API
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        setIsLoading(false);
        return false;
      }

      const data = await response.json();
      
      // Store the authentication token
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userEmail", data.user.email);
      localStorage.setItem("userName", data.user.name);
      
      setUser({
        email: data.user.email,
        name: data.user.name,
      });
      
      setIsLoading(false);
      
      // Force page reload to ensure all components re-render with auth state
      window.location.href = '/';
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const signup = async (userData: any): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Call the real register API
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          name: `${userData.firstName} ${userData.lastName}`,
          role: userData.role || 'sales_rep',
        }),
      });

      if (!response.ok) {
        setIsLoading(false);
        return false;
      }

      const data = await response.json();
      
      // Store the authentication token
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userEmail", data.user.email);
      localStorage.setItem("userName", data.user.name);
      
      setUser({
        email: data.user.email,
        name: data.user.name,
      });
      
      setIsLoading(false);
      
      // Force page reload to ensure all components re-render with auth state
      window.location.href = '/';
      
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
