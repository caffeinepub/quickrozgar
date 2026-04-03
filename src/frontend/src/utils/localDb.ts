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
  experience?: string;
  appliedAt: number;
  status: "Pending" | "Approved" | "Rejected";
  candidateStatus?: string; // Employer-managed: Under Review | Selected | Rejected
}

export interface EmployerProfileData {
  companyName: string;
  updatedAt: number;
}

export interface EmployeeProfileData {
  name: string;
  phone: string;
  email: string;
  updatedAt: number;
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

/** Save employer profile data (company name etc) keyed by employer phone. */
export function saveEmployerProfileData(
  phone: string,
  data: Omit<EmployerProfileData, "updatedAt">,
): void {
  const key = `qr_erp_profile_${phone}`;
  const record: EmployerProfileData = { ...data, updatedAt: Date.now() };
  localStorage.setItem(key, JSON.stringify(record));
}

/** Get employer profile data by phone. Returns null if not found. */
export function getEmployerProfileData(
  phone: string,
): EmployerProfileData | null {
  try {
    const key = `qr_erp_profile_${phone}`;
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as EmployerProfileData) : null;
  } catch {
    return null;
  }
}

/** Save employee profile data (name, phone, email) permanently keyed by phone. */
export function saveEmployeeProfile(
  phone: string,
  name: string,
  email: string,
): void {
  const key = `qr_emp_profile_${phone}`;
  const record: EmployeeProfileData = {
    name,
    phone,
    email,
    updatedAt: Date.now(),
  };
  localStorage.setItem(key, JSON.stringify(record));
}

/** Get employee profile data by phone. Returns null if not found. */
export function getEmployeeProfile(phone: string): EmployeeProfileData | null {
  try {
    const key = `qr_emp_profile_${phone}`;
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as EmployeeProfileData) : null;
  } catch {
    return null;
  }
}

/** Get all employee profiles (for admin export). */
export function getAllEmployeeProfiles(): EmployeeProfileData[] {
  const profiles: EmployeeProfileData[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith("qr_emp_profile_")) {
      try {
        const raw = localStorage.getItem(key);
        if (raw) profiles.push(JSON.parse(raw) as EmployeeProfileData);
      } catch {
        // ignore
      }
    }
  }
  return profiles;
}

/** Get all employer profiles (for admin export). */
export function getAllEmployerProfilesForExport(): Array<
  EmployerProfileData & { phone: string; plan: string }
> {
  const results: Array<EmployerProfileData & { phone: string; plan: string }> =
    [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith("qr_erp_profile_")) {
      try {
        const phone = key.replace("qr_erp_profile_", "");
        const raw = localStorage.getItem(key);
        if (raw) {
          const data = JSON.parse(raw) as EmployerProfileData;
          const planRaw = localStorage.getItem(`qr_erp_plan_${phone}`);
          const plan = planRaw ? planRaw.trim().replace(/"/g, "") : "Basic";
          results.push({ ...data, phone, plan });
        }
      } catch {
        // ignore
      }
    }
  }
  return results;
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
  experience?: string,
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
    experience,
    appliedAt: Date.now(),
    status: "Pending",
    candidateStatus: "Under Review",
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

/** Employer: Update candidate status for an application. */
export function updateCandidateStatus(
  appId: string,
  candidateStatus: string,
): void {
  const apps = loadApplications().map((a) =>
    a.id === appId ? { ...a, candidateStatus } : a,
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
