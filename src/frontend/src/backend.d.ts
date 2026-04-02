import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface WorkerProfile {
    name: string;
    experience: bigint;
    skills: Array<string>;
    location: string;
}
export interface AdminStats {
    totalEmployers: bigint;
    totalJobs: bigint;
    totalUsers: bigint;
    activeJobs: bigint;
    totalApplications: bigint;
}
export interface RecentActivity {
    recentJobs: Array<JobListing>;
    recentApplications: Array<JobApplication>;
}
export interface JobApplication {
    id: bigint;
    job: JobListing;
    status: string;
    workerId: Principal;
    worker: WorkerProfile;
}
export interface JobListing {
    id: bigint;
    title: string;
    salary: string;
    description: string;
    company: string;
    employerId: Principal;
    approved: boolean;
    category: string;
    location: string;
}
export interface EmployerProfile {
    description: string;
    companyName: string;
    location: string;
    industry: string;
}
export interface UserProfile {
    profileType: Variant_employer_worker;
}
export interface Course {
    id: bigint;
    title: string;
    description: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_employer_worker {
    employer = "employer",
    worker = "worker"
}
export interface backendInterface {
    adminApproveJob(jobId: bigint): Promise<void>;
    adminBlockUser(user: Principal): Promise<void>;
    adminDeleteEmployer(user: Principal): Promise<void>;
    adminDeleteJob(jobId: bigint): Promise<void>;
    adminDeleteWorker(user: Principal): Promise<void>;
    adminGetAllApplications(): Promise<Array<JobApplication>>;
    adminGetAllEmployerActivity(): Promise<Array<[Principal, EmployerProfile, bigint, bigint, string]>>;
    adminGetAllEmployerPlans(): Promise<Array<[Principal, string]>>;
    adminGetAllEmployers(): Promise<Array<[Principal, EmployerProfile]>>;
    adminGetAllWorkers(): Promise<Array<[Principal, WorkerProfile]>>;
    adminGetRecentActivity(): Promise<RecentActivity>;
    adminGetStats(): Promise<AdminStats>;
    adminSetEmployerPlan(employer: Principal, plan: string): Promise<void>;
    adminUnblockUser(user: Principal): Promise<void>;
    applyToJob(jobId: bigint): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCourse(title: string, description: string): Promise<bigint>;
    createJobListing(title: string, company: string, location: string, salary: string, category: string, description: string): Promise<bigint>;
    deleteCourse(courseId: bigint): Promise<void>;
    deleteJobListing(jobId: bigint): Promise<void>;
    getAllCourses(): Promise<Array<Course>>;
    getAllJobs(): Promise<Array<JobListing>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCourse(courseId: bigint): Promise<Course | null>;
    getEmployerProfile(user: Principal): Promise<EmployerProfile | null>;
    getJob(jobId: bigint): Promise<JobListing | null>;
    getJobApplications(jobId: bigint): Promise<Array<JobApplication>>;
    getMyApplications(): Promise<Array<JobApplication>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWorkerProfile(user: Principal): Promise<WorkerProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isUserBlocked(user: Principal): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveEmployerProfile(companyName: string, description: string, location: string, industry: string): Promise<void>;
    saveWorkerProfile(name: string, skills: Array<string>, location: string, experience: bigint): Promise<void>;
    updateApplicationStatus(applicationId: bigint, newStatus: string): Promise<void>;
    updateCourse(courseId: bigint, title: string, description: string): Promise<void>;
    updateJobListing(jobId: bigint, title: string, company: string, location: string, salary: string, category: string, description: string): Promise<void>;
}
