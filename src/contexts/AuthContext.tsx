import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserProfile, AuthState } from '@/types/auth';

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
  });

  useEffect(() => {
    // First, set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const user = session?.user || null;
        
        setState(prevState => ({
          ...prevState,
          user,
          loading: prevState.loading && !user,
        }));
        
        // If user is present, fetch their profile
        if (user) {
          setTimeout(async () => {
            await fetchProfile(user.id);
          }, 0);
        } else {
          setState(prevState => ({
            ...prevState,
            profile: null,
          }));
        }
      }
    );
    
    // Then check for existing session
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user || null;
      
      setState(prevState => ({
        ...prevState,
        user,
        loading: false,
      }));
      
      // If user exists, fetch their profile
      if (user) {
        await fetchProfile(user.id);
      }
    };
    
    initializeAuth();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile', error);
        return;
      }
      
      setState(prevState => ({
        ...prevState,
        profile: data as UserProfile,
        loading: false,
      }));
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      setState(prevState => ({ ...prevState, loading: false }));
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      
      toast.success('Signed in successfully');
    } catch (error: any) {
      toast.error(error.message || 'Error signing in');
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      // Use the current window location for reliable redirection
      const currentUrl = window.location.origin;
      
      const { error, data } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: `${currentUrl}/auth`
        }
      });
      
      if (error) throw error;
      
      // Check if confirmation email was sent or if auto-confirm is on
      if (data?.user?.identities?.length === 0) {
        toast.error('This email is already registered. Please sign in instead.');
        return;
      }
      
      toast.success('Signed up successfully! Check your email to confirm your account.');
    } catch (error: any) {
      toast.error(error.message || 'Error signing up');
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      setState({ user: null, profile: null, loading: false });
      toast.success('Signed out successfully');
    } catch (error: any) {
      toast.error(error.message || 'Error signing out');
      throw error;
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!state.user) {
      toast.error('You must be logged in to update your profile');
      return;
    }

    try {
      // Using the database schema types from Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          username: data.username || null
        })
        .eq('id', state.user.id);
      
      if (error) throw error;
      
      // Refresh profile
      await fetchProfile(state.user.id);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Error updating profile');
      throw error;
    }
  };

  const deleteAccount = async () => {
    if (!state.user) {
      toast.error('You must be logged in to delete your account');
      return;
    }

    try {
      // We'll delete all user data by deleting the user account
      // RLS policies will cascade delete related data
      const { error } = await supabase.rpc('delete_user');
      
      if (error) throw error;
      
      // The user will be signed out automatically by Supabase
      toast.success('Your account and all related data have been deleted');
    } catch (error: any) {
      toast.error(error.message || 'Error deleting account');
      throw error;
    }
  };

  const value = {
    ...state,
    signIn,
    signUp,
    signOut,
    updateProfile,
    deleteAccount
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
