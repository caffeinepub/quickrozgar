# QuickRozgar — Admin Cross-Device Data Fix

## Current State
All job and application data is stored exclusively in `localStorage` via `localDb.ts`. This means data is device-specific — jobs posted on one device are invisible to the Admin (or anyone) on another device. The ICP backend canister has full job/application storage APIs, but the frontend never writes to them. The backend's admin query endpoints (`adminGetAllApplications`, `adminGetAllWorkers`, etc.) require Internet Identity authentication (assertAdmin checks II caller principal), but the Admin panel uses a localStorage-based session with fixed email/password credentials.

## Requested Changes (Diff)

### Add
- New public (no-auth) backend query functions: `publicGetAllJobs`, `publicGetAllApplications` — returns all jobs/applications for admin reading without requiring II auth
- New public application submission function: `publicSubmitApplication` — saves application without requiring II
- New public job creation function: `publicCreateJob` — saves job without requiring II
- These functions bypass assertAdmin since they are used by the non-II-authenticated admin panel

### Modify
- `EmployerDashboard.tsx`: When employer posts a job, ALSO write to ICP backend via `publicCreateJob` (in addition to localStorage for backward compat)
- `JobsScreen.tsx` / employee apply flow: When employee applies, ALSO write to ICP backend via `publicSubmitApplication`
- `AdminPanel.tsx`: Fetch jobs and applications from ICP backend (`publicGetAllJobs`, `publicGetAllApplications`) instead of localStorage
- `AdminPanel.tsx`: Approve/Reject/Delete actions update ICP backend as well as localStorage
- `localDb.ts`: Keep as-is for backward compat; add bridge functions that write to both localStorage AND backend

### Remove
- AdminPanel reading from localStorage for jobs and applications data (replace with backend reads)

## Implementation Plan
1. Update `main.mo` to add public (anonymous-accessible) read/write functions for jobs and applications with separate storage maps
2. Update `backend.d.ts` bindings after motoko generation
3. Create a `backendDb.ts` utility that writes jobs and applications to the ICP backend using anonymous actor (no II required)
4. Update `EmployerDashboard.tsx` to call backendDb on job post
5. Update `JobsScreen.tsx` to call backendDb on job apply
6. Update `AdminPanel.tsx` to fetch from backendDb instead of localDb for display data
7. Keep localStorage writes for backward compat (fallback if backend fails)
