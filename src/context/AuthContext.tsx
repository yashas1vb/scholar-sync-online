import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from '@supabase/supabase-js';

export type UserRole = 'student' | 'instructor';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
}

const defaultContext: AuthContextType = {
  user: null,
  session: null,
  isLoading: true,
  login: async () => { },
  register: async () => { },
  logout: async () => { },
};

const AuthContext = createContext<AuthContextType>(defaultContext);

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Test Supabase connection
  const testConnection = async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      if (error) {
        console.error('Supabase connection test failed:', error);
        toast({
          variant: "destructive",
          title: "Connection Error",
          description: "Unable to connect to the database. Please check your internet connection.",
        });
        return false;
      }
      console.log('Supabase connection test successful');
      return true;
    } catch (error) {
      console.error('Supabase connection test error:', error);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Failed to connect to the database. Please try again later.",
      });
      return false;
    }
  };

  useEffect(() => {
    // Test connection first
    testConnection().then(isConnected => {
      if (!isConnected) {
        setIsLoading(false);
        return;
      }

      // Set up auth state listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('Auth state changed:', event, session);
          setSession(session);

          if (session?.user) {
            // Fetch user profile from profiles table
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (error) {
              console.error('Error fetching profile:', error);
              // If profile doesn't exist, create it
              if (error.code === 'PGRST116') {
                const { error: createError } = await supabase
                  .from('profiles')
                  .insert({
                    id: session.user.id,
                    email: session.user.email || '',
                    full_name: session.user.user_metadata.full_name || session.user.email?.split('@')[0] || 'User',
                    role: session.user.user_metadata.role || 'student'
                  });

                if (createError) {
                  console.error('Error creating profile:', createError);
                  setIsLoading(false);
                  return;
                }

                // Fetch the newly created profile
                const { data: newProfile } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', session.user.id)
                  .single();

                if (newProfile) {
                  setUser({
                    id: session.user.id,
                    email: session.user.email || '',
                    name: newProfile.full_name,
                    role: newProfile.role as UserRole,
                    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newProfile.full_name}`
                  });
                }
              }
            } else if (profile) {
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                name: profile.full_name,
                role: profile.role as UserRole,
                avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.full_name}`
              });
            }
          } else {
            setUser(null);
          }

          setIsLoading(false);
        }
      );

      // Get initial session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          console.log('Initial session found:', session);
        }
      });

      return () => subscription.unsubscribe();
    });
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: error.message,
        });
        throw error;
      }

      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            role: role,
          }
        }
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Registration failed",
          description: error.message,
        });
        throw error;
      }

      // Create profile record
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: email,
            full_name: name,
            role: role
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
          toast({
            variant: "destructive",
            title: "Profile creation failed",
            description: "Your account was created but profile setup failed. Please contact support.",
          });
          throw profileError;
        }
      }

      toast({
        title: "Registration successful",
        description: "Your account has been created successfully!",
      });
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        toast({
          variant: "destructive",
          title: "Logout error",
          description: error.message,
        });
        return;
      }

      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        variant: "destructive",
        title: "Logout error",
        description: "An error occurred during logout",
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
