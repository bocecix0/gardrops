import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Platform } from 'react-native';
import { firebaseAuth } from '../services/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult
} from 'firebase/auth';
import { createUserProfile } from '../services/userService';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  signUp: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if auth is properly initialized
    if (!firebaseAuth || Object.keys(firebaseAuth).length === 0) {
      console.warn('Firebase auth is not properly initialized');
      setLoading(false);
      return;
    }

    let unsubscribe: (() => void) | undefined;
    
    try {
      unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
        setCurrentUser(user);
        setLoading(false);
      });
    } catch (error) {
      console.error('Error setting up auth state listener:', error);
      setLoading(false);
    }

    return () => {
      if (unsubscribe) {
        try {
          unsubscribe();
        } catch (error) {
          console.error('Error unsubscribing from auth state listener:', error);
        }
      }
    };
  }, []);

  async function signUp(email: string, password: string) {
    // Check if auth is properly initialized
    if (!firebaseAuth || Object.keys(firebaseAuth).length === 0) {
      throw new Error('Firebase auth is not properly initialized. Please check your Firebase configuration.');
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      // Create user profile in Firestore
      await createUserProfile(userCredential.user.uid, email);
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  async function login(email: string, password: string) {
    // Check if auth is properly initialized
    if (!firebaseAuth || Object.keys(firebaseAuth).length === 0) {
      throw new Error('Firebase auth is not properly initialized. Please check your Firebase configuration.');
    }

    try {
      await signInWithEmailAndPassword(firebaseAuth, email, password);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async function loginWithGoogle() {
    // Check if auth is properly initialized
    if (!firebaseAuth || Object.keys(firebaseAuth).length === 0) {
      throw new Error('Firebase auth is not properly initialized. Please check your Firebase configuration.');
    }

    try {
      const provider = new GoogleAuthProvider();
      
      // For web and React Native, we use signInWithPopup
      // For mobile apps, you might want to use a different approach
      if (Platform.OS === 'web') {
        await signInWithPopup(firebaseAuth, provider);
      } else {
        // For mobile, we'll use signInWithRedirect and then get the result
        await signInWithRedirect(firebaseAuth, provider);
        // Note: getRedirectResult should be called after the redirect
        // This is a simplified implementation
      }
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  }

  async function logout() {
    // Check if auth is properly initialized
    if (!firebaseAuth || Object.keys(firebaseAuth).length === 0) {
      throw new Error('Firebase auth is not properly initialized.');
    }

    try {
      await signOut(firebaseAuth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  async function resetPassword(email: string) {
    // Check if auth is properly initialized
    if (!firebaseAuth || Object.keys(firebaseAuth).length === 0) {
      throw new Error('Firebase auth is not properly initialized.');
    }

    try {
      await sendPasswordResetEmail(firebaseAuth, email);
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }

  const value = {
    currentUser,
    signUp,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}