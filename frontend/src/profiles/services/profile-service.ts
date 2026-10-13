const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL;

export interface Profile {
  id: number;
  userId: string;
  displayName?: string;
}

export interface DisplayNameUpdateDto {
  displayName: string;
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