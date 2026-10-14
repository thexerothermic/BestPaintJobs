export interface UploadUrlResponseDto {
  uploadUrl: string;
  publicUrl: string;
  objectKey: string;
  expiresAt: string;
  requiredHeaders: Record<string, string>;
}
