import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import {
  clearCachedProfile,
  ensureProfile,
  getCachedProfile,
} from '../services/profile-service';
import type { Profile } from '../services/profile-service';

export function useProfileSync() {
  const { isAuthenticated, isLoading, user, getAccessTokenSilently } = useAuth0();
  const [profile, setProfile] = useState<Profile | null>(getCachedProfile());
  const [isSyncing, setIsSyncing] = useState<boolean>(getCachedProfile() === null);
  const userId = user?.sub;

  useEffect(() => {
    let isActive = true;

    async function syncProfile() {
      // Don't run until Auth0 finishes loading
      if (isLoading) return;

      if (!isAuthenticated) {
        clearCachedProfile();
        setProfile(null);
        setIsSyncing(false);
        return;
      }

      // A different user's profile must not be reused
      const cached = getCachedProfile();
      if (cached && userId && cached.userId !== userId) {
        clearCachedProfile();
      } else if (cached) {
        setProfile(cached);
        setIsSyncing(false);
        return;
      }

      try {
        setIsSyncing(true);
        const token = await getAccessTokenSilently();

        if (!token) {
          // TODO: Unauthenticate the user and redirect to login page
          return;
        }

        const result = await ensureProfile(token);
        if (isActive && result) setProfile(result);
      } catch (error) {
        console.error("Error during profile synchronization:", error);
      } finally {
        if (isActive) setIsSyncing(false);
      }
    }

    syncProfile();
    return () => {
      isActive = false;
    };
  }, [isAuthenticated, isLoading, userId, getAccessTokenSilently]);

  return { profile, isSyncing };
}