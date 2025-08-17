import { 
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
  Query,
  DocumentData
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Profile, CreateProfileInput, UpdateProfileInput } from '@/types';

export async function createProfile(profile: CreateProfileInput & { userId: string }) {
  try {
    const profileData = {
      ...profile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(collection(db, 'profiles'), profileData);
    
    return docRef.id;
  } catch (error) {
    throw new Error('Failed to create profile');
  }
}

export async function getProfiles(userId: string): Promise<Profile[]> {
  try {
    const q = query(collection(db, 'profiles'), where('userId', '==', userId));
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Profile[];
  } catch (err) {
    console.error('Error getting profiles:', err);
    throw new Error('Failed to fetch profiles');
  }
}

export async function updateProfile(profileId: string, updates: UpdateProfileInput) {
  try {
    const profileRef = doc(db, 'profiles', profileId);
    const updateData = {
      ...updates,
      updatedAt: new Date(),
    };
    
    await updateDoc(profileRef, updateData);
  } catch (error) {
    throw new Error('Failed to update profile');
  }
}

export async function deleteProfile(profileId: string) {
  try {
    const profileRef = doc(db, 'profiles', profileId);
    await deleteDoc(profileRef);
  } catch (err) {
    console.error('Error deleting profile:', err);
    throw new Error('Failed to delete profile');
  }
}
