# QuickRozgar

## Current State
The app has Employee, Employer, and Admin portals. Jobs are stored in localDb with a simple structure. Applications are saved on apply. The Admin panel showed jobs/applications but had limited control over visibility. Employees could see all jobs, employers could see all applications.

## Requested Changes (Diff)

### Add
- Job approval flow: jobs saved as `status = Pending`, Admin can Approve or Reject
- Application approval flow: applications saved as `status = Pending`, Admin can Approve or Reject
- Admin panel Reject button for jobs
- Admin panel Approve/Reject buttons for applications (replacing old status dropdown)
- `getAllJobsAdmin()` — returns all jobs for admin view
- `adminApproveJob()`, `adminRejectJob()` — localDb functions
- `adminApproveApplication()`, `adminRejectApplication()` — localDb functions
- Empty state in Employer Applications view when no approved applications

### Modify
- `postJob()` now sets `status = Pending` by default
- `getAllJobs()` now returns only Approved jobs (for employees)
- `applyToJob()` now sets `status = Pending` by default
- `getApplicationsForEmployer()` now filters to Approved only
- `AdminJobs` component now uses localDb directly
- `AdminApplications` component now uses localDb directly with Pending/Approved/Rejected flow
- `ApplicationsView` in EmployerDashboard now shows real approved applications

### Remove
- Sample candidates (SAMPLE_CANDIDATES) from EmployerDashboard ApplicationsView
- Old Applied/Viewed/Selected/Rejected status dropdown in AdminApplications

## Implementation Plan
1. Update localDb.ts — add status to LocalJob, update all functions
2. Update AdminPanel.tsx — AdminJobs and AdminApplications sections
3. Update EmployerDashboard.tsx — ApplicationsView uses real data
