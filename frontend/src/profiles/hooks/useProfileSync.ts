import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { getMyProfile, createMyProfile } from '../services/profile-service';
import type { Profile } from '../services/profile-service';

export function useProfileSync() {
  const { isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(true);

  useEffect(() => {
    async function syncProfile() {
      // Don't run until Auth0 finishes loading and confirms the user is logged in
      if (isLoading || !isAuthenticated) {
        setIsSyncing(false);
        return;
      }

      try {
        setIsSyncing(true);

        // 1. Attempt to fetch the existing profile
        const token = await getAccessTokenSilently();

        if (!token) {
            // TODO: Unauthenticate the user and redirect to login page
            setIsSyncing(false);
            return;
        }

        const getResponse = await getMyProfile(token);

        if (getResponse.ok) {
          const existingProfile: Profile = await getResponse.json();
          setProfile(existingProfile);
          return;
        }

        // 2. If it doesn't exist (404), trigger lazy initialization (CreateMyProfile)
        if (getResponse.status === 404) {
          const createResponse = await createMyProfile(token);

          if (createResponse.ok) {
            const newProfile: Profile = await createResponse.json();
            setProfile(newProfile);
          } else {
            console.error("Failed to automatically initialize profile.");
          }
        }
      } catch (error) {
        console.error("Error during profile synchronization:", error);
      } finally {
        setIsSyncing(false);
      }
    }

    syncProfile();
  }, [isAuthenticated, isLoading, getAccessTokenSilently]);

  return { profile, isSyncing };
}