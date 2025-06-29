import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
import { auth, database, isFirebaseConfigured, isFirebaseReady } from './firebase';
import type { UserProfile } from '../types';

const googleProvider = new GoogleAuthProvider();

// Demo user factory
const createDemoUser = (email: string, displayName?: string) => ({
  uid: `demo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  email,
  displayName: displayName || email.split('@')[0],
  photoURL: null,
  emailVerified: true,
  isAnonymous: false,
  metadata: {
    creationTime: new Date().toISOString(),
    lastSignInTime: new Date().toISOString()
  },
  providerData: [],
  refreshToken: '',
  tenantId: null
});

export class AuthService {
  // Sign in with email and password
  static async signInWithEmail(email: string, password: string) {
    try {
      if (!isFirebaseReady()) {
        // Demo mode - no Firebase connection
        console.log('🎮 Demo mode: Creating demo user for sign in');
        const demoUser = createDemoUser(email);
        localStorage.setItem('skillforge-demo-user', JSON.stringify(demoUser));
        console.log('✅ Demo user signed in:', email);
        return demoUser as any;
      }
      
      console.log('🔑 Firebase: Signing in user with email');
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Firebase: User signed in successfully');
      return result.user;
    } catch (error: any) {
      console.error('❌ Sign in error:', error);
      
      // Provide user-friendly error messages
      if (error.code === 'auth/user-not-found') {
        throw new Error('No account found with this email address.');
      } else if (error.code === 'auth/wrong-password') {
        throw new Error('Incorrect password.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address.');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many failed attempts. Please try again later.');
      }
      
      throw error;
    }
  }

  // Sign up with email and password
  static async signUpWithEmail(email: string, password: string, displayName: string) {
    try {
      if (!isFirebaseReady()) {
        // Demo mode - no Firebase connection
        console.log('🎮 Demo mode: Creating demo user for sign up');
        const demoUser = createDemoUser(email, displayName);
        localStorage.setItem('skillforge-demo-user', JSON.stringify(demoUser));
        await this.createUserProfile(demoUser as any, { displayName });
        console.log('✅ Demo user created:', email);
        return demoUser as any;
      }
      
      console.log('📝 Firebase: Creating new user account');
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;
      
      // Create user profile in Realtime Database
      await this.createUserProfile(user, { displayName });
      console.log('✅ Firebase: User created successfully');
      
      return user;
    } catch (error: any) {
      console.error('❌ Sign up error:', error);
      
      // Provide user-friendly error messages
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('An account with this email already exists.');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password should be at least 6 characters.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address.');
      }
      
      throw error;
    }
  }

  // Sign in with Google
  static async signInWithGoogle() {
    try {
      if (!isFirebaseReady()) {
        // Demo mode - no Firebase connection
        console.log('🎮 Demo mode: Google sign in with demo user');
        const demoUser = createDemoUser('demo@google.com', 'Demo User (Google)');
        localStorage.setItem('skillforge-demo-user', JSON.stringify(demoUser));
        await this.createUserProfile(demoUser as any);
        console.log('✅ Demo Google user signed in');
        return demoUser as any;
      }
      
      console.log('🔍 Firebase: Google sign in');
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if user profile exists, if not create one
      const userRef = ref(database, `users/${user.uid}`);
      const snapshot = await get(userRef);
      
      if (!snapshot.exists()) {
        await this.createUserProfile(user);
      }
      
      console.log('✅ Firebase: Google sign in successful');
      return user;
    } catch (error: any) {
      console.error('❌ Google sign in error:', error);
      
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign in was cancelled.');
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('Popup was blocked. Please allow popups and try again.');
      }
      
      throw error;
    }
  }

  // Sign out
  static async signOut() {
    try {
      if (!isFirebaseReady()) {
        console.log('🎮 Demo mode: Signing out');
        localStorage.removeItem('skillforge-demo-user');
        console.log('✅ Demo user signed out');
        return;
      }
      
      await signOut(auth);
      console.log('✅ Firebase: User signed out successfully');
    } catch (error) {
      console.error('❌ Sign out error:', error);
      throw error;
    }
  }

  // Create user profile
  static async createUserProfile(user: User, additionalData?: any) {
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName: additionalData?.displayName || user.displayName || '',
      photoURL: user.photoURL || undefined,
      currentRole: '',
      targetRole: '',
      experience: '',
      location: '',
      bio: '',
      skills: [],
      goals: [],
      roadmaps: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (!isFirebaseReady()) {
      // Demo mode - store in localStorage
      console.log('🎮 Demo mode: Storing user profile in localStorage');
      localStorage.setItem(`skillforge-user-profile-${user.uid}`, JSON.stringify(userProfile));
      console.log('✅ Demo user profile created');
      return userProfile;
    }

    try {
      const userRef = ref(database, `users/${user.uid}`);
      await set(userRef, {
        ...userProfile,
        createdAt: userProfile.createdAt.toISOString(),
        updatedAt: userProfile.updatedAt.toISOString()
      });
      console.log('✅ Firebase: User profile created successfully');
      return userProfile;
    } catch (error) {
      console.error('❌ Error creating user profile:', error);
      throw error;
    }
  }

  // Get current user profile
  static async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      if (!isFirebaseReady()) {
        // Demo mode - get from localStorage
        const stored = localStorage.getItem(`skillforge-user-profile-${uid}`);
        const profile = stored ? JSON.parse(stored) : null;
        console.log('🎮 Demo mode: User profile loaded from localStorage:', profile ? 'Found' : 'Not found');
        return profile;
      }
      
      console.log('📋 Firebase: Loading user profile');
      const userRef = ref(database, `users/${uid}`);
      const snapshot = await get(userRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        const profile: UserProfile = {
          ...data,
          createdAt: new Date(data.createdAt),
          updatedAt: new Date(data.updatedAt)
        };
        console.log('✅ Firebase: User profile loaded');
        return profile;
      } else {
        console.log('📋 Firebase: User profile not found');
        return null;
      }
    } catch (error) {
      console.error('❌ Error fetching user profile:', error);
      return null;
    }
  }

  // Listen to auth state changes
  static onAuthStateChanged(callback: (user: User | null) => void) {
    if (!isFirebaseReady()) {
      // Demo mode - check localStorage
      console.log('🎮 Demo mode: Checking localStorage for user');
      const stored = localStorage.getItem('skillforge-demo-user');
      const user = stored ? JSON.parse(stored) : null;
      console.log('👤 Demo user found:', user ? user.email : 'None');
      
      // Simulate async behavior
      setTimeout(() => callback(user), 100);
      
      // Return a cleanup function
      return () => {
        console.log('🧹 Demo mode: Auth listener cleanup');
      };
    }
    
    console.log('🔐 Firebase: Setting up auth state listener');
    return onAuthStateChanged(auth, (user) => {
      console.log('👤 Firebase: Auth state changed:', user ? user.email : 'No user');
      callback(user);
    });
  }
}