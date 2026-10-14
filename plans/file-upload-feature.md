# Plan: Paint job card image upload (Amazon S3)

## Flow
1. The user clicks **Add Image** on a card in the profile page and picks a file.
2. The frontend validates the file (type and size) against hard-coded constants, then asks the backend for a temporary upload URL.
3. The backend asks S3 for a pre-signed `PUT` URL and returns it. The file bytes never pass through the backend.
4. The frontend `PUT`s the file directly to that URL.
5. On success, the frontend saves the card with the new `imageUrl` through the existing `PUT api/PaintJobCard`.
6. The frontend refreshes only that card, replacing it in local state.

## Design decisions
- **Pre-signed PUT URL.** It is short-lived (5 minutes), scoped to one object key and one content type.
- **Server-generated object key.** `paint-job-cards/{cardId}/{guid}.{ext}`, so clients cannot overwrite arbitrary objects or choose paths. The extension comes from an allow-list mapped from the content type, never from the filename.
- **The upload request is per card** (`cardId` in the request). The backend verifies the card belongs to the caller before issuing a URL.
- **Public read.** The bucket serves images through a public base URL (or CloudFront). The backend returns `publicUrl`, and that is what gets saved as `ImageUrl`. The bucket is private for writes: only pre-signed URLs can write.
- **Backend credentials** come from the standard AWS credential chain (env vars, user-secrets in dev, IAM role in prod). Nothing secret goes in `appsettings.json` or the frontend.
- **Orphaned objects** (uploaded but never saved) are accepted for now. A bucket lifecycle rule or cleanup job can handle them later.

## Backend (`backend/FilesModule/`)
The folder exists with an empty `Controllers/`.

1. **Package:** add `AWSSDK.S3` to `backend.csproj`.
2. **Options** `FilesModule/S3Options.cs`, bound from the `S3` config section: `BucketName`, `Region`, `PublicBaseUrl`, `UploadUrlExpiryMinutes` (default 5), `MaxFileSizeBytes`.
   - Fail fast at startup in `Program.cs` if `BucketName`, `Region` or `PublicBaseUrl` is missing, like the existing `AllowedOrigins` check.
   - Add placeholder values in `appsettings.json` (no secrets).
3. **DTOs** `FilesModule/DTOs/`:
   - `UploadUrlRequestDto`: `CardId`, `ContentType`, `FileSizeBytes`.
   - `UploadUrlResponseDto`: `UploadUrl`, `PublicUrl`, `ObjectKey`, `ExpiresAt`, `RequiredHeaders` (`Content-Type`).
4. **Service** `FilesModule/Services/FileStorageService.cs`, registered in `Program.cs`, with `IAmazonS3` registered via `AddAWSService<IAmazonS3>()`:
   - `GenerateUploadUrl(cardId, contentType)` builds the key, then calls `GetPreSignedURL` with `Verb = PUT`, `ContentType`, and expiry.
   - It rejects content types outside the allow-list (`image/jpeg`, `image/png`, `image/webp`).
   - It rejects sizes above `MaxFileSizeBytes`. S3 `PUT` pre-signing cannot enforce size, so the size check is advisory. Switch to a pre-signed POST policy later if strict enforcement is needed.
5. **Controller** `FilesModule/Controllers/FilesController.cs`:
   - `[Authorize] [ApiController] [Route("api/[controller]")]`.
   - `POST api/Files/upload-url` takes `UploadUrlRequestDto`.
   - It looks up the card via `PaintJobCardService`, and returns `404` if the card does not belong to the caller (using `AuthenticationService.GetUserId()`) and `400` for a bad type or size.
6. **Card save validation:** in `PaintJobCardService.UpdateAsync`, only accept an `ImageUrl` that is empty or starts with `S3:PublicBaseUrl` plus the card's key prefix. This stops users saving arbitrary external URLs.
7. **Refresh endpoint:** add `GET api/PaintJobCard/{id}` (caller's own card) if the existing `PUT` does not already return the updated card. Check its current response during implementation.
8. **S3 bucket setup** (documented, not code):
   - CORS allowing `PUT` from the allowed frontend origins with the `Content-Type` header.
   - A bucket policy for public `GetObject` on `paint-job-cards/*`, or CloudFront in front.
   - An IAM policy for the backend limited to `s3:PutObject` on `paint-job-cards/*`.

## Frontend
1. **Upload limits are hard-coded constants, not env config.** `src/files/services/file-service.ts` exports `ALLOWED_UPLOAD_TYPES` (`image/jpeg`, `image/png`, `image/webp`) and `MAX_FILE_SIZE_MB` (10). No `VITE_UPLOAD_*` variables are added to `.env*` or `vite-env.d.ts`. The backend URL still comes from `VITE_BACKEND_API_URL`.
2. **Service** `src/files/services/file-service.ts`:
   - `requestUploadUrl(cardId, file, token)` calls `POST /files/upload-url`.
   - `uploadToS3(uploadUrl, file, requiredHeaders)` does a `PUT` of the file with the `Content-Type` header and no `Authorization` header.
   - `validateFile(file)` checks type and size against the constants and returns an error message or null.
3. **DTOs** `src/files/dtos/`: `UploadUrlResponseDto`, matching the backend.
4. **Paint job card service:** add `getPaintJobCard(id, token)` for the refresh, if the backend adds that endpoint.
5. **UI** in `PaintJobCard.tsx`:
   - Add a hidden `<input type="file" accept=...>` triggered by the **Add Image** button.
   - Call `onAddImage(file)`, so the prop changes from `() => void` to `(file: File) => void`.
   - Show an uploading state and an error message.
6. **Profile page** `ProfilePage.tsx` replaces the `handleAddImage` TODO with, per card:
   1. Validate the file.
   2. Set the card status to `uploading`.
   3. Request the upload URL, then upload to S3.
   4. Save the card (`updatePaintJobCard`) with `imageUrl: publicUrl` and the current blurb.
   5. Refresh that card and replace it in `paintJobs`, via the `updateJob` helper.
   6. On any failure, set status `error` and leave the card unchanged.
   - Extend the `PaintJobState` status union with `'uploading'`.
7. **Strict Mode:** the upload runs from a click handler, not an effect, so there is no double-fire. Disable the button while uploading to prevent double clicks.

## Verification
- Backend: `dotnet build`. Check that a request for another user's card returns `404`, that a bad content type returns `400`, and that the returned URL expires.
- Frontend: `npx tsc -b` and `npx eslint src`.
- Manual end to end:
  - Add a card, click Add Image, and pick a valid file. Confirm three requests (upload-url, S3 PUT, card PUT) and that the card shows the image.
  - Reload and confirm the image persists.
  - Try an oversized file and a wrong type, and confirm each is rejected client-side.
  - Confirm the card appears in the home feed.

## Decisions on earlier open questions
- **Reads:** public S3 bucket (no CloudFront). `S3:PublicBaseUrl` is the bucket's public URL.
- **Size enforcement:** client-side and advisory only for now. No pre-signed POST policy.
- **Replaced images:** the old object is left in place. No deletion or cleanup for now.
