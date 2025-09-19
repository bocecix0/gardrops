import { firebaseDb as db } from './firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { User } from '../types';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: string;
  lastLoginAt: string;
  wardrobeItemsCount: number;
  outfitsCount: number;
}

/**
 * Create a new user profile in Firestore
 * @param uid - Firebase user ID
 * @param email - User email
 * @returns Promise<void>
 */
export async function createUserProfile(uid: string, email: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    const userProfile: UserProfile = {
      uid,
      email,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      wardrobeItemsCount: 0,
      outfitsCount: 0
    };
    
    await setDoc(userRef, userProfile);
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
}

/**
 * Get user profile from Firestore
 * @param uid - Firebase user ID
 * @returns Promise<UserProfile | null>
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data() as UserProfile;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

/**
 * Update user profile in Firestore
 * @param uid - Firebase user ID
 * @param data - Partial user profile data to update
 * @returns Promise<void>
 */
export async function updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...data,
      lastLoginAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

/**
 * Update user wardrobe statistics
 * @param uid - Firebase user ID
 * @param wardrobeItemsCount - Number of wardrobe items
 * @param outfitsCount - Number of outfits
 * @returns Promise<void>
 */
export async function updateUserStats(
  uid: string, 
  wardrobeItemsCount: number, 
  outfitsCount: number
): Promise<void> {
  try {
    await updateUserProfile(uid, {
      wardrobeItemsCount,
      outfitsCount
    });
  } catch (error) {
    console.error('Error updating user stats:', error);
    throw error;
  }
}