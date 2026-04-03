# QuickRozgar — Admin Approval System

## Current State
- `localDb.ts` already has Pending/Approved/Rejected statuses for jobs and applications
- `postJob()` saves with `status: "Pending"`
- `getAllJobs()` filters to only Approved jobs for employees
- `getApplicationsForEmployer()` filters to only Approved applications for employers
- `adminApproveJob/Reject`, `adminApproveApplication/Reject` functions exist
- AdminPanel reads from localDb for jobs/applications sections — correct
- **BUG**: ProfileScreen falls back to `SAMPLE_APPLIED` hardcoded data when real applications are empty
- **BUG**: JobsScreen falls back to `FALLBACK_JOBS` even when jobs exist but are Pending (not approved), giving false impression of available jobs
- **BUG**: Admin Dashboard stats only come from ICP backend (actor), but most users use localStorage sessions — counts are 0 or inaccurate
- EmployerDashboard Applications view already correctly uses only Approved apps

## Requested Changes (Diff)

### Add
- `adminGetLocalStats()` function in localDb.ts that returns counts from localStorage (total jobs, approved jobs, total applications, employers list, employees list)
- Admin Dashboard supplement: show localDb-based stats when ICP backend shows 0s

### Modify
- **ProfileScreen**: Remove `SAMPLE_APPLIED` fallback — show real applications from localDb; if none, show "No applications yet" empty state
- **JobsScreen**: Remove `FALLBACK_JOBS` fallback — if no approved jobs found for category+city, show "Koi approved naukri nahi mili" empty state message
- **AdminPanel AdminDashboard**: Add a localDb stats section showing employers, employees, job counts from localStorage data (since most users are localStorage-based)
- **AdminPanel AdminEmployers**: Supplement with employer data from localDb (employers who posted jobs via localStorage)
- **AdminPanel AdminEmployees**: Supplement with employee data from localDb (employees who applied via localStorage)

### Remove
- `SAMPLE_APPLIED` constant usage as fallback in ProfileScreen
- `FALLBACK_JOBS` usage as fallback in JobsScreen
- `SAMPLE_CANDIDATES` usage in EmployerDashboard Applications count (already fixed with `getApplicationsForEmployer`)

## Implementation Plan
1. Add `adminGetLocalStats()`, `getLocalEmployers()`, `getLocalEmployees()` helpers to localDb.ts
2. Fix ProfileScreen: load real applications on mount; show empty state if none
3. Fix JobsScreen: when no approved local jobs found for category+city, show empty state (no FALLBACK_JOBS)
4. Fix AdminPanel Dashboard: add a section showing localDb stats (total local employers, employees, jobs, applications) alongside ICP stats
5. Fix AdminPanel Employees/Employers sections: show localDb-based user lists when ICP returns empty
