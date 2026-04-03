import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  Bookmark,
  ChevronRight,
  HelpCircle,
  LogOut,
  Pencil,
  Settings,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { TabName } from "../components/BottomNav";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "../hooks/useQueries";
import {
  getEmployeeSession,
  saveEmployeeSession,
} from "../utils/employeeSession";
import { getMyApplications as getLocalApplications } from "../utils/localDb";

interface ProfileScreenProps {
  onNavigate: (tab: TabName) => void;
  onSetupProfile: () => void;
  onEmployer: () => void;
  onLogout?: () => void;
}

const NOTIFICATIONS = [
  { title: "New Waiter jobs in Siliguri", time: "2 hours ago", icon: "🍽️" },
  {
    title: "Chef vacancy at Mayfair Hotels",
    time: "5 hours ago",
    icon: "👨‍🍳",
  },
  {
    title: "Delivery partner needed in Gangtok",
    time: "1 day ago",
    icon: "📦",
  },
];

const _SAMPLE_APPLIED = [
  {
    id: "1",
    company: "Hotel Taj",
    jobTitle: "Head Cook",
    date: "Mar 25, 2026",
    status: "Under Review",
  },
  {
    id: "2",
    company: "Zomato",
    jobTitle: "Delivery Executive",
    date: "Mar 20, 2026",
    status: "Selected",
  },
  {
    id: "3",
    company: "G4S Security",
    jobTitle: "Security Guard",
    date: "Mar 15, 2026",
    status: "Applied",
  },
];

const SAMPLE_SAVED = [
  {
    id: "s1",
    title: "Head Cook",
    company: "Hotel Mayfair",
    salary: "₹10,000 – ₹20,000/month",
  },
  {
    id: "s2",
    title: "Waiter",
    company: "Barbeque Nation",
    salary: "₹10,000 – ₹20,000/month",
  },
  {
    id: "s3",
    title: "Housekeeping Staff",
    company: "Lemon Tree Hotels",
    salary: "₹10,000 – ₹20,000/month",
  },
];

type SavedJob = { title: string; company: string; id: string; salary?: string };

function getSavedJobs(): SavedJob[] {
  try {
    return JSON.parse(localStorage.getItem("savedJobs") ?? "[]");
  } catch {
    return [];
  }
}

function removeSavedJob(id: string) {
  const jobs = getSavedJobs().filter((j) => j.id !== id);
  localStorage.setItem("savedJobs", JSON.stringify(jobs));
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case "Selected":
      return "bg-green-100 text-green-700";
    case "Rejected":
      return "bg-red-100 text-red-700";
    case "Under Review":
      return "bg-yellow-100 text-yellow-700";
    case "Interview":
      return "bg-purple-100 text-purple-700";
    default:
      return "bg-blue-100 text-blue-700";
  }
}

const TIMELINE_STEPS = ["Applied", "Under Review", "Interview", "Selected"];

function getStepIndex(status: string) {
  if (status === "Rejected") return -1;
  return TIMELINE_STEPS.indexOf(status);
}

function TimelineBar({ status }: { status: string }) {
  const stepIdx = getStepIndex(status);
  const isRejected = status === "Rejected";

  const stepColor = (idx: number) => {
    if (isRejected) return idx === 0 ? "bg-red-400" : "bg-muted";
    if (idx <= stepIdx) {
      if (status === "Selected") return "bg-green-500";
      if (status === "Interview") return "bg-purple-500";
      if (status === "Under Review") return "bg-yellow-400";
      return "bg-blue-500";
    }
    return "bg-muted";
  };

  const textColor = (idx: number) => {
    if (isRejected) return idx === 0 ? "text-red-500" : "text-muted-foreground";
    if (idx <= stepIdx) return "text-foreground";
    return "text-muted-foreground";
  };

  const labels = isRejected ? ["Applied", "Rejected"] : TIMELINE_STEPS;

  return (
    <div className="flex items-center gap-0 mt-3">
      {labels.map((step, idx) => (
        <div key={step} className="flex items-center">
          <div className="flex flex-col items-center gap-0.5">
            <div
              className={`w-3.5 h-3.5 rounded-full border-2 ${
                (isRejected ? idx === 0 : idx <= stepIdx)
                  ? `${stepColor(idx)} border-transparent`
                  : "bg-background border-muted-foreground/30"
              }`}
            />
            <span className={`text-[8px] font-medium ${textColor(idx)}`}>
              {step}
            </span>
          </div>
          {idx < labels.length - 1 && (
            <div
              className={`h-0.5 w-8 mb-3 ${
                (isRejected && idx === 0) || (!isRejected && idx < stepIdx)
                  ? stepColor(idx)
                  : "bg-muted"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function ProfileScreen({
  onSetupProfile,
  onLogout,
}: ProfileScreenProps) {
  const { login, clear, loginStatus, identity, isInitializing } =
    useInternetIdentity();
  const { data: userProfile, isLoading } = useGetCallerUserProfile();
  const [applications, setApplications] = useState(() => {
    const sess = getEmployeeSession();
    if (!sess) return [];
    return getLocalApplications(sess.phone);
  });
  const _ = setApplications; // suppress unused warning
  const qc = useQueryClient();
  const isAuthenticated = !!identity;
  const [_sessionRefresh, setSessionRefresh] = useState(0);
  const employeeSession = getEmployeeSession();

  const [notifOpen, setNotifOpen] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);
  const [appliedOpen, setAppliedOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>(getSavedJobs);
  const [appliedFromSaved, setAppliedFromSaved] = useState<Set<string>>(
    new Set(),
  );

  // Name editing state
  const [editingName, setEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState("");

  const [settingsForm, setSettingsForm] = useState({
    name: employeeSession?.name ?? "",
    phone: "",
    city: "",
  });

  // sessionRefresh drives re-reads of the session (used in displayName computation)

  // Map backend applications to display format
  const displayApplications = (() => {
    if (Array.isArray(applications) && applications.length > 0) {
      return applications.map((app) => ({
        id: app.id,
        company: app.company ?? "Company",
        jobTitle: app.jobTitle ?? "Job",
        date: "Recent",
        status: app.status ?? "Applied",
      }));
    }
    return [];
  })();

  const displaySaved = savedJobs.length > 0 ? savedJobs : SAMPLE_SAVED;

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      qc.clear();
    } else {
      try {
        await login();
      } catch (err: any) {
        if (err?.message === "User is already authenticated") {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const handleLogoutClick = () => {
    if (employeeSession) {
      onLogout?.();
    } else {
      handleAuth();
    }
  };

  const handleSaveSettings = () => {
    if (employeeSession) {
      saveEmployeeSession(
        employeeSession.phone,
        employeeSession.email,
        settingsForm.name,
      );
      setSessionRefresh((n) => n + 1);
    }
    localStorage.setItem("userSettings", JSON.stringify(settingsForm));
    toast.success("Settings save ho gayi! ✅");
    setSettingsOpen(false);
  };

  const handleSaveName = () => {
    if (!employeeSession) return;
    const trimmed = editNameValue.trim();
    if (!trimmed) {
      toast.error("Naam khali nahi ho sakta");
      return;
    }
    saveEmployeeSession(employeeSession.phone, employeeSession.email, trimmed);
    setSessionRefresh((n) => n + 1);
    setEditingName(false);
    toast.success("Naam update ho gaya! ✅");
  };

  const handleRemoveSaved = (id: string) => {
    removeSavedJob(id);
    setSavedJobs(getSavedJobs());
    toast.success("Job remove ho gayi!");
  };

  const handleApplyFromSaved = (job: SavedJob) => {
    setAppliedFromSaved((prev) => new Set([...prev, job.id]));
    toast.success("Application bhej di gayi! ✅");
  };

  if (isInitializing || isLoading) {
    return (
      <div
        className="flex items-center justify-center h-screen"
        data-ocid="profile.loading_state"
      >
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 animate-pulse mx-auto" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in at all — show login prompt
  if (!isAuthenticated && !employeeSession) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="bg-primary px-4 pt-12 pb-8 rounded-b-[2rem]">
          <h1 className="text-primary-foreground font-bold text-xl">
            Mera Profile 👤
          </h1>
          <p className="text-primary-foreground/80 text-sm mt-1">
            Login karo, naukri pao
          </p>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-6">
          <div className="w-28 h-28 rounded-full bg-muted flex items-center justify-center">
            <User size={56} className="text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Login Karo</h2>
            <p className="text-muted-foreground text-sm mt-2">
              Apna account banao ya login karo aur apni naukri dhundo
            </p>
          </div>
          <Button
            className="w-full h-14 rounded-2xl text-base font-bold"
            onClick={handleAuth}
            disabled={loginStatus === "logging-in"}
            data-ocid="profile.login_button"
          >
            {loginStatus === "logging-in"
              ? "Login ho raha hai..."
              : "Login Karo 🔐"}
          </Button>
        </div>
      </div>
    );
  }

  const hasProfile = !!userProfile;

  // Employee session profile view
  if (employeeSession && !isAuthenticated) {
    // Current name from session (re-reads on sessionRefresh)
    const currentSession = getEmployeeSession();
    const displayName = currentSession?.name || "Employee";

    return (
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <div className="bg-primary px-4 pt-12 pb-8 rounded-b-[2rem]">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl">
              👤
            </div>
            <div className="flex-1">
              {editingName ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={editNameValue}
                    onChange={(e) => setEditNameValue(e.target.value)}
                    className="h-8 rounded-xl bg-white/20 border-white/30 text-white placeholder:text-white/50 text-sm"
                    placeholder="Naam likho"
                    autoFocus
                    data-ocid="profile.name_edit.input"
                  />
                  <Button
                    size="sm"
                    className="h-8 rounded-xl bg-white text-primary font-bold text-xs px-3"
                    onClick={handleSaveName}
                    data-ocid="profile.name_edit.save_button"
                  >
                    Save
                  </Button>
                  <button
                    type="button"
                    className="text-white/70 text-xs"
                    onClick={() => setEditingName(false)}
                    data-ocid="profile.name_edit.cancel_button"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-primary-foreground font-bold text-lg">
                    {displayName}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setEditNameValue(
                        displayName === "Employee" ? "" : displayName,
                      );
                      setEditingName(true);
                    }}
                    className="text-white/70 hover:text-white transition-colors"
                    data-ocid="profile.name_edit_button"
                  >
                    <Pencil size={14} />
                  </button>
                </div>
              )}
              <p className="text-primary-foreground/70 text-xs">
                📱 {employeeSession.phone}
              </p>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <div className="flex-1 bg-white/15 rounded-xl p-3 text-center">
              <p className="text-white font-bold text-lg">
                {displayApplications.length}
              </p>
              <p className="text-white/70 text-[10px]">Applications</p>
            </div>
            <div className="flex-1 bg-white/15 rounded-xl p-3 text-center">
              <p className="text-white font-bold text-lg">3</p>
              <p className="text-white/70 text-[10px]">Interviews</p>
            </div>
            <div className="flex-1 bg-white/15 rounded-xl p-3 text-center">
              <p className="text-white font-bold text-lg">{savedJobs.length}</p>
              <p className="text-white/70 text-[10px]">Saved</p>
            </div>
          </div>
        </div>

        <div className="flex-1 px-4 mt-4 space-y-4 pb-6">
          {/* Applied Jobs Section */}
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <button
              type="button"
              className="w-full px-4 py-3 flex items-center justify-between"
              onClick={() => setAppliedOpen(true)}
              data-ocid="profile.applied_jobs_button"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">📋</span>
                <p className="font-bold text-sm text-foreground">
                  Applied Jobs
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {displayApplications.length}
                </Badge>
                <ChevronRight size={14} className="text-muted-foreground" />
              </div>
            </button>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            {[
              {
                icon: Bell,
                label: "Notifications",
                sublabel: "Job alerts dekho",
                action: () => setNotifOpen(true),
                ocid: "profile.notifications_button",
              },
              {
                icon: Bookmark,
                label: "Saved Jobs",
                sublabel: "Baad mein apply karo",
                action: () => setSavedOpen(true),
                ocid: "profile.saved_jobs_button",
              },
              {
                icon: HelpCircle,
                label: "Help & Support",
                sublabel: "Koi problem? Batao",
                action: () => {},
                ocid: "profile.help_button",
              },
              {
                icon: Settings,
                label: "Settings",
                sublabel: "Account settings",
                action: () => {
                  const s = getEmployeeSession();
                  if (s?.name)
                    setSettingsForm((f) => ({ ...f, name: s.name ?? "" }));
                  setSettingsOpen(true);
                },
                ocid: "profile.settings_button",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  type="button"
                  key={item.label}
                  className="w-full bg-card rounded-2xl p-4 shadow-card flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
                  onClick={item.action}
                  data-ocid={item.ocid}
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon size={18} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-foreground">
                      {item.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.sublabel}
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </button>
              );
            })}
          </div>

          <Separator />

          <Button
            variant="outline"
            className="w-full h-12 rounded-2xl font-bold text-destructive border-destructive/20"
            onClick={() => onLogout?.()}
            data-ocid="profile.logout_button"
          >
            <LogOut size={16} className="mr-2" />
            Logout Karo
          </Button>
        </div>

        {/* Applied Jobs Sheet */}
        <Sheet open={appliedOpen} onOpenChange={setAppliedOpen}>
          <SheetContent
            side="bottom"
            className="rounded-t-3xl max-h-[85vh] overflow-y-auto"
            data-ocid="profile.applied_jobs.sheet"
          >
            <SheetHeader>
              <SheetTitle>📋 Applied Jobs</SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-4 pb-4">
              {displayApplications.length === 0 && (
                <p
                  className="text-center text-muted-foreground text-sm py-6"
                  data-ocid="profile.applied_jobs.empty_state"
                >
                  Koi application nahi hai. Jobs mein 'Apply Now' dabao! 🙏
                </p>
              )}
              {displayApplications.map((app: any, i: number) => (
                <div
                  key={app.id ?? String(i)}
                  className="bg-muted rounded-2xl p-4"
                  data-ocid={`profile.applied_jobs.item.${i + 1}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-sm text-foreground">
                        {app.company ?? "Company"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {app.jobTitle ?? "Job"}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Applied on {app.date ?? "Mar 29, 2026"}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-semibold shrink-0 ${getStatusBadgeClass(app.status ?? "Applied")}`}
                    >
                      {app.status ?? "Applied"}
                    </span>
                  </div>
                  <TimelineBar status={app.status ?? "Applied"} />
                </div>
              ))}
            </div>
          </SheetContent>
        </Sheet>

        {/* Notifications Sheet */}
        <Sheet open={notifOpen} onOpenChange={setNotifOpen}>
          <SheetContent
            side="bottom"
            className="rounded-t-3xl"
            data-ocid="profile.notifications.sheet"
          >
            <SheetHeader>
              <SheetTitle>🔔 Job Notifications</SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-3">
              {NOTIFICATIONS.map((n) => (
                <div
                  key={n.title}
                  className="flex items-center gap-3 bg-muted rounded-2xl p-3"
                >
                  <span className="text-2xl">{n.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">
                      {n.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </SheetContent>
        </Sheet>

        {/* Saved Jobs Sheet */}
        <Sheet open={savedOpen} onOpenChange={setSavedOpen}>
          <SheetContent
            side="bottom"
            className="rounded-t-3xl max-h-[85vh] overflow-y-auto"
            data-ocid="profile.saved_jobs.sheet"
          >
            <SheetHeader>
              <SheetTitle>🔖 Saved Jobs</SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-3 pb-4">
              {displaySaved.length === 0 ? (
                <p
                  className="text-center text-muted-foreground text-sm py-8"
                  data-ocid="profile.saved_jobs.empty_state"
                >
                  Koi saved job nahi hai. Jobs mein dil ka button dabao!
                </p>
              ) : (
                displaySaved.map((job, i) => {
                  const isApplied = appliedFromSaved.has(job.id);
                  return (
                    <div
                      key={job.id}
                      className="bg-muted rounded-2xl p-4"
                      data-ocid={`profile.saved_jobs.item.${i + 1}`}
                    >
                      <p className="font-bold text-sm text-foreground">
                        {job.company}
                      </p>
                      <p className="text-amber-600 font-semibold text-xs mt-0.5">
                        {job.salary ?? "₹10,000 – ₹20,000/month"}
                      </p>
                      <p className="text-sm text-foreground mt-1">
                        {job.title}
                      </p>
                      <div className="flex gap-2 mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 rounded-xl text-xs text-destructive border-destructive/30"
                          onClick={() => handleRemoveSaved(job.id)}
                          data-ocid={`profile.saved_jobs.remove.${i + 1}_button`}
                        >
                          Remove
                        </Button>
                        {isApplied ? (
                          <div className="flex-1 text-center bg-green-50 text-green-700 border border-green-200 rounded-xl py-1.5 text-xs font-semibold">
                            Applied ✓
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            className="flex-1 rounded-xl text-xs"
                            onClick={() => handleApplyFromSaved(job)}
                            data-ocid={`profile.saved_jobs.apply.${i + 1}_button`}
                          >
                            Apply Now
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* Settings Sheet */}
        <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
          <SheetContent
            side="bottom"
            className="rounded-t-3xl"
            data-ocid="profile.settings.sheet"
          >
            <SheetHeader>
              <SheetTitle>⚙️ Settings</SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="settings-name">Naam</Label>
                <Input
                  id="settings-name"
                  placeholder="Aapka naam"
                  value={settingsForm.name}
                  onChange={(e) =>
                    setSettingsForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className="rounded-xl"
                  data-ocid="profile.settings.name_input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="settings-phone">Phone Number</Label>
                <Input
                  id="settings-phone"
                  type="tel"
                  placeholder="10-digit number"
                  value={settingsForm.phone}
                  onChange={(e) =>
                    setSettingsForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  className="rounded-xl"
                  data-ocid="profile.settings.phone_input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="settings-city">City / Location</Label>
                <Input
                  id="settings-city"
                  placeholder="Aapka sheher"
                  value={settingsForm.city}
                  onChange={(e) =>
                    setSettingsForm((f) => ({ ...f, city: e.target.value }))
                  }
                  className="rounded-xl"
                  data-ocid="profile.settings.city_input"
                />
              </div>
              <Button
                className="w-full rounded-2xl font-bold"
                onClick={handleSaveSettings}
                data-ocid="profile.settings.save_button"
              >
                Save Changes ✅
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  // II-authenticated user (employer or II-based employee)
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="bg-primary px-4 pt-12 pb-8 rounded-b-[2rem]">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl">
            👤
          </div>
          <div>
            <p className="text-primary-foreground font-bold text-lg">
              {hasProfile ? "Worker" : "New User"}
            </p>
            <p className="text-primary-foreground/70 text-xs truncate max-w-[200px]">
              {identity?.getPrincipal().toString().substring(0, 16)}...
            </p>
          </div>
        </div>
        {hasProfile && (
          <div className="mt-4 flex gap-3">
            <div className="flex-1 bg-white/15 rounded-xl p-3 text-center">
              <p className="text-white font-bold text-lg">
                {displayApplications.length}
              </p>
              <p className="text-white/70 text-[10px]">Applications</p>
            </div>
            <div className="flex-1 bg-white/15 rounded-xl p-3 text-center">
              <p className="text-white font-bold text-lg">3</p>
              <p className="text-white/70 text-[10px]">Interviews</p>
            </div>
            <div className="flex-1 bg-white/15 rounded-xl p-3 text-center">
              <p className="text-white font-bold text-lg">{savedJobs.length}</p>
              <p className="text-white/70 text-[10px]">Saved</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 px-4 mt-4 space-y-4 pb-6">
        {/* Setup Profile CTA */}
        {!hasProfile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-accent/10 rounded-2xl p-4 flex items-center gap-4"
          >
            <span className="text-3xl">📝</span>
            <div className="flex-1">
              <p className="font-bold text-foreground text-sm">Profile banao</p>
              <p className="text-xs text-muted-foreground">Jaldi jobs milegi</p>
            </div>
            <Button
              size="sm"
              className="rounded-xl text-xs font-bold bg-accent text-white"
              onClick={onSetupProfile}
              data-ocid="profile.setup_button"
            >
              Banao
            </Button>
          </motion.div>
        )}

        {/* Applied Jobs Section */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <button
            type="button"
            className="w-full px-4 py-3 flex items-center justify-between"
            onClick={() => setAppliedOpen(true)}
            data-ocid="profile.applied_jobs_button"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">📋</span>
              <p className="font-bold text-sm text-foreground">Applied Jobs</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {displayApplications.length}
              </Badge>
              <ChevronRight size={14} className="text-muted-foreground" />
            </div>
          </button>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          {[
            {
              icon: Bell,
              label: "Notifications",
              sublabel: "Job alerts dekho",
              action: () => setNotifOpen(true),
              ocid: "profile.notifications_button",
            },
            {
              icon: Bookmark,
              label: "Saved Jobs",
              sublabel: "Baad mein apply karo",
              action: () => setSavedOpen(true),
              ocid: "profile.saved_jobs_button",
            },
            {
              icon: HelpCircle,
              label: "Help & Support",
              sublabel: "Koi problem? Batao",
              action: () => {},
              ocid: "profile.help_button",
            },
            {
              icon: Settings,
              label: "Settings",
              sublabel: "Account settings",
              action: () => setSettingsOpen(true),
              ocid: "profile.settings_button",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                type="button"
                key={item.label}
                className="w-full bg-card rounded-2xl p-4 shadow-card flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
                onClick={item.action}
                data-ocid={item.ocid}
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon size={18} className="text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-foreground">
                    {item.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.sublabel}
                  </p>
                </div>
                <ChevronRight size={16} className="text-muted-foreground" />
              </button>
            );
          })}
        </div>

        <Separator />

        <Button
          variant="outline"
          className="w-full h-12 rounded-2xl font-bold text-destructive border-destructive/20"
          onClick={handleLogoutClick}
          data-ocid="profile.logout_button"
        >
          <LogOut size={16} className="mr-2" />
          Logout Karo
        </Button>
      </div>

      {/* Applied Jobs Sheet */}
      <Sheet open={appliedOpen} onOpenChange={setAppliedOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-3xl max-h-[85vh] overflow-y-auto"
          data-ocid="profile.applied_jobs.sheet"
        >
          <SheetHeader>
            <SheetTitle>📋 Applied Jobs</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-4 pb-4">
            {displayApplications.map((app: any, i: number) => (
              <div
                key={app.id ?? String(i)}
                className="bg-muted rounded-2xl p-4"
                data-ocid={`profile.applied_jobs.item.${i + 1}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-sm text-foreground">
                      {app.company ?? "Company"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {app.jobTitle ?? "Job"}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Applied on {app.date ?? "Mar 29, 2026"}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-semibold shrink-0 ${getStatusBadgeClass(app.status ?? "Applied")}`}
                  >
                    {app.status ?? "Applied"}
                  </span>
                </div>
                <TimelineBar status={app.status ?? "Applied"} />
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* Notifications Sheet */}
      <Sheet open={notifOpen} onOpenChange={setNotifOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-3xl"
          data-ocid="profile.notifications.sheet"
        >
          <SheetHeader>
            <SheetTitle>🔔 Job Notifications</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-3">
            {NOTIFICATIONS.map((n) => (
              <div
                key={n.title}
                className="flex items-center gap-3 bg-muted rounded-2xl p-3"
              >
                <span className="text-2xl">{n.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    {n.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{n.time}</p>
                </div>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* Saved Jobs Sheet */}
      <Sheet open={savedOpen} onOpenChange={setSavedOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-3xl max-h-[85vh] overflow-y-auto"
          data-ocid="profile.saved_jobs.sheet"
        >
          <SheetHeader>
            <SheetTitle>🔖 Saved Jobs</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-3 pb-4">
            {displaySaved.length === 0 ? (
              <p
                className="text-center text-muted-foreground text-sm py-8"
                data-ocid="profile.saved_jobs.empty_state"
              >
                Koi saved job nahi hai. Jobs mein dil ka button dabao!
              </p>
            ) : (
              displaySaved.map((job, i) => {
                const isApplied = appliedFromSaved.has(job.id);
                return (
                  <div
                    key={job.id}
                    className="bg-muted rounded-2xl p-4"
                    data-ocid={`profile.saved_jobs.item.${i + 1}`}
                  >
                    <p className="font-bold text-sm text-foreground">
                      {job.company}
                    </p>
                    <p className="text-amber-600 font-semibold text-xs mt-0.5">
                      {job.salary ?? "₹10,000 – ₹20,000/month"}
                    </p>
                    <p className="text-sm text-foreground mt-1">{job.title}</p>
                    <div className="flex gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 rounded-xl text-xs text-destructive border-destructive/30"
                        onClick={() => handleRemoveSaved(job.id)}
                        data-ocid={`profile.saved_jobs.remove.${i + 1}_button`}
                      >
                        Remove
                      </Button>
                      {isApplied ? (
                        <div className="flex-1 text-center bg-green-50 text-green-700 border border-green-200 rounded-xl py-1.5 text-xs font-semibold">
                          Applied ✓
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          className="flex-1 rounded-xl text-xs"
                          onClick={() => handleApplyFromSaved(job)}
                          data-ocid={`profile.saved_jobs.apply.${i + 1}_button`}
                        >
                          Apply Now
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Settings Sheet */}
      <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-3xl"
          data-ocid="profile.settings.sheet"
        >
          <SheetHeader>
            <SheetTitle>⚙️ Settings</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="settings-name">Naam</Label>
              <Input
                id="settings-name"
                placeholder="Aapka naam"
                value={settingsForm.name}
                onChange={(e) =>
                  setSettingsForm((f) => ({ ...f, name: e.target.value }))
                }
                className="rounded-xl"
                data-ocid="profile.settings.name_input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="settings-phone">Phone Number</Label>
              <Input
                id="settings-phone"
                type="tel"
                placeholder="10-digit number"
                value={settingsForm.phone}
                onChange={(e) =>
                  setSettingsForm((f) => ({ ...f, phone: e.target.value }))
                }
                className="rounded-xl"
                data-ocid="profile.settings.phone_input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="settings-city">City / Location</Label>
              <Input
                id="settings-city"
                placeholder="Aapka sheher"
                value={settingsForm.city}
                onChange={(e) =>
                  setSettingsForm((f) => ({ ...f, city: e.target.value }))
                }
                className="rounded-xl"
                data-ocid="profile.settings.city_input"
              />
            </div>
            <Button
              className="w-full rounded-2xl font-bold"
              onClick={handleSaveSettings}
              data-ocid="profile.settings.save_button"
            >
              Save Changes ✅
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
