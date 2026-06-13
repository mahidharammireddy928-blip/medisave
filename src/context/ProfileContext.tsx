/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { UserProfile } from "../types";

interface ProfileContextType {
  profile: UserProfile | null;
  saveProfileAndSync: (newProfile: UserProfile) => void;
  clearProfileData: () => void;
  isProfileSetup: boolean;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = "medisave_user_profile_v2";

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setProfile(parsed);
      }
    } catch (e) {
      console.error("Failed to parse user profile from localStorage", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveProfileAndSync = (newProfile: UserProfile) => {
    setProfile(newProfile);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newProfile));
    } catch (e) {
      console.error("Failed to save user profile to localStorage", e);
    }
  };

  const clearProfileData = () => {
    setProfile(null);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {
      console.error("Failed to clear profile from localStorage", e);
    }
  };

  const isProfileSetup = profile !== null && profile.name.trim() !== "";

  // Render children only when loaded to avoid flash of blank default state during quick hydrations
  return (
    <ProfileContext.Provider
      value={{
        profile,
        saveProfileAndSync,
        clearProfileData,
        isProfileSetup,
      }}
    >
      {isLoaded ? children : <div className="min-h-screen bg-[#0A0A0A]" />}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
}
