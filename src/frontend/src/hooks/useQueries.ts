import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Course,
  JobListing,
  UserProfile,
  WorkerProfile,
} from "../backend.d";
import { Variant_employer_worker } from "../backend.d";
import { useActor } from "./useActor";

export function useGetAllJobs() {
  const { actor, isFetching } = useActor();
  return useQuery<JobListing[]>({
    queryKey: ["jobs"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllJobs();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetJob(jobId: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<JobListing | null>({
    queryKey: ["job", jobId.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getJob(jobId);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllCourses() {
  const { actor, isFetching } = useActor();
  return useQuery<Course[]>({
    queryKey: ["courses"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCourses();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMyApplications() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["myApplications"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyApplications();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isCallerAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useAdminGetStats() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["adminStats"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.adminGetStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminGetAllWorkers() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["adminWorkers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminGetAllWorkers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminGetAllEmployers() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["adminEmployers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminGetAllEmployers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminGetAllApplications() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["adminApplications"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminGetAllApplications();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminGetRecentActivity() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["adminRecentActivity"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.adminGetRecentActivity();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminGetAllEmployerActivity() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["adminEmployerActivity"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminGetAllEmployerActivity();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminApproveJob() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (jobId: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.adminApproveJob(jobId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}

export function useAdminDeleteJob() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (jobId: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.adminDeleteJob(jobId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}

export function useAdminBlockUser() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.adminBlockUser(user);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminWorkers"] });
      qc.invalidateQueries({ queryKey: ["adminEmployers"] });
    },
  });
}

export function useAdminUnblockUser() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.adminUnblockUser(user);
    },
  });
}

export function useAdminDeleteWorker() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.adminDeleteWorker(user);
    },
  });
}

export function useAdminDeleteEmployer() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.adminDeleteEmployer(user);
    },
  });
}

export function useUpdateApplicationStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      applicationId,
      newStatus,
    }: {
      applicationId: bigint;
      newStatus: string;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.updateApplicationStatus(applicationId, newStatus);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminApplications"] });
      qc.invalidateQueries({ queryKey: ["myApplications"] });
    },
  });
}

export function useAdminSetEmployerPlan() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      employer,
      plan,
    }: {
      employer: Principal;
      plan: string;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.adminSetEmployerPlan(employer, plan);
    },
  });
}

export function useApplyToJob() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (jobId: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.applyToJob(jobId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myApplications"] });
    },
  });
}

export function useSaveWorkerProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      skills: string[];
      location: string;
      experience: bigint;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      await Promise.all([
        actor.saveWorkerProfile(
          data.name,
          data.skills,
          data.location,
          data.experience,
        ),
        actor.saveCallerUserProfile({
          profileType: Variant_employer_worker.worker,
        }),
      ]);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

export function useSaveEmployerProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      companyName: string;
      description: string;
      location: string;
      industry: string;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      await Promise.all([
        actor.saveEmployerProfile(
          data.companyName,
          data.description,
          data.location,
          data.industry,
        ),
        actor.saveCallerUserProfile({
          profileType: Variant_employer_worker.employer,
        }),
      ]);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

export function useCreateJob() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title: string;
      company: string;
      location: string;
      salary: string;
      category: string;
      description: string;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.createJobListing(
        data.title,
        data.company,
        data.location,
        data.salary,
        data.category,
        data.description,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}

export function useDeleteJob() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (jobId: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.deleteJobListing(jobId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}

export function useGetJobApplications(jobId: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["jobApplications", jobId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getJobApplications(jobId);
    },
    enabled: !!actor && !isFetching,
  });
}
