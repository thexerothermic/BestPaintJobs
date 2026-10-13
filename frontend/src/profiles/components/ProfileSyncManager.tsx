import { useProfileSync } from '../hooks/useProfileSync';

export function ProfileSyncManager() {
    // Improve this by using a service that keeps track of the profile sync status in the background
    // In its current form, it always triggers at least 1 http request when rendered
    // It should only check once
    useProfileSync();
    return null;
}