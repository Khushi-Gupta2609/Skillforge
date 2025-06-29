import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { AuthService } from '../services/authService';
import type { UserProfile } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (email: string, password: string, displayName: string) => Promise<User>;
  signInWithGoogle: () => Promise<User>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔐 Setting up auth state listener...');
    
    const unsubscribe = AuthService.onAuthStateChanged(async (user) => {
      console.log('👤 Auth state changed:', user ? `User: ${user.email}` : 'No user');
      setCurrentUser(user);
      
      if (user) {
        try {
          console.log('📋 Loading user profile...');
          const profile = await AuthService.getUserProfile(user.uid);
          console.log('✅ User profile loaded:', profile ? 'Found' : 'Not found');
          setUserProfile(profile);
        } catch (error) {
          console.error('❌ Error loading user profile:', error);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('🔑 Signing in user:', email);
    return AuthService.signInWithEmail(email, password);
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    console.log('📝 Signing up user:', email);
    return AuthService.signUpWithEmail(email, password, displayName);
  };

  const signInWithGoogle = async () => {
    console.log('🔍 Google sign in');
    return AuthService.signInWithGoogle();
  };

  const signOut = async () => {
    console.log('👋 Signing out user');
    return AuthService.signOut();
  };

  const value = {
    currentUser,
    userProfile,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};