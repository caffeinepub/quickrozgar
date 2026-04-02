/**
 * localDb.ts — localStorage-based data store for QuickRozgar core actions.
 * Stores jobs posted by employers and applications submitted by employees.
 */

const JOBS_KEY = "qr_jobs";
const APPLICATIONS_KEY = "qr_applications";

export interface LocalJob {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  category: string;
  description: string;
  employerPhone: string;
  postedAt: number;
  status: "Pending" | "Approved" | "Rejected";
}

export interface LocalApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  location: string;
  employeePhone: string;
  employeeName?: string;
  employeeEmail?: string;
  appliedAt: number;
  status: "Pending" | "Approved" | "Rejected";
}

function loadJobs(): LocalJob[] {
  try {
    const raw = localStorage.getItem(JOBS_KEY);
    return raw ? (JSON.parse(raw) as LocalJob[]) : [];
  } catch {
    return [];
  }
}

function saveJobs(jobs: LocalJob[]): void {
  localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
}

function loadApplications(): LocalApplication[] {
  try {
    const raw = localStorage.getItem(APPLICATIONS_KEY);
    return raw ? (JSON.parse(raw) as LocalApplication[]) : [];
  } catch {
    return [];
  }
}

function saveApplications(apps: LocalApplication[]): void {
  localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(apps));
}

/** Post a new job. Returns the new job. Status starts as Pending. */
export function postJob(
  data: Omit<LocalJob, "id" | "postedAt" | "status">,
): LocalJob {
  const jobs = loadJobs();
  const job: LocalJob = {
    ...data,
    id: `job_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    postedAt: Date.now(),
    status: "Pending",
  };
  jobs.push(job);
  saveJobs(jobs);
  return job;
}

/** Get all jobs for admin (all statuses). */
export function getAllJobsAdmin(): LocalJob[] {
  return loadJobs();
}

/** Get only Approved jobs (for employee job listing). */
export function getAllJobs(): LocalJob[] {
  return loadJobs().filter((j) => j.status === "Approved");
}

/** Get jobs posted by a specific employer (by phone) — all statuses. */
export function getEmployerJobs(phone: string): LocalJob[] {
  return loadJobs().filter((j) => j.employerPhone === phone);
}

/** Delete a job and its related applications. */
export function deleteJob(jobId: string): void {
  const jobs = loadJobs().filter((j) => j.id !== jobId);
  saveJobs(jobs);
  const apps = loadApplications().filter((a) => a.jobId !== jobId);
  saveApplications(apps);
}

/** Admin: Approve a job. */
export function adminApproveJob(jobId: string): void {
  const jobs = loadJobs().map((j) =>
    j.id === jobId ? { ...j, status: "Approved" as const } : j,
  );
  saveJobs(jobs);
}

/** Admin: Reject a job. */
export function adminRejectJob(jobId: string): void {
  const jobs = loadJobs().map((j) =>
    j.id === jobId ? { ...j, status: "Rejected" as const } : j,
  );
  saveJobs(jobs);
}

/** Apply to a job. Application starts as Pending. */
export function applyToJob(
  jobId: string,
  employeePhone: string,
  employeeName?: string,
  employeeEmail?: string,
): { success: boolean; alreadyApplied: boolean } {
  const apps = loadApplications();
  const already = apps.some(
    (a) => a.jobId === jobId && a.employeePhone === employeePhone,
  );
  if (already) return { success: false, alreadyApplied: true };

  const jobs = loadJobs();
  const job = jobs.find((j) => j.id === jobId);
  if (!job) return { success: false, alreadyApplied: false };

  const app: LocalApplication = {
    id: `app_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    jobId,
    jobTitle: job.title,
    company: job.company,
    location: job.location,
    employeePhone,
    employeeName,
    employeeEmail,
    appliedAt: Date.now(),
    status: "Pending",
  };
  apps.push(app);
  saveApplications(apps);
  return { success: true, alreadyApplied: false };
}

/** Get applications made by a specific employee. */
export function getMyApplications(employeePhone: string): LocalApplication[] {
  return loadApplications().filter((a) => a.employeePhone === employeePhone);
}

/** Check if employee has already applied to a job. */
export function hasApplied(jobId: string, employeePhone: string): boolean {
  return loadApplications().some(
    (a) => a.jobId === jobId && a.employeePhone === employeePhone,
  );
}

/** Get all applications (for admin). */
export function getAllApplicationsAdmin(): LocalApplication[] {
  return loadApplications();
}

/** Admin: Approve an application. */
export function adminApproveApplication(appId: string): void {
  const apps = loadApplications().map((a) =>
    a.id === appId ? { ...a, status: "Approved" as const } : a,
  );
  saveApplications(apps);
}

/** Admin: Reject an application. */
export function adminRejectApplication(appId: string): void {
  const apps = loadApplications().map((a) =>
    a.id === appId ? { ...a, status: "Rejected" as const } : a,
  );
  saveApplications(apps);
}

/** Get APPROVED applications for employer's jobs (by employer phone). */
export function getApplicationsForEmployer(
  employerPhone: string,
): LocalApplication[] {
  const myJobs = getEmployerJobs(employerPhone);
  const myJobIds = new Set(myJobs.map((j) => j.id));
  return loadApplications().filter(
    (a) => myJobIds.has(a.jobId) && a.status === "Approved",
  );
}
