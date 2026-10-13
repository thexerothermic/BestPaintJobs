const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL;

export interface Profile {
  id: number;
  userId: string;
  displayName?: string;
}

export interface DisplayNameUpdateDto {
  displayName: string;
}

let cachedProfile: Profile | null = null;
let inflight: Promise<Profile | null> | null = null;

export function getCachedProfile(): Profile | null {
  return cachedProfile;
}

export function setCachedProfile(profile: Profile): void {
  cachedProfile = profile;
}

export function clearCachedProfile(): void {
  cachedProfile = null;
  inflight = null;
}

// Returns the cached profile, or fetches it (creating it on a 404) and caches it.
export function ensureProfile(token: string): Promise<Profile | null> {
  if (cachedProfile) return Promise.resolve(cachedProfile);
  if (inflight) return inflight;

  const request: Promise<Profile | null> = (async () => {
    const getResponse = await getMyProfile(token);
    if (getResponse.ok) {
      return (await getResponse.json()) as Profile;
    }
    if (getResponse.status === 404) {
      const createResponse = await createMyProfile(token);
      if (createResponse.ok) {
        return (await createResponse.json()) as Profile;
      }
      console.error('Failed to automatically initialize profile.');
    }
    return null;
  })()
    .then((profile) => {
      // Ignore the result if the cache was cleared (e.g. logout) while fetching
      if (inflight === request && profile) cachedProfile = profile;
      return profile;
    })
    .finally(() => {
      if (inflight === request) inflight = null;
    });

  inflight = request;
  return request;
}

export async function getMyProfile(token: string): Promise<Response> {
  return fetch(`${API_BASE_URL}/profile`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function createMyProfile(token: string): Promise<Response> {
  return fetch(`${API_BASE_URL}/profile`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
}

export async function updateDisplayName(
  dto: DisplayNameUpdateDto, 
  token: string
): Promise<Response> {
  return fetch(`${API_BASE_URL}/profile/DisplayName`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dto),
  });
}