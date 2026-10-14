import type { UploadUrlResponseDto } from '../dtos/UploadUrlResponseDto';

const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL;

export const ALLOWED_UPLOAD_TYPES: string[] = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_FILE_SIZE_MB = 10;

const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// Returns an error message, or null when the file is acceptable.
export function validateFile(file: File): string | null {
  if (!ALLOWED_UPLOAD_TYPES.includes(file.type)) {
    return 'Unsupported file type.';
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `File is larger than ${MAX_FILE_SIZE_MB} MB.`;
  }
  return null;
}

export async function requestUploadUrl(
  cardId: number,
  file: File,
  token: string
): Promise<UploadUrlResponseDto> {
  const res = await fetch(`${API_BASE_URL}/files/upload-url`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ cardId, contentType: file.type, fileSizeBytes: file.size }),
  });
  if (!res.ok) {
    throw new Error(`Could not get an upload URL (${res.status}).`);
  }
  return res.json();
}

export async function uploadToS3(
  uploadUrl: string,
  file: File,
  requiredHeaders: Record<string, string>
): Promise<void> {
  const res = await fetch(uploadUrl, { method: 'PUT', headers: requiredHeaders, body: file });
  if (!res.ok) {
    throw new Error(`Upload failed (${res.status}).`);
  }
}
