# Plan: Logged-in home page carousel with real paint jobs

## Scope
- **Logged in:** the home page carousel shows real paint job cards from the backend, newest first (`Id` descending), loaded 10 at a time. When the user reaches the last loaded card, the next 10 are fetched and appended.
- **Logged out:** confirmed unchanged. The carousel keeps its existing hardcoded placeholder slides and the sign-in card, and must look and behave exactly as it does today (including the 4s auto-advance and wrap-around).

## Design decisions
- **Cursor pagination, not page/offset.** Ordering is by `Id` desc, so the client passes `beforeId` (the smallest id it has loaded). The backend returns `Id < beforeId ORDER BY Id DESC TAKE 10`. New cards created mid-session can't cause duplicates or skipped rows the way offset paging would.
- **Page size** is fixed at 10 server-side. The client may pass an optional `pageSize`, which the server clamps to a maximum, but the default is 10.
- **Empty cards are excluded.** The "Add a paint job" flow creates blank cards (`ImageUrl = ""`). The feed filters on `ImageUrl != ""` so unfinished cards don't show up in the carousel.
- **Whose cards:** all users' cards, not just the caller's. This is the "latest hot paint jobs" feed. The endpoint is `[Authorize]`, since the feature is for logged-in users.
- **End of list:** the response says whether more cards exist (`hasMore`), so the client stops fetching when the feed is exhausted. The backend fetches `pageSize + 1` rows to determine this.

## Backend (`backend/PaintJobCardModule/`)
1. **DTO** `DTOs/PaintJobCardFeedItemDto.cs`: `Id`, `ImageUrl`, `Blurb`. A read-only shape, so the feed doesn't leak `ProfileId`.
2. **DTO** `DTOs/PaintJobCardFeedPageDto.cs`: `Items` (list of `PaintJobCardFeedItemDto`), `HasMore` (bool), `NextBeforeId` (int?, nullable when there is nothing more).
3. **Service** `PaintJobCardService.GetFeedPageAsync(int? beforeId, int pageSize)`:
   - Query `PaintJobCards` where `ImageUrl != ""` and, if given, `Id < beforeId`.
   - Order by `Id` descending, take `pageSize + 1`, set `HasMore` from the extra row, then trim to `pageSize`.
   - Use `AsNoTracking()`.
4. **Controller** `PaintJobCardController`: add `GET api/PaintJobCard/feed?beforeId={int?}&pageSize={int?}`.
   - Clamp `pageSize` to the range 1 to 50, defaulting to 10.
   - It is separate from the existing `GET` (my cards), so there are no route clashes.
5. **Data**: the `Id` primary key already provides the needed ordering. Optionally add a filtered index on `ImageUrl` later if the table grows. Not needed now, so there is no migration.

## Frontend
1. **DTOs** `src/paint-job-cards/dtos/PaintJobCardFeedPageDto.ts`: `{ items: {id, imageUrl, blurb}[]; hasMore: boolean; nextBeforeId: number | null }`.
2. **Service** `paint-job-card-service.ts`: add `getPaintJobCardFeed(token, beforeId?, pageSize = 10)`.
3. **Hook** `src/paint-job-cards/hooks/usePaintJobCardFeed.ts`:
   - State: `cards`, `hasMore`, `loading`, `error`, and the cursor.
   - `loadMore()` ignores calls while a request is in flight or `hasMore` is false, so it can't double-fire.
   - Loads the first page on mount, with the same mounted-guard pattern as `ProfilePage`.
   - Uses `getAccessTokenSilently`.
4. **Carousel** `Carousel.tsx`:
   - Make it accept a `slides` prop, plus optional `onReachEnd` and `loadingMore` props. The logged-out usage passes the placeholder slides and no feed props, so its behavior stays identical.
   - Call `onReachEnd` whenever the active index equals the last slide. Prefetching exactly at the last image matches your spec.
   - Keep the wrap-around, but when `onReachEnd` and `hasMore` are set, don't auto-advance or wrap from the last slide back to the first while a fetch is pending. This avoids jumping past the new cards.
   - Also guard against `slides.length === 0` (modulo by zero in the current auto-advance code).
5. **App.tsx**: in the logged-in branch, render a new `FeedCarousel` wrapper that uses the hook and passes real cards as `PaintJobCardProps` with `isEdit: false`. The logged-out branch keeps the placeholder slides, which move into a constant.
6. **States**: show "Loading..." for the first load, a friendly empty message ("No paint jobs yet — be the first to add one!") when the feed is empty, and a small error message with retry if the fetch fails.

## Verification
- `dotnet build`, then exercise the endpoint:
  - The first call returns 10 cards with `Id` descending.
  - Passing `nextBeforeId` returns the next 10 with no overlap.
  - The last page has `hasMore = false`.
  - Blank cards are never returned.
  - Calling without a token returns 401.
- `npm run build` and `npm run lint`.
- Manual check with more than 10 seeded cards: click through to slide 10 and confirm the next 10 load and append. Check the empty and error states, and that the logged-out home page is unchanged.
