import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Principal } from "@icp-sdk/core/principal";
import {
  Bell,
  Briefcase,
  CheckCircle,
  ClipboardList,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Search,
  Trash2,
  UserCheck,
  UserMinus,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type {
  EmployerProfile,
  JobApplication,
  JobListing,
  WorkerProfile,
} from "../backend";
import { useActor } from "../hooks/useActor";
import {
  adminApproveApplication,
  adminApproveJob,
  adminRejectApplication,
  adminRejectJob,
  deleteJob,
  getAllApplicationsAdmin,
  getAllJobsAdmin,
} from "../utils/localDb";
import type { LocalApplication, LocalJob } from "../utils/localDb";

type Section =
  | "dashboard"
  | "employees"
  | "employers"
  | "jobs"
  | "applications";

interface AdminPanelProps {
  onLogout: () => void;
}

const navItems: { id: Section; label: string; icon: React.ReactNode }[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="w-4 h-4" />,
  },
  { id: "employees", label: "Employees", icon: <Users className="w-4 h-4" /> },
  {
    id: "employers",
    label: "Employers",
    icon: <UserCheck className="w-4 h-4" />,
  },
  { id: "jobs", label: "Jobs", icon: <Briefcase className="w-4 h-4" /> },
  {
    id: "applications",
    label: "Applications",
    icon: <ClipboardList className="w-4 h-4" />,
  },
];

export default function AdminPanel({ onLogout }: AdminPanelProps) {
  const [section, setSection] = useState<Section>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Toaster />
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-60 bg-admin-sidebar flex flex-col transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:flex`}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg bg-admin-accent flex items-center justify-center">
            <Briefcase className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white text-sm tracking-wide">
            Quick Rozgar Admin
          </span>
          <button
            type="button"
            className="ml-auto lg:hidden text-white/60 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => {
                setSection(item.id);
                setSidebarOpen(false);
              }}
              data-ocid={`admin.${item.id}.link`}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                section === item.id
                  ? "bg-white/15 text-white"
                  : "text-white/60 hover:bg-white/8 hover:text-white/90"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-4">
          <button
            type="button"
            onClick={onLogout}
            data-ocid="admin.logout_button"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:bg-white/8 hover:text-white/90 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          role="button"
          tabIndex={0}
          onKeyDown={() => setSidebarOpen(false)}
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-3">
          <button
            type="button"
            className="lg:hidden text-gray-500 hover:text-gray-700"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="font-semibold text-gray-900 text-sm">
            {navItems.find((n) => n.id === section)?.label}
          </h1>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-gray-400 hidden sm:block">Admin</span>
            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              className="hidden sm:flex gap-1.5 text-xs"
              data-ocid="admin.logout_button"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {section === "dashboard" && <AdminDashboard />}
          {section === "employees" && <AdminEmployees />}
          {section === "employers" && <AdminEmployers />}
          {section === "jobs" && <AdminJobs />}
          {section === "applications" && <AdminApplications />}
        </main>
      </div>
    </div>
  );
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
function AdminDashboard() {
  const { actor, isFetching } = useActor();
  const [stats, setStats] = useState<{
    totalUsers: string;
    totalEmployers: string;
    totalJobs: string;
    totalApplications: string;
    activeJobs: string;
  } | null>(null);
  const [recentActivity, setRecentActivity] = useState<{
    recentJobs: JobListing[];
    recentApplications: JobApplication[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [notificationDismissed, setNotificationDismissed] = useState(false);

  useEffect(() => {
    if (!actor || isFetching) return;
    (async () => {
      try {
        const [s, activity] = await Promise.all([
          actor.adminGetStats(),
          actor.adminGetRecentActivity(),
        ]);
        setStats({
          totalUsers: s.totalUsers.toString(),
          totalEmployers: s.totalEmployers.toString(),
          totalJobs: s.totalJobs.toString(),
          totalApplications: s.totalApplications.toString(),
          activeJobs: s.activeJobs.toString(),
        });
        setRecentActivity({
          recentJobs: activity.recentJobs.slice(0, 5),
          recentApplications: activity.recentApplications.slice(0, 5),
        });
      } catch {
        toast.error("Failed to load stats");
      } finally {
        setLoading(false);
      }
    })();
  }, [actor, isFetching]);

  const totalActivityCount =
    (recentActivity?.recentJobs.length ?? 0) +
    (recentActivity?.recentApplications.length ?? 0);

  const cards = [
    {
      label: "Total Users",
      value: stats?.totalUsers ?? "—",
      icon: <Users className="w-5 h-5" />,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Total Employers",
      value: stats?.totalEmployers ?? "—",
      icon: <UserCheck className="w-5 h-5" />,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Total Jobs",
      value: stats?.totalJobs ?? "—",
      icon: <Briefcase className="w-5 h-5" />,
      color: "text-violet-600 bg-violet-50",
    },
    {
      label: "Active Jobs",
      value: stats?.activeJobs ?? "—",
      icon: <Zap className="w-5 h-5" />,
      color: "text-green-600 bg-green-50",
    },
    {
      label: "Total Applications",
      value: stats?.totalApplications ?? "—",
      icon: <ClipboardList className="w-5 h-5" />,
      color: "text-amber-600 bg-amber-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Notification banner */}
      {!notificationDismissed && totalActivityCount > 0 && (
        <div
          className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3"
          data-ocid="admin.dashboard.panel"
        >
          <Bell className="w-4 h-4 text-blue-600 shrink-0" />
          <p className="text-sm text-blue-700 flex-1">
            🔔{" "}
            <span className="font-semibold">
              {totalActivityCount} new activities
            </span>{" "}
            since last check
          </p>
          <button
            type="button"
            onClick={() => setNotificationDismissed(true)}
            className="text-blue-400 hover:text-blue-600"
            data-ocid="admin.dashboard.close_button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-gray-900">Overview</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Platform statistics at a glance
        </p>
      </div>

      {loading ? (
        <div
          className="flex items-center gap-2 text-gray-500"
          data-ocid="admin.loading_state"
        >
          <Loader2 className="w-4 h-4 animate-spin" /> Loading stats...
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {cards.map((card) => (
            <div
              key={card.label}
              className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${card.color}`}
              >
                {card.icon}
              </div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Platform Activity (Local Stats) */}
      {(() => {
        const localJobs = getAllJobsAdmin();
        const localApps = getAllApplicationsAdmin();
        const pendingJobs = localJobs.filter(
          (j) => j.status === "Pending",
        ).length;
        const approvedJobs = localJobs.filter(
          (j) => j.status === "Approved",
        ).length;
        const pendingApps = localApps.filter(
          (a) => a.status === "Pending",
        ).length;
        const platformCards = [
          {
            label: "Pending Jobs",
            value: pendingJobs,
            color: "text-orange-600 bg-orange-50",
          },
          {
            label: "Approved Jobs",
            value: approvedJobs,
            color: "text-green-600 bg-green-50",
          },
          {
            label: "Total Applications",
            value: localApps.length,
            color: "text-blue-600 bg-blue-50",
          },
          {
            label: "Pending Applications",
            value: pendingApps,
            color: "text-amber-600 bg-amber-50",
          },
        ];
        return (
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Platform Activity
            </h2>
            <p className="text-sm text-gray-500 mt-0.5 mb-3">
              Real-time data from local platform
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {platformCards.map((card) => (
                <div
                  key={card.label}
                  className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
                >
                  <p
                    className={`text-2xl font-bold ${card.color.split(" ")[0]}`}
                  >
                    {card.value}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-3">Recent Activity</h3>
        {(() => {
          const recentLocalJobs = getAllJobsAdmin()
            .sort((a, b) => b.postedAt - a.postedAt)
            .slice(0, 5);
          const recentLocalApps = getAllApplicationsAdmin()
            .sort((a, b) => b.appliedAt - a.appliedAt)
            .slice(0, 5);
          const hasLocalData =
            recentLocalJobs.length > 0 || recentLocalApps.length > 0;
          if (!hasLocalData) {
            return (
              <p className="text-sm text-gray-400">
                No recent activity to display.
              </p>
            );
          }
          return (
            <div className="space-y-2">
              {recentLocalJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center gap-2 text-sm text-gray-700 py-1 border-b border-gray-50 last:border-0"
                >
                  <span>📋</span>
                  <span>
                    New job: <span className="font-medium">{job.title}</span> at{" "}
                    <span className="text-gray-500">{job.company}</span>
                  </span>
                  <span
                    className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${job.status === "Approved" ? "bg-green-100 text-green-700" : job.status === "Rejected" ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}`}
                  >
                    {job.status}
                  </span>
                </div>
              ))}
              {recentLocalApps.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center gap-2 text-sm text-gray-700 py-1 border-b border-gray-50 last:border-0"
                >
                  <span>👤</span>
                  <span>
                    Application:{" "}
                    <span className="font-medium">
                      {app.employeeName || app.employeePhone}
                    </span>{" "}
                    → <span className="text-gray-500">{app.jobTitle}</span>
                  </span>
                  <span
                    className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${app.status === "Approved" ? "bg-green-100 text-green-700" : app.status === "Rejected" ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}`}
                  >
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          );
        })()}
      </div>
    </div>
  );
}

// ─── Employees ───────────────────────────────────────────────────────────────
function AdminEmployees() {
  const { actor, isFetching } = useActor();
  const [workers, setWorkers] = useState<Array<[Principal, WorkerProfile]>>([]);
  const [blocked, setBlocked] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!actor || isFetching) return;
    (async () => {
      try {
        const data = await actor.adminGetAllWorkers();
        setWorkers(data);
      } catch {
        setError("No data available (admin access required)");
      } finally {
        setLoading(false);
      }
    })();
  }, [actor, isFetching]);

  const filtered = workers.filter(
    ([, profile]) =>
      !search || profile.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleBlock = async (principal: Principal) => {
    if (!actor) return;
    const key = principal.toString();
    try {
      if (blocked.has(key)) {
        await actor.adminUnblockUser(principal);
        setBlocked((prev) => {
          const s = new Set(prev);
          s.delete(key);
          return s;
        });
        toast.success("User unblocked");
      } else {
        await actor.adminBlockUser(principal);
        setBlocked((prev) => new Set(prev).add(key));
        toast.success("User blocked");
      }
    } catch {
      toast.error("Action failed");
    }
  };

  const handleDelete = async (principal: Principal) => {
    if (!actor) return;
    try {
      await actor.adminDeleteWorker(principal);
      setWorkers((prev) =>
        prev.filter(([p]) => p.toString() !== principal.toString()),
      );
      toast.success("Employee deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <SectionShell
      title="Employees"
      description="Manage all registered employees"
    >
      <div className="px-4 pt-4 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-ocid="admin.employees.search_input"
            className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
        </div>
      </div>
      {loading && <LoadingRow />}
      {error && <ErrorRow message={error} />}
      {!loading && !error && (
        <DataTable
          headers={["Name", "Location", "Status", "Actions"]}
          empty={filtered.length === 0}
        >
          {filtered.map(([principal, profile], i) => {
            const key = principal.toString();
            const isBlocked = blocked.has(key);
            return (
              <TableRow key={key} data-ocid={`admin.employees.row.${i + 1}`}>
                <TableCell className="font-medium">
                  {profile.name || "—"}
                </TableCell>
                <TableCell className="text-gray-500">
                  {profile.location || "—"}
                </TableCell>
                <TableCell>
                  <Badge variant={isBlocked ? "destructive" : "secondary"}>
                    {isBlocked ? "Blocked" : "Active"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBlock(principal)}
                      data-ocid={`admin.employees.toggle.${i + 1}`}
                    >
                      {isBlocked ? (
                        <UserCheck className="w-3.5 h-3.5 mr-1" />
                      ) : (
                        <UserMinus className="w-3.5 h-3.5 mr-1" />
                      )}
                      {isBlocked ? "Unblock" : "Block"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(principal)}
                      data-ocid={`admin.employees.delete_button.${i + 1}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </DataTable>
      )}
      {/* Local localStorage-based employees */}
      {(() => {
        const localApps = getAllApplicationsAdmin();
        const localEmployeeMap = new Map<
          string,
          { phone: string; name?: string; appliedJobs: number }
        >();
        for (const app of localApps) {
          if (!localEmployeeMap.has(app.employeePhone)) {
            localEmployeeMap.set(app.employeePhone, {
              phone: app.employeePhone,
              name: app.employeeName,
              appliedJobs: 0,
            });
          }
          const entry = localEmployeeMap.get(app.employeePhone);
          if (entry) entry.appliedJobs++;
        }
        const localEmployees = Array.from(localEmployeeMap.values()).filter(
          (e) =>
            !search ||
            (e.name || e.phone).toLowerCase().includes(search.toLowerCase()),
        );
        if (localEmployees.length === 0) return null;
        return (
          <div className="px-4 pb-4">
            <p className="text-xs text-gray-400 mb-2 mt-3">
              Platform Employees (local data)
            </p>
            <DataTable
              headers={["Name / Phone", "Applications", "Status"]}
              empty={false}
            >
              {localEmployees.map((emp, i) => (
                <TableRow
                  key={emp.phone}
                  data-ocid={`admin.employees.row.${i + 100}`}
                >
                  <TableCell className="font-medium">
                    {emp.name || emp.phone}
                    <span className="ml-1 text-[10px] text-gray-400">
                      (local)
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {emp.appliedJobs}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">Active</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </DataTable>
          </div>
        );
      })()}
    </SectionShell>
  );
}

// ─── Employers ───────────────────────────────────────────────────────────────
type EmployerActivityRow = [Principal, EmployerProfile, bigint, bigint, string];

function AdminEmployers() {
  const { actor, isFetching } = useActor();
  const [employers, setEmployers] = useState<EmployerActivityRow[]>([]);
  const [blocked, setBlocked] = useState<Set<string>>(new Set());
  const [planSelections, setPlanSelections] = useState<Record<string, string>>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!actor || isFetching) return;
    (async () => {
      try {
        const data = await actor.adminGetAllEmployerActivity();
        setEmployers(data);
        const initialPlans: Record<string, string> = {};
        for (const [principal, , , , plan] of data) {
          initialPlans[principal.toString()] = plan;
        }
        setPlanSelections(initialPlans);
      } catch {
        setError("No data available (admin access required)");
      } finally {
        setLoading(false);
      }
    })();
  }, [actor, isFetching]);

  const handleBlock = async (principal: Principal) => {
    if (!actor) return;
    const key = principal.toString();
    try {
      if (blocked.has(key)) {
        await actor.adminUnblockUser(principal);
        setBlocked((prev) => {
          const s = new Set(prev);
          s.delete(key);
          return s;
        });
        toast.success("Employer unblocked");
      } else {
        await actor.adminBlockUser(principal);
        setBlocked((prev) => new Set(prev).add(key));
        toast.success("Employer blocked");
      }
    } catch {
      toast.error("Action failed");
    }
  };

  const handleDelete = async (principal: Principal) => {
    if (!actor) return;
    try {
      await actor.adminDeleteEmployer(principal);
      setEmployers((prev) =>
        prev.filter(([p]) => p.toString() !== principal.toString()),
      );
      toast.success("Employer deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleSetPlan = async (principal: Principal) => {
    if (!actor) return;
    const key = principal.toString();
    const plan = planSelections[key];
    if (!plan) return;
    try {
      await actor.adminSetEmployerPlan(principal, plan);
      setEmployers((prev) =>
        prev.map(([p, profile, jobs, applicants, oldPlan]) =>
          p.toString() === key
            ? [p, profile, jobs, applicants, plan]
            : [p, profile, jobs, applicants, oldPlan],
        ),
      );
      toast.success(`Plan updated to ${plan}`);
    } catch {
      toast.error("Failed to update plan");
    }
  };

  const planBadgeClass = (plan: string) => {
    if (plan === "Gold")
      return "bg-amber-100 text-amber-700 border border-amber-200";
    if (plan === "Silver")
      return "bg-blue-100 text-blue-700 border border-blue-200";
    return "bg-gray-100 text-gray-600 border border-gray-200";
  };

  return (
    <SectionShell
      title="Employers"
      description="Manage all registered employers and their plans"
    >
      {loading && <LoadingRow />}
      {error && <ErrorRow message={error} />}
      {!loading && !error && (
        <DataTable
          headers={[
            "Company Name",
            "Location",
            "Jobs Posted",
            "Applicants",
            "Plan",
            "Change Plan",
            "Status",
            "Actions",
          ]}
          empty={employers.length === 0}
        >
          {employers.map(
            ([principal, profile, jobsPosted, totalApplicants, plan], i) => {
              const key = principal.toString();
              const isBlocked = blocked.has(key);
              return (
                <TableRow key={key} data-ocid={`admin.employers.row.${i + 1}`}>
                  <TableCell className="font-medium">
                    {profile.companyName || "—"}
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {profile.location || "—"}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-semibold text-gray-800">
                      {jobsPosted.toString()}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-semibold text-gray-800">
                      {totalApplicants.toString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${planBadgeClass(plan)}`}
                    >
                      {plan || "Basic"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <select
                        value={planSelections[key] || plan}
                        onChange={(e) =>
                          setPlanSelections((prev) => ({
                            ...prev,
                            [key]: e.target.value,
                          }))
                        }
                        data-ocid={`admin.employers.select.${i + 1}`}
                        className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      >
                        <option value="Basic">Basic</option>
                        <option value="Silver">Silver</option>
                        <option value="Gold">Gold</option>
                      </select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetPlan(principal)}
                        data-ocid={`admin.employers.save_button.${i + 1}`}
                        className="text-xs h-7 px-2"
                      >
                        Set
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={isBlocked ? "destructive" : "secondary"}>
                      {isBlocked ? "Blocked" : "Active"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBlock(principal)}
                        data-ocid={`admin.employers.toggle.${i + 1}`}
                      >
                        {isBlocked ? (
                          <UserCheck className="w-3.5 h-3.5 mr-1" />
                        ) : (
                          <UserMinus className="w-3.5 h-3.5 mr-1" />
                        )}
                        {isBlocked ? "Unblock" : "Block"}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(principal)}
                        data-ocid={`admin.employers.delete_button.${i + 1}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            },
          )}
        </DataTable>
      )}
      {/* Local localStorage-based employers */}
      {(() => {
        const localJobs = getAllJobsAdmin();
        const localEmployerMap = new Map<
          string,
          { phone: string; company: string; jobsPosted: number }
        >();
        for (const job of localJobs) {
          if (!localEmployerMap.has(job.employerPhone)) {
            localEmployerMap.set(job.employerPhone, {
              phone: job.employerPhone,
              company: job.company,
              jobsPosted: 0,
            });
          }
          const entry = localEmployerMap.get(job.employerPhone);
          if (entry) entry.jobsPosted++;
        }
        const localEmployers = Array.from(localEmployerMap.values());
        if (localEmployers.length === 0) return null;
        return (
          <div className="px-4 pb-4">
            <p className="text-xs text-gray-400 mb-2 mt-3">
              Platform Employers (local data)
            </p>
            <DataTable
              headers={["Company", "Phone", "Jobs Posted", "Plan"]}
              empty={false}
            >
              {localEmployers.map((emp, i) => (
                <TableRow
                  key={emp.phone}
                  data-ocid={`admin.employers.row.${i + 100}`}
                >
                  <TableCell className="font-medium">
                    {emp.company}
                    <span className="ml-1 text-[10px] text-gray-400">
                      (local)
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-500">{emp.phone}</TableCell>
                  <TableCell className="text-center font-semibold">
                    {emp.jobsPosted}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                      Basic
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </DataTable>
          </div>
        );
      })()}
    </SectionShell>
  );
}

// ─── Jobs ────────────────────────────────────────────────────────────────────
const JOB_CATEGORIES = [
  "All",
  "Waiter",
  "Chef",
  "Housekeeping",
  "Delivery Boy",
  "Call Centre Jobs",
  "Retail Jobs",
];

const JOB_LOCATIONS = [
  "All",
  "Siliguri",
  "Gangtok",
  "Darjeeling",
  "Delhi",
  "Mumbai",
  "Bangalore",
  "Kolkata",
];

function AdminJobs() {
  const [jobs, setJobs] = useState<LocalJob[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");

  useEffect(() => {
    setJobs(getAllJobsAdmin());
  }, []);

  const filtered = jobs.filter((job) => {
    const matchSearch =
      !search ||
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.company.toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      categoryFilter === "All" || job.category === categoryFilter;
    const matchLocation =
      locationFilter === "All" || job.location === locationFilter;
    return matchSearch && matchCategory && matchLocation;
  });

  const handleApprove = (jobId: string) => {
    adminApproveJob(jobId);
    setJobs((prev) =>
      prev.map((j) =>
        j.id === jobId ? { ...j, status: "Approved" as const } : j,
      ),
    );
    toast.success("Job approved");
  };

  const handleReject = (jobId: string) => {
    adminRejectJob(jobId);
    setJobs((prev) =>
      prev.map((j) =>
        j.id === jobId ? { ...j, status: "Rejected" as const } : j,
      ),
    );
    toast.success("Job rejected");
  };

  const handleDelete = (jobId: string) => {
    deleteJob(jobId);
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
    toast.success("Job deleted");
  };

  return (
    <SectionShell title="Jobs" description="Review and manage all job listings">
      <div className="px-4 pt-4 pb-2 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-ocid="admin.jobs.search_input"
            className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            data-ocid="admin.jobs.select"
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            {JOB_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c === "All" ? "All Categories" : c}
              </option>
            ))}
          </select>
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            data-ocid="admin.jobs.select"
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            {JOB_LOCATIONS.map((l) => (
              <option key={l} value={l}>
                {l === "All" ? "All Locations" : l}
              </option>
            ))}
          </select>
        </div>
      </div>
      <DataTable
        headers={[
          "Company",
          "Job Title",
          "Category",
          "Location",
          "Status",
          "Actions",
        ]}
        empty={filtered.length === 0}
      >
        {filtered.map((job, i) => (
          <TableRow
            key={job.id.toString()}
            data-ocid={`admin.jobs.row.${i + 1}`}
          >
            <TableCell className="font-medium">{job.company}</TableCell>
            <TableCell>{job.title}</TableCell>
            <TableCell className="text-gray-500">{job.category}</TableCell>
            <TableCell className="text-gray-500">{job.location}</TableCell>
            <TableCell>
              {job.status === "Approved" && (
                <Badge variant="default">Approved</Badge>
              )}
              {job.status === "Rejected" && (
                <Badge variant="destructive">Rejected</Badge>
              )}
              {job.status === "Pending" && (
                <Badge variant="secondary">Pending</Badge>
              )}
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                {job.status === "Pending" && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleApprove(job.id)}
                      className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                      data-ocid={`admin.jobs.primary_button.${i + 1}`}
                    >
                      <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReject(job.id)}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      data-ocid={`admin.jobs.secondary_button.${i + 1}`}
                    >
                      Reject
                    </Button>
                  </>
                )}
                {job.status !== "Pending" && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(job.id)}
                    data-ocid={`admin.jobs.delete_button.${i + 1}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </DataTable>
    </SectionShell>
  );
}

// ─── Applications ─────────────────────────────────────────────────────────────
function AdminApplications() {
  const [applications, setApplications] = useState<LocalApplication[]>([]);

  useEffect(() => {
    setApplications(getAllApplicationsAdmin());
  }, []);

  const handleApprove = (appId: string) => {
    adminApproveApplication(appId);
    setApplications((prev) =>
      prev.map((a) =>
        a.id === appId ? { ...a, status: "Approved" as const } : a,
      ),
    );
    toast.success("Application approved");
  };

  const handleReject = (appId: string) => {
    adminRejectApplication(appId);
    setApplications((prev) =>
      prev.map((a) =>
        a.id === appId ? { ...a, status: "Rejected" as const } : a,
      ),
    );
    toast.success("Application rejected");
  };

  const statusBadge = (status: string) => {
    if (status === "Approved") return <Badge variant="default">Approved</Badge>;
    if (status === "Rejected")
      return <Badge variant="destructive">Rejected</Badge>;
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-yellow-100 text-yellow-700 border-yellow-200">
        Pending
      </span>
    );
  };

  return (
    <SectionShell
      title="Applications"
      description="All job applications across the platform"
    >
      {applications.length === 0 && (
        <div
          className="p-6 text-center text-gray-400 text-sm"
          data-ocid="admin.applications.empty_state"
        >
          No applications yet
        </div>
      )}
      {applications.length > 0 && (
        <DataTable
          headers={[
            "Candidate Name",
            "Phone",
            "Job Title",
            "Company",
            "Status",
            "Actions",
          ]}
          empty={applications.length === 0}
        >
          {applications.map((app, i) => (
            <TableRow
              key={app.id}
              data-ocid={`admin.applications.row.${i + 1}`}
            >
              <TableCell className="font-medium">
                {app.employeeName || "—"}
              </TableCell>
              <TableCell className="text-gray-500 text-xs">
                {app.employeePhone}
              </TableCell>
              <TableCell>{app.jobTitle}</TableCell>
              <TableCell>{app.company}</TableCell>
              <TableCell>{statusBadge(app.status)}</TableCell>
              <TableCell>
                {app.status === "Pending" && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleApprove(app.id)}
                      className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                      data-ocid={`admin.applications.primary_button.${i + 1}`}
                    >
                      <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReject(app.id)}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      data-ocid={`admin.applications.secondary_button.${i + 1}`}
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </DataTable>
      )}
    </SectionShell>
  );
}

// ─── Shared helpers ───────────────────────────────────────────────────────────
function SectionShell({
  title,
  description,
  children,
}: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function DataTable({
  headers,
  children,
  empty,
}: { headers: string[]; children: React.ReactNode; empty: boolean }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            {headers.map((h) => (
              <TableHead
                key={h}
                className="font-semibold text-gray-700 text-xs uppercase tracking-wide"
              >
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {empty ? (
            <TableRow>
              <TableCell
                colSpan={headers.length}
                className="text-center text-gray-400 py-10"
                data-ocid="admin.empty_state"
              >
                No records found
              </TableCell>
            </TableRow>
          ) : (
            children
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function LoadingRow() {
  return (
    <div
      className="flex items-center gap-2 text-gray-400 p-6"
      data-ocid="admin.loading_state"
    >
      <Loader2 className="w-4 h-4 animate-spin" /> Loading...
    </div>
  );
}

function ErrorRow({ message }: { message: string }) {
  return (
    <div
      className="p-6 text-sm text-amber-700 bg-amber-50 border-b border-amber-100"
      data-ocid="admin.error_state"
    >
      {message}
    </div>
  );
}
