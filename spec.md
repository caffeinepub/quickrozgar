# QuickRozgar

## Current State
Admin panel exists at `#admin` URL hash. Login uses hardcoded credentials (`admin@quickrozgar.com` / `Admin@123`) with localStorage session (`adminLoggedIn`). The `AdminApp` component imports `useInternetIdentity` and calls `clear()` on logout, which is unnecessary and may cause errors. Admin session is also cleared when employee/employer logout is called.

## Requested Changes (Diff)

### Add
- Dedicated `/admin` path support (in addition to `#admin` hash) so admin can access the panel via a direct link from any device
- Admin session utility (`adminSession.ts`) for clean session get/save/clear
- Admin panel accessible at both `#admin` hash and a `/admin` pathname route

### Modify
- `AdminApp.tsx`: Remove `useInternetIdentity` dependency; use only localStorage for admin session; logout only clears admin session, not II
- `App.tsx`: Detect admin route via both `window.location.hash === '#admin'` AND `window.location.pathname.includes('/admin')` or a URL param so admin can reach panel from any link
- Admin logout should only clear admin localStorage key, not touch employee/employer sessions
- `AdminLoginScreen.tsx`: No changes needed (credentials and UI already correct)

### Remove
- `useInternetIdentity` import and usage from `AdminApp.tsx` (not needed for admin flow)

## Implementation Plan
1. Create `src/frontend/src/utils/adminSession.ts` - clean session helpers (save, get, clear, isAdminLoggedIn)
2. Update `AdminApp.tsx` - remove II dependency, use adminSession utils, fix logout to only clear admin session
3. Update `App.tsx` - detect admin route via hash OR pathname containing 'admin' OR `?admin` search param, ensuring any direct link works
4. Validate (lint + build)
