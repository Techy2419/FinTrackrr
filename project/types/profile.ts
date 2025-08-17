import { Timestamp } from 'firebase/firestore';

export interface Profile {
  id?: string;
  name: string;
  type: 'personal' | 'business' | 'family';
  currency: string;
  userId: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export type CreateProfileInput = Omit<Profile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;
export type UpdateProfileInput = Partial<Profile>;
