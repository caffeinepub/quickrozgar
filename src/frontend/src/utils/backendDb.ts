/**
 * backendDb.ts — ICP backend-based data store for QuickRozgar.
 * Provides cross-device data storage for jobs and applications.
 * Uses anonymous actor (no II required) for public endpoints.
 */
import { createActorWithConfig } from "../config";

// Get anonymous actor (no II)
async function getActor() {
  return createActorWithConfig();
}

// ─── Public Job type (mirrors backend PublicJob) ──────────────────────────────
export interface BackendJob {
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

// ─── Public Application type (mirrors backend PublicApplication) ──────────────
export interface BackendApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  location: string;
  employeePhone: string;
  employeeName: string;
  employeeEmail: string;
  experience: string;
  appliedAt: number;
  status: "Pending" | "Approved" | "Rejected";
  candidateStatus: string;
}

/** Save a job to the ICP backend. */
export async function backendPostJob(
  job: Omit<BackendJob, "status">,
): Promise<void> {
  try {
    const actor = await getActor();
    await actor.publicSaveJob(
      job.id,
      job.title,
      job.company,
      job.location,
      job.salary,
      job.category,
      job.description,
      job.employerPhone,
      BigInt(job.postedAt),
    );
  } catch (e) {
    console.error("[backendDb] Failed to save job:", e);
    // Non-fatal: localStorage copy still exists
  }
}

/** Save an application to the ICP backend. */
export async function backendApplyToJob(
  app: Omit<BackendApplication, "status" | "candidateStatus">,
): Promise<{ success: boolean; alreadyApplied: boolean }> {
  try {
    const actor = await getActor();
    await actor.publicSaveApplication(
      app.id,
      app.jobId,
      app.jobTitle,
      app.company,
      app.location,
      app.employeePhone,
      app.employeeName,
      app.employeeEmail,
      app.experience,
      BigInt(app.appliedAt),
    );
    return { success: true, alreadyApplied: false };
  } catch (e: unknown) {
    const msg = String(e);
    if (msg.includes("Already applied")) {
      return { success: false, alreadyApplied: true };
    }
    console.error("[backendDb] Failed to save application:", e);
    return { success: false, alreadyApplied: false };
  }
}

/** Get all jobs (for admin). */
export async function backendGetAllJobs(): Promise<BackendJob[]> {
  try {
    const actor = await getActor();
    const jobs = await actor.publicGetAllJobs();
    return jobs.map((j) => ({
      id: j.id,
      title: j.title,
      company: j.company,
      location: j.location,
      salary: j.salary,
      category: j.category,
      description: j.description,
      employerPhone: j.employerPhone,
      postedAt: Number(j.postedAt),
      status: j.status as "Pending" | "Approved" | "Rejected",
    }));
  } catch (e) {
    console.error("[backendDb] Failed to get jobs:", e);
    return [];
  }
}

/** Get only approved jobs (for employees). */
export async function backendGetApprovedJobs(): Promise<BackendJob[]> {
  try {
    const actor = await getActor();
    const jobs = await actor.publicGetApprovedJobs();
    return jobs.map((j) => ({
      id: j.id,
      title: j.title,
      company: j.company,
      location: j.location,
      salary: j.salary,
      category: j.category,
      description: j.description,
      employerPhone: j.employerPhone,
      postedAt: Number(j.postedAt),
      status: "Approved" as const,
    }));
  } catch (e) {
    console.error("[backendDb] Failed to get approved jobs:", e);
    return [];
  }
}

/** Get all applications (for admin). */
export async function backendGetAllApplications(): Promise<
  BackendApplication[]
> {
  try {
    const actor = await getActor();
    const apps = await actor.publicGetAllApplications();
    return apps.map((a) => ({
      id: a.id,
      jobId: a.jobId,
      jobTitle: a.jobTitle,
      company: a.company,
      location: a.location,
      employeePhone: a.employeePhone,
      employeeName: a.employeeName,
      employeeEmail: a.employeeEmail,
      experience: a.experience,
      appliedAt: Number(a.appliedAt),
      status: a.status as "Pending" | "Approved" | "Rejected",
      candidateStatus: a.candidateStatus,
    }));
  } catch (e) {
    console.error("[backendDb] Failed to get applications:", e);
    return [];
  }
}

/** Get applications for a specific employee. */
export async function backendGetMyApplications(
  phone: string,
): Promise<BackendApplication[]> {
  try {
    const actor = await getActor();
    const apps = await actor.publicGetMyApplications(phone);
    return apps.map((a) => ({
      id: a.id,
      jobId: a.jobId,
      jobTitle: a.jobTitle,
      company: a.company,
      location: a.location,
      employeePhone: a.employeePhone,
      employeeName: a.employeeName,
      employeeEmail: a.employeeEmail,
      experience: a.experience,
      appliedAt: Number(a.appliedAt),
      status: a.status as "Pending" | "Approved" | "Rejected",
      candidateStatus: a.candidateStatus,
    }));
  } catch (e) {
    console.error("[backendDb] Failed to get my applications:", e);
    return [];
  }
}

/** Get applications for employer's jobs (approved only). */
export async function backendGetEmployerApplications(
  employerPhone: string,
): Promise<BackendApplication[]> {
  try {
    const actor = await getActor();
    const apps = await actor.publicGetEmployerApplications(employerPhone);
    return apps.map((a) => ({
      id: a.id,
      jobId: a.jobId,
      jobTitle: a.jobTitle,
      company: a.company,
      location: a.location,
      employeePhone: a.employeePhone,
      employeeName: a.employeeName,
      employeeEmail: a.employeeEmail,
      experience: a.experience,
      appliedAt: Number(a.appliedAt),
      status: a.status as "Pending" | "Approved" | "Rejected",
      candidateStatus: a.candidateStatus,
    }));
  } catch (e) {
    console.error("[backendDb] Failed to get employer applications:", e);
    return [];
  }
}

/** Get jobs for a specific employer. */
export async function backendGetEmployerJobs(
  employerPhone: string,
): Promise<BackendJob[]> {
  try {
    const actor = await getActor();
    const jobs = await actor.publicGetEmployerJobs(employerPhone);
    return jobs.map((j) => ({
      id: j.id,
      title: j.title,
      company: j.company,
      location: j.location,
      salary: j.salary,
      category: j.category,
      description: j.description,
      employerPhone: j.employerPhone,
      postedAt: Number(j.postedAt),
      status: j.status as "Pending" | "Approved" | "Rejected",
    }));
  } catch (e) {
    console.error("[backendDb] Failed to get employer jobs:", e);
    return [];
  }
}

/** Admin: approve or reject a job. */
export async function backendAdminUpdateJobStatus(
  jobId: string,
  status: "Approved" | "Rejected",
): Promise<void> {
  try {
    const actor = await getActor();
    await actor.publicAdminUpdateJobStatus(jobId, status);
  } catch (e) {
    console.error("[backendDb] Failed to update job status:", e);
    throw new Error("Action failed, please try again");
  }
}

/** Admin: approve or reject an application. */
export async function backendAdminUpdateApplicationStatus(
  appId: string,
  status: "Approved" | "Rejected",
): Promise<void> {
  try {
    const actor = await getActor();
    await actor.publicAdminUpdateApplicationStatus(appId, status);
  } catch (e) {
    console.error("[backendDb] Failed to update application status:", e);
    throw new Error("Action failed, please try again");
  }
}

/** Admin: delete a job. */
export async function backendAdminDeleteJob(jobId: string): Promise<void> {
  try {
    const actor = await getActor();
    await actor.publicAdminDeleteJob(jobId);
  } catch (e) {
    console.error("[backendDb] Failed to delete job:", e);
    throw new Error("Action failed, please try again");
  }
}

/** Employer: update candidate status. */
export async function backendUpdateCandidateStatus(
  appId: string,
  candidateStatus: string,
): Promise<void> {
  try {
    const actor = await getActor();
    await actor.publicUpdateCandidateStatus(appId, candidateStatus);
  } catch (e) {
    console.error("[backendDb] Failed to update candidate status:", e);
    throw new Error("Action failed, please try again");
  }
}

/** Save employer profile (company name) to backend. */
export async function backendSaveEmployerProfile(
  phone: string,
  companyName: string,
): Promise<void> {
  try {
    const actor = await getActor();
    await actor.publicSaveEmployerProfile(phone, companyName);
  } catch (e) {
    console.error("[backendDb] Failed to save employer profile:", e);
  }
}

/** Save employer plan to backend. */
export async function backendSaveEmployerPlan(
  phone: string,
  plan: string,
): Promise<void> {
  try {
    const actor = await getActor();
    await actor.publicSaveEmployerPlan(phone, plan);
  } catch (e) {
    console.error("[backendDb] Failed to save employer plan:", e);
  }
}

/** Get all employer profiles (phone -> companyName). */
export async function backendGetAllEmployerProfiles(): Promise<
  Array<[string, string]>
> {
  try {
    const actor = await getActor();
    return actor.publicGetAllEmployerProfiles();
  } catch (e) {
    console.error("[backendDb] Failed to get employer profiles:", e);
    return [];
  }
}

/** Get all employer plans (phone -> plan). */
export async function backendGetAllEmployerPlans(): Promise<
  Array<[string, string]>
> {
  try {
    const actor = await getActor();
    return actor.publicGetAllEmployerPlans2();
  } catch (e) {
    console.error("[backendDb] Failed to get employer plans:", e);
    return [];
  }
}
