# Plan: Cache the profile in a service

## Problem
- `useProfileSync` (rendered via `ProfileSyncManager` in `App.tsx`) runs GET `/profile` on every page load, falling back to POST on a 404.
- `ProfilePage.tsx` calls `getMyProfile` itself, so it makes a second fetch.

## Goal
Keep a fetched profile in a service. Only run the GET/404/POST flow when the service does not already have a profile.

## Steps

1. **Add a cache in `frontend/src/profiles/services/profile-service.ts`.**
   - Module-level `cachedProfile: Profile | null` and `inflight: Promise<Profile | null> | null`, so concurrent callers share one request.
   - Add `getCachedProfile()`, `setCachedProfile(p)` and `clearCachedProfile()`.
   - Add `ensureProfile(token)`:
     - Return `cachedProfile` if it is set.
     - Otherwise return `inflight` if one exists.
     - Otherwise start an in-flight promise that runs the existing flow: GET, then POST on 404. Cache the result on success and clear `inflight` in `finally`.
     - Don't cache failures, so the next call retries.
   - Keep the raw `getMyProfile` and `createMyProfile` functions as they are.

2. **Simplify `useProfileSync`.**
   - Initialise `profile` state from `getCachedProfile()`, and set `isSyncing` to `false` when it is already cached.
   - In the effect, skip all work if a cached profile exists. Otherwise get the token and call `ensureProfile(token)`.
   - Move the GET/404/POST logic out of the hook into the service.
   - Only fetch the token when the profile isn't cached.

3. **Invalidate on logout and user change.**
   - Call `clearCachedProfile()` in the logout handlers in `UserMenu.tsx` and `LogoutButton.tsx`.
   - As a safeguard, clear the cache in the hook when `isAuthenticated` becomes false, and when the Auth0 `user.sub` differs from the cached `profile.userId`.

4. **Keep the cache fresh on updates.**
   - `updateDisplayName` updates the cached profile on a successful response. Use the response body if present, otherwise merge `displayName` locally.
   - Switch `ProfilePage.tsx` to read through `ensureProfile` instead of calling `getMyProfile` directly.

5. **Clean up `ProfileSyncManager.tsx`.** Remove the TODO comment, since the cache addresses it.

## Verification
- Run `npm run build` and the lint in `frontend/`.
- In the network tab, check that navigating between pages makes one `/profile` request, or none after the first load.
- Check that a logout/login cycle fetches the profile again.

## Caveat / optional
A module-level cache is lost on a full page reload, so a reload still makes one GET. To avoid that too, persist the profile in `sessionStorage`, keyed by `user.sub`. This is out of scope unless requested.
