import type { PaintJobCardUpdateDto } from '../dtos/PaintJobCardUpdateDto';

const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL;

export async function getMyPaintJobCards(token: string): Promise<Response> {
  return fetch(`${API_BASE_URL}/paintjobcard`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function createPaintJobCard(token: string): Promise<Response> {
  return fetch(`${API_BASE_URL}/paintjobcard`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function updatePaintJobCard(
  dto: PaintJobCardUpdateDto,
  token: string
): Promise<Response> {
  return fetch(`${API_BASE_URL}/paintjobcard`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dto),
  });
}

export async function getPaintJobCardFeed(
  token: string,
  beforeId?: number | null,
  pageSize = 10
): Promise<Response> {
  const params = new URLSearchParams({ pageSize: String(pageSize) });
  if (beforeId != null) params.set('beforeId', String(beforeId));
  return fetch(`${API_BASE_URL}/paintjobcard/feed?${params}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
}
