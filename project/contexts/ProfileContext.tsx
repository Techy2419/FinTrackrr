'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createProfile, getProfiles, updateProfile, deleteProfile } from '@/lib/profileService';
import { Profile, CreateProfileInput, UpdateProfileInput, ProfileContextType } from '@/types';
import { useToast } from '@/components/ui/use-toast';

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadProfiles = useCallback(async (userId: string) => {
    try {
      setError(null);
      setError(null);
      const userProfiles = await getProfiles(userId);
      setProfiles(userProfiles);
      if (userProfiles.length > 0 && !activeProfile) {
        setActiveProfile(userProfiles[0]);
      }
    } catch (error) {
      console.error('Error loading profiles:', error);
      setProfiles([]);
      setError('Failed to load profiles. Please try again.');
      if (error instanceof FirebaseError) {
        console.error('Firebase error:', error.code, error.message);
      }
      const errorMessage = error instanceof Error ? error.message : 'Failed to load profiles';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage
      });
    } finally {
      setLoading(false);
    }
  }, [activeProfile, toast]);

  useEffect(() => {
    if (user?.uid) {
      loadProfiles(user.uid);
    } else {
      setProfiles([]);
      setLoading(false);
    }
  }, [user?.uid, loadProfiles]);

  const handleAddProfile = async (profileData: CreateProfileInput): Promise<Profile> => {
    if (!user?.uid) {
      throw new Error('User must be logged in to create a profile');
    }
    try {
      setError(null);
      const profileId = await createProfile({ ...profileData, userId: user.uid });
      const newProfile: Profile = {
        id: profileId,
        ...profileData,
        userId: user.uid,
      };

      setProfiles(prev => [...prev, newProfile]);

      if (profiles.length === 0) {
        setActiveProfile(newProfile);
      }

      toast({
        title: "Success",
        description: "Profile created successfully"
      });

      return newProfile;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create profile';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage
      });
      throw error;
    }
  };

  const handleUpdateProfile = async (profileId: string, updates: UpdateProfileInput) => {
    try {
      setError(null);
      await updateProfile(profileId, updates);
      setProfiles(prev =>
        prev.map(profile =>
          profile.id === profileId ? { ...profile, ...updates } : profile
        )
      );

      if (activeProfile?.id === profileId) {
        setActiveProfile(prev => prev ? { ...prev, ...updates } : null);
      }

      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage
      });
      throw error;
    }
  };

  const handleDeleteProfile = async (profileId: string) => {
    try {
      setError(null);
      await deleteProfile(profileId);
      setProfiles(prev => prev.filter(profile => profile.id !== profileId));

      if (activeProfile?.id === profileId) {
        const remainingProfiles = profiles.filter(p => p.id !== profileId);
        setActiveProfile(remainingProfiles.length > 0 ? remainingProfiles[0] : null);
      }

      toast({
        title: "Success",
        description: "Profile deleted successfully"
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete profile';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage
      });
      throw error;
    }
  };

  const refreshProfiles = async () => {
    if (user?.uid) {
      await loadProfiles(user.uid);
    }
  };

  return (
    <ProfileContext.Provider
      value={{
        profiles,
        activeProfile,
        isLoading,
        error,
        setActiveProfile,
        addProfile: handleAddProfile,
        updateProfile: handleUpdateProfile,
        deleteProfile: handleDeleteProfile,
        refreshProfiles,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
