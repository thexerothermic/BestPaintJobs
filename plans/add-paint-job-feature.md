# Plan: "Add a paint job" feature

## Design notes
- Existing `PaintJobCard.tsx` sits at `src/` root. Move it to `src/paint-job-cards/components/` (update the import in `Carousel.tsx`).
- **Decision: backend-generated id.** The update DTO has a non-null `Id`, so when "Add a paint job" is clicked the backend **creates** an empty card (`POST api/PaintJobCard`) and returns it with its database-generated `Id`. The frontend never invents ids, and the update DTO is always valid.
- `ImageUrl` is non-nullable, so a blank card is stored with `ImageUrl = ""`. The UI treats an empty string as "no image".
- Ownership: each card has a `ProfileId` FK, and the controller scopes every query to the caller's profile, using `AuthenticationService.GetUserId()` as `ProfileController` does.

## Backend (`backend/PaintJobCardModule/`)
1. **Model** `Models/PaintJobCard.cs`: `int Id`, `int ProfileId`, `string ImageUrl`, `string Blurb`. Add an optional nav property `Profile`.
2. **DTO** `DTOs/PaintJobCardUpdateDto.cs`: `required int Id`, `required string ImageUrl`, `required string Blurb`, matching the `required` style of `DisplayNameUpdateDto`.
3. **Service** `Services/PaintJobCardService.cs` (registered with `AddScoped` in `Program.cs`):
   - `CreateAsync(userId)` creates a blank card for the user's profile.
   - `GetForUserAsync(userId)` returns the user's cards.
   - `UpdateAsync(userId, dto)` loads the card by `Id` and `ProfileId`, returns null if not found, otherwise saves `ImageUrl` and `Blurb`.
4. **Controller** `Controllers/PaintJobCardController.cs` (`[Authorize]`, `api/[controller]`):
   - `GET` returns the user's cards.
   - `POST` creates a blank card.
   - `PUT` takes `PaintJobCardUpdateDto`, returns 404 if the card isn't owned or doesn't exist, and 200 with the card otherwise.
5. **Data**: add `DbSet<PaintJobCard>` and the key and FK config to `AppDbContext`. Add a migration `AddPaintJobCardTable` via `dotnet ef migrations add`.

## Frontend (`frontend/src/paint-job-cards/`)
1. `dtos/PaintJobCardUpdateDto.ts`: `{ id: number; imageUrl: string; blurb: string }`.
2. `services/paint-job-card-service.ts`: `getMyPaintJobCards`, `createPaintJobCard`, `updatePaintJobCard(dto, token)`, following the `profile-service.ts` fetch pattern.
3. `components/PaintJobCard.tsx` (moved and extended):
   - Add an optional `onAddImage` prop.
   - When `isEdit` is true and `imageUrl` is empty, render an "Add Image" placeholder graphic (a button-like div) that calls `onAddImage`.
   - In edit mode, render the blurb in a `<textarea>` instead of the `<p>`. Report changes through an `onChange` prop, and add a Save button that calls `onSave`.
4. `handleAddImage()` is a no-op stub with a `TODO` noting the future flow: request an upload URL from the backend, upload the file to the file service, then set `imageUrl`.
5. **ProfilePage.tsx**: below the display-name form, add an "Add a paint job" button styled as a content-add item (dashed border, "+" icon). On click, call `createPaintJobCard`, then append the new card to `paintJobs` state and render it with `<PaintJobCard isEdit />`. Load existing cards on mount alongside the profile fetch. On save, call `updatePaintJobCard`.
6. **App.css**: add `.add-content-item`, `.paint-job-card-add-image`, and textarea styles.

## Verification
- `dotnet build` and `dotnet ef database update` for the backend.
- `npm run build` and `npm run lint` for the frontend.
- Manually click through the flow: add a card, see the "Add Image" placeholder, edit the blurb, save, reload, and confirm it persists.
