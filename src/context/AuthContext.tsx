
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from "@/components/ui/use-toast";

export type UserRole = 'student' | 'instructor';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
}

const defaultContext: AuthContextType = {
  user: null,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
};

const AuthContext = createContext<AuthContextType>(defaultContext);

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Mock user data for development
  const mockUsers = [
    {
      id: '1',
      email: 'student@example.com',
      password: 'password123',
      name: 'John Student',
      role: 'student' as UserRole,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John'
    },
    {
      id: '2',
      email: 'instructor@example.com',
      password: 'password123',
      name: 'Jane Instructor',
      role: 'instructor' as UserRole,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane'
    }
  ];

  useEffect(() => {
    // Check for saved user in local storage
    const savedUser = localStorage.getItem('lmsUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // This is a mock implementation - would use Supabase in production
      const foundUser = mockUsers.find(u => u.email === email && u.password === password);
      
      if (foundUser) {
        // Remove password before storing user
        const { password, ...secureUser } = foundUser;
        setUser(secureUser);
        localStorage.setItem('lmsUser', JSON.stringify(secureUser));
        toast({
          title: "Login successful",
          description: `Welcome back, ${secureUser.name}!`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: "Invalid email or password",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Login error",
        description: "An error occurred during login",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    setIsLoading(true);
    try {
      // This is a mock implementation - would use Supabase in production
      const userExists = mockUsers.some(u => u.email === email);
      
      if (userExists) {
        toast({
          variant: "destructive",
          title: "Registration failed",
          description: "Email already in use",
        });
      } else {
        // Create a new user
        const newUser = {
          id: Math.random().toString(36).substring(2, 9),
          email,
          name,
          role,
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
        };
        
        setUser(newUser);
        localStorage.setItem('lmsUser', JSON.stringify(newUser));
        
        toast({
          title: "Registration successful",
          description: "Your account has been created",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Registration error",
        description: "An error occurred during registration",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    // This is a mock implementation - would use Supabase in production
    localStorage.removeItem('lmsUser');
    setUser(null);
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
