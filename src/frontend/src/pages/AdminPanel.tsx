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
import {
  Bell,
  Briefcase,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Download,
  FileSpreadsheet,
  IndianRupee,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Search,
  Trash2,
  TrendingUp,
  UserCheck,
  Users,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import {
  type BackendApplication,
  type BackendJob,
  backendAdminDeleteJob,
  backendAdminUpdateApplicationStatus,
  backendAdminUpdateJobStatus,
  backendGetAllApplications,
  backendGetAllEmployerPlans,
  backendGetAllEmployerProfiles,
  backendGetAllJobs,
} from "../utils/backendDb";
import { getAllEmployeeProfiles } from "../utils/localDb";

type Section =
  | "dashboard"
  | "employees"
  | "employers"
  | "jobs"
  | "applications"
  | "reports";

interface AdminPanelProps {
  onLogout: () => void;
}

const JOB_CATEGORIES = [
  "Waiter",
  "Chef",
  "Housekeeping",
  "Delivery Boy",
  "Call Centre Jobs",
  "Retail Jobs",
];

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
  {
    id: "reports",
    label: "Reports",
    icon: <FileSpreadsheet className="w-4 h-4" />,
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
          {section === "reports" && <AdminReports />}
        </main>
      </div>
    </div>
  );
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
type ActivityFilter = "today" | "week" | "month";

function isWithinPeriod(ts: number, filter: ActivityFilter): boolean {
  const now = new Date();
  const d = new Date(ts);
  if (filter === "today") {
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  }
  if (filter === "week") {
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    return d >= weekAgo;
  }
  // month
  const monthAgo = new Date(now);
  monthAgo.setDate(now.getDate() - 30);
  return d >= monthAgo;
}

function AdminDashboard() {
  const [notificationDismissed, setNotificationDismissed] = useState(false);
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>("today");
  const [jobs, setJobs] = useState<BackendJob[]>([]);
  const [apps, setApps] = useState<BackendApplication[]>([]);
  const [plans, setPlans] = useState<Array<[string, string]>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      backendGetAllJobs(),
      backendGetAllApplications(),
      backendGetAllEmployerPlans(),
    ]).then(([j, a, p]) => {
      setJobs(j);
      setApps(a);
      setPlans(p);
      setLoading(false);
    });
  }, []);

  // Use pending items count as the notification badge
  const pendingJobsCount = jobs.filter((j) => j.status === "Pending").length;
  const pendingAppsCount = apps.filter((a) => a.status === "Pending").length;
  const totalActivityCount = pendingJobsCount + pendingAppsCount;

  const totalJobs = jobs.length;
  const approvedJobs = jobs.filter((j) => j.status === "Approved").length;
  const pendingJobs = jobs.filter((j) => j.status === "Pending").length;
  const rejectedJobs = jobs.filter((j) => j.status === "Rejected").length;
  const rejectedApps = apps.filter((a) => a.status === "Rejected").length;

  // Subscription plan stats from backend plans
  const planMap = new Map(plans);
  const employerPhones = Array.from(new Set(jobs.map((j) => j.employerPhone)));
  let basicCount = 0;
  let silverCount = 0;
  let goldCount = 0;
  for (const phone of employerPhones) {
    const plan = planMap.get(phone) ?? "Basic";
    if (plan === "Gold") goldCount++;
    else if (plan === "Silver") silverCount++;
    else basicCount++;
  }
  const revenue = basicCount * 999 + silverCount * 2499 + goldCount * 4999;

  // Activity filter
  const filteredJobs = jobs.filter((j) =>
    isWithinPeriod(j.postedAt, activityFilter),
  );
  const filteredApps = apps.filter((a) =>
    isWithinPeriod(a.appliedAt, activityFilter),
  );
  const rejectedFilteredApps = filteredApps.filter(
    (a) => a.status === "Rejected",
  );

  const planBadgeClass = (plan: string) => {
    if (plan === "Gold")
      return "bg-amber-100 text-amber-700 border border-amber-200";
    if (plan === "Silver")
      return "bg-blue-100 text-blue-700 border border-blue-200";
    return "bg-gray-100 text-gray-600 border border-gray-200";
  };

  if (loading) {
    return (
      <div
        className="flex items-center justify-center py-20"
        data-ocid="admin.dashboard.loading_state"
      >
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        <span className="ml-2 text-sm text-gray-500">Loading dashboard...</span>
      </div>
    );
  }

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
              {totalActivityCount} pending item
              {totalActivityCount !== 1 ? "s" : ""}
            </span>{" "}
            awaiting your review
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

      {/* Enhanced Job Stats */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Job Statistics</h2>
        <p className="text-sm text-gray-500 mt-0.5 mb-3">
          Complete breakdown of all jobs on platform
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3 text-violet-600 bg-violet-50">
              <Briefcase className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalJobs}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Total Jobs (all time)
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3 text-green-600 bg-green-50">
              <CheckCircle className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-green-700">{approvedJobs}</p>
            <p className="text-xs text-gray-500 mt-0.5">Approved Jobs</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3 text-orange-600 bg-orange-50">
              <Zap className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-orange-700">{pendingJobs}</p>
            <p className="text-xs text-gray-500 mt-0.5">Pending Jobs</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3 text-red-600 bg-red-50">
              <XCircle className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-red-700">{rejectedJobs}</p>
            <p className="text-xs text-gray-500 mt-0.5">Rejected Jobs</p>
          </div>
        </div>
      </div>

      {/* Application & Revenue Stats */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Applications & Revenue
        </h2>
        <p className="text-sm text-gray-500 mt-0.5 mb-3">
          Application rejections and subscription revenue
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3 text-red-600 bg-red-50">
              <XCircle className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-red-700">{rejectedApps}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Rejected Applications
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3 text-emerald-600 bg-emerald-50">
              <IndianRupee className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-emerald-700">
              ₹{revenue.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Subscription Revenue</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm col-span-2 lg:col-span-1">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3 text-amber-600 bg-amber-50">
              <TrendingUp className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-gray-600 mb-2">
              Subscription Plans
            </p>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${planBadgeClass("Basic")}`}
                >
                  Basic
                </span>
                <span className="font-bold text-gray-800">{basicCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${planBadgeClass("Silver")}`}
                >
                  Silver
                </span>
                <span className="font-bold text-gray-800">{silverCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${planBadgeClass("Gold")}`}
                >
                  Gold
                </span>
                <span className="font-bold text-gray-800">{goldCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Activity with time filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h3 className="font-semibold text-gray-900">Platform Activity</h3>
          <div className="flex gap-1" data-ocid="admin.dashboard.tab">
            {(["today", "week", "month"] as ActivityFilter[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setActivityFilter(f)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  activityFilter === f
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {f === "today"
                  ? "Today"
                  : f === "week"
                    ? "This Week"
                    : "This Month"}
              </button>
            ))}
          </div>
        </div>

        {/* Recent Jobs */}
        {filteredJobs.length === 0 && filteredApps.length === 0 ? (
          <p className="text-sm text-gray-400 py-2">
            No activity for this period.
          </p>
        ) : (
          <div className="space-y-2">
            {filteredJobs.map((job) => (
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
                  className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${
                    job.status === "Approved"
                      ? "bg-green-100 text-green-700"
                      : job.status === "Rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-orange-100 text-orange-700"
                  }`}
                >
                  {job.status}
                </span>
              </div>
            ))}
            {filteredApps
              .filter((a) => a.status !== "Rejected")
              .map((app) => (
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
                    className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${
                      app.status === "Approved"
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {app.status}
                  </span>
                </div>
              ))}
          </div>
        )}

        {/* Rejected Applications sub-section */}
        {rejectedFilteredApps.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h4 className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5" /> Rejected Applications
            </h4>
            <div className="space-y-2">
              {rejectedFilteredApps.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center gap-2 text-sm text-gray-700 py-1"
                >
                  <span>🚫</span>
                  <span>
                    <span className="font-medium">
                      {app.employeeName || app.employeePhone}
                    </span>{" "}
                    → <span className="text-gray-500">{app.jobTitle}</span>
                  </span>
                  <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-700">
                    Rejected
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Employees ───────────────────────────────────────────────────────────────
function AdminEmployees() {
  const [search, setSearch] = useState("");
  const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null);
  const [apps, setApps] = useState<BackendApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    backendGetAllApplications().then((a) => {
      setApps(a);
      setLoading(false);
    });
  }, []);

  // Build employee map from real application data (backend)
  const employeeMap = new Map<
    string,
    { phone: string; name?: string; applications: BackendApplication[] }
  >();
  for (const app of apps) {
    if (!employeeMap.has(app.employeePhone)) {
      employeeMap.set(app.employeePhone, {
        phone: app.employeePhone,
        name: app.employeeName,
        applications: [],
      });
    }
    employeeMap.get(app.employeePhone)?.applications.push(app);
  }

  const employees = Array.from(employeeMap.values()).filter(
    (e) =>
      !search ||
      (e.name || e.phone).toLowerCase().includes(search.toLowerCase()),
  );

  const selectedEmployee = expandedEmployee
    ? employeeMap.get(expandedEmployee)
    : null;

  return (
    <SectionShell
      title="Employees"
      description="All employees who have submitted applications"
    >
      <div className="px-4 pt-4 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-ocid="admin.employees.search_input"
            className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
        </div>
      </div>

      {loading ? (
        <div
          className="flex items-center justify-center py-10"
          data-ocid="admin.employees.loading_state"
        >
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          <span className="ml-2 text-sm text-gray-500">Loading...</span>
        </div>
      ) : (
        <DataTable
          headers={["Name / Phone", "Applications", "Status", ""]}
          empty={employees.length === 0}
        >
          {employees.map((emp, i) => (
            <>
              <TableRow
                key={emp.phone}
                data-ocid={`admin.employees.row.${i + 1}`}
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() =>
                  setExpandedEmployee(
                    expandedEmployee === emp.phone ? null : emp.phone,
                  )
                }
              >
                <TableCell className="font-medium">
                  {emp.name || emp.phone}
                  {emp.name && (
                    <p className="text-xs text-gray-400 font-normal">
                      {emp.phone}
                    </p>
                  )}
                </TableCell>
                <TableCell className="text-center font-semibold text-gray-800">
                  {emp.applications.length}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">Active</Badge>
                </TableCell>
                <TableCell className="text-right">
                  {expandedEmployee === emp.phone ? (
                    <ChevronUp className="w-4 h-4 text-gray-400 inline" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400 inline" />
                  )}
                </TableCell>
              </TableRow>
              {expandedEmployee === emp.phone && selectedEmployee && (
                <TableRow key={`${emp.phone}-detail`}>
                  <TableCell colSpan={4} className="p-0">
                    <EmployeeDetailPanel
                      employee={selectedEmployee}
                      onClose={() => setExpandedEmployee(null)}
                    />
                  </TableCell>
                </TableRow>
              )}
            </>
          ))}
        </DataTable>
      )}
    </SectionShell>
  );
}

function EmployeeDetailPanel({
  employee,
  onClose,
}: {
  employee: {
    phone: string;
    name?: string;
    applications: BackendApplication[];
  };
  onClose: () => void;
}) {
  return (
    <div className="bg-blue-50 border-t border-blue-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-semibold text-gray-900">
            {employee.name || employee.phone}
          </p>
          <p className="text-xs text-gray-500">{employee.phone}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-600">
            <span className="font-semibold">
              {employee.applications.length}
            </span>{" "}
            total jobs applied
          </span>
          <button
            type="button"
            onClick={onClose}
            data-ocid="admin.employees.close_button"
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-500 border-b border-blue-200">
              <th className="text-left pb-2 font-medium">Job Title</th>
              <th className="text-left pb-2 font-medium">Company</th>
              <th className="text-left pb-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {employee.applications.map((app) => (
              <tr
                key={app.id}
                className="border-b border-blue-100 last:border-0"
              >
                <td className="py-1.5 pr-3 font-medium text-gray-800">
                  {app.jobTitle}
                </td>
                <td className="py-1.5 pr-3 text-gray-600">{app.company}</td>
                <td className="py-1.5">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      app.status === "Approved"
                        ? "bg-green-100 text-green-700"
                        : app.status === "Rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {app.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Employers ───────────────────────────────────────────────────────────────
function AdminEmployers() {
  const [expandedEmployer, setExpandedEmployer] = useState<string | null>(null);
  const [planSelections, setPlanSelections] = useState<Record<string, string>>(
    {},
  );
  const [jobs, setJobs] = useState<BackendJob[]>([]);
  const [apps, setApps] = useState<BackendApplication[]>([]);
  const [profiles, setProfiles] = useState<Array<[string, string]>>([]);
  const [plans, setPlans] = useState<Array<[string, string]>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      backendGetAllJobs(),
      backendGetAllApplications(),
      backendGetAllEmployerProfiles(),
      backendGetAllEmployerPlans(),
    ]).then(([j, a, p, pl]) => {
      setJobs(j);
      setApps(a);
      setProfiles(p);
      setPlans(pl);
      setLoading(false);
    });
  }, []);

  const planMap = new Map(plans);
  const profileMap = new Map(profiles);

  const getEmployerPlanFromBackend = (
    phone: string,
  ): "Basic" | "Silver" | "Gold" => {
    const plan = planMap.get(phone) ?? "Basic";
    if (plan === "Silver" || plan === "Gold") return plan;
    return "Basic";
  };

  const planBadgeClass = (plan: string) => {
    if (plan === "Gold")
      return "bg-amber-100 text-amber-700 border border-amber-200";
    if (plan === "Silver")
      return "bg-blue-100 text-blue-700 border border-blue-200";
    return "bg-gray-100 text-gray-600 border border-gray-200";
  };

  // Build employer map from real jobs data (backend)
  const employerMap = new Map<
    string,
    { phone: string; company: string; jobs: BackendJob[] }
  >();
  for (const job of jobs) {
    if (!employerMap.has(job.employerPhone)) {
      const companyFromProfile = profileMap.get(job.employerPhone);
      employerMap.set(job.employerPhone, {
        phone: job.employerPhone,
        company: companyFromProfile || job.company,
        jobs: [],
      });
    }
    employerMap.get(job.employerPhone)?.jobs.push(job);
  }
  const employers = Array.from(employerMap.values());

  const selectedEmployerData = expandedEmployer
    ? employerMap.get(expandedEmployer)
    : null;

  const handleSetPlan = (phone: string) => {
    const plan = planSelections[phone];
    if (!plan) return;
    try {
      // Save to localStorage for local tracking, backend plan tracking via backendSaveEmployerPlan would be fire-and-forget
      localStorage.setItem(`qr_erp_plan_${phone}`, JSON.stringify(plan));
      // Update local state
      setPlans((prev) => {
        const updated = prev.filter(([p]) => p !== phone);
        updated.push([phone, plan]);
        return updated;
      });
      toast.success(`Plan updated to ${plan}`);
    } catch {
      toast.error("Failed to update plan");
    }
  };

  return (
    <SectionShell
      title="Employers"
      description="All employers who have posted jobs"
    >
      {loading ? (
        <div
          className="flex items-center justify-center py-10"
          data-ocid="admin.employers.loading_state"
        >
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          <span className="ml-2 text-sm text-gray-500">Loading...</span>
        </div>
      ) : (
        <DataTable
          headers={["Company", "Plan", "Change Plan", "Jobs Posted", ""]}
          empty={employers.length === 0}
        >
          {employers.map((emp, i) => {
            const plan =
              planSelections[emp.phone] ??
              getEmployerPlanFromBackend(emp.phone);
            return (
              <>
                <TableRow
                  key={emp.phone}
                  data-ocid={`admin.employers.row.${i + 1}`}
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() =>
                    setExpandedEmployer(
                      expandedEmployer === emp.phone ? null : emp.phone,
                    )
                  }
                >
                  <TableCell className="font-medium">
                    {emp.company}
                    <p className="text-xs text-gray-400 font-normal">
                      {emp.phone}
                    </p>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${planBadgeClass(plan)}`}
                    >
                      {plan}
                    </span>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1.5">
                      <select
                        value={
                          planSelections[emp.phone] ??
                          getEmployerPlanFromBackend(emp.phone)
                        }
                        onChange={(e) =>
                          setPlanSelections((prev) => ({
                            ...prev,
                            [emp.phone]: e.target.value,
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
                        onClick={() => handleSetPlan(emp.phone)}
                        data-ocid={`admin.employers.save_button.${i + 1}`}
                        className="text-xs h-7 px-2"
                      >
                        Set
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-semibold text-gray-800">
                    {emp.jobs.length}
                  </TableCell>
                  <TableCell className="text-right">
                    {expandedEmployer === emp.phone ? (
                      <ChevronUp className="w-4 h-4 text-gray-400 inline" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400 inline" />
                    )}
                  </TableCell>
                </TableRow>
                {expandedEmployer === emp.phone && selectedEmployerData && (
                  <TableRow key={`${emp.phone}-detail`}>
                    <TableCell colSpan={5} className="p-0">
                      <EmployerDetailPanel
                        employer={selectedEmployerData}
                        plan={getEmployerPlanFromBackend(emp.phone)}
                        allApps={apps}
                        onClose={() => setExpandedEmployer(null)}
                      />
                    </TableCell>
                  </TableRow>
                )}
              </>
            );
          })}
        </DataTable>
      )}
    </SectionShell>
  );
}

function EmployerDetailPanel({
  employer,
  plan,
  allApps,
  onClose,
}: {
  employer: { phone: string; company: string; jobs: BackendJob[] };
  plan: string;
  allApps: BackendApplication[];
  onClose: () => void;
}) {
  const planBadgeClass = (p: string) => {
    if (p === "Gold")
      return "bg-amber-100 text-amber-700 border border-amber-200";
    if (p === "Silver")
      return "bg-blue-100 text-blue-700 border border-blue-200";
    return "bg-gray-100 text-gray-600 border border-gray-200";
  };

  return (
    <div className="bg-amber-50 border-t border-amber-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-gray-900">{employer.company}</p>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${planBadgeClass(plan)}`}
          >
            {plan}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          data-ocid="admin.employers.close_button"
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-500 border-b border-amber-200">
              <th className="text-left pb-2 font-medium">Job Title</th>
              <th className="text-left pb-2 font-medium">Status</th>
              <th className="text-left pb-2 font-medium">Applications</th>
            </tr>
          </thead>
          <tbody>
            {employer.jobs.map((job) => {
              const appCount = allApps.filter((a) => a.jobId === job.id).length;
              return (
                <tr
                  key={job.id}
                  className="border-b border-amber-100 last:border-0"
                >
                  <td className="py-1.5 pr-3 font-medium text-gray-800">
                    {job.title}
                  </td>
                  <td className="py-1.5 pr-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        job.status === "Approved"
                          ? "bg-green-100 text-green-700"
                          : job.status === "Rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {job.status}
                    </span>
                  </td>
                  <td className="py-1.5 font-semibold text-gray-700">
                    {appCount}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Jobs ────────────────────────────────────────────────────────────────────
const JOB_CATEGORIES_FILTER = [
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
  const [jobs, setJobs] = useState<BackendJob[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    backendGetAllJobs().then((j) => {
      setJobs(j);
      setLoading(false);
    });
  }, []);

  // Sort by company name alphabetically, then filter
  const filtered = jobs
    .slice()
    .sort((a, b) => a.company.localeCompare(b.company))
    .filter((job) => {
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

  const handleApprove = async (jobId: string) => {
    try {
      await backendAdminUpdateJobStatus(jobId, "Approved");
      setJobs((prev) =>
        prev.map((j) =>
          j.id === jobId ? { ...j, status: "Approved" as const } : j,
        ),
      );
      toast.success("Job approved");
    } catch {
      toast.error("Action failed, please try again");
    }
  };

  const handleReject = async (jobId: string) => {
    try {
      await backendAdminUpdateJobStatus(jobId, "Rejected");
      setJobs((prev) =>
        prev.map((j) =>
          j.id === jobId ? { ...j, status: "Rejected" as const } : j,
        ),
      );
      toast.success("Job rejected");
    } catch {
      toast.error("Action failed, please try again");
    }
  };

  const handleDelete = async (jobId: string) => {
    try {
      await backendAdminDeleteJob(jobId);
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      toast.success("Job deleted");
    } catch {
      toast.error("Action failed, please try again");
    }
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
            {JOB_CATEGORIES_FILTER.map((c) => (
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

      {loading ? (
        <div
          className="flex items-center justify-center py-10"
          data-ocid="admin.jobs.loading_state"
        >
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          <span className="ml-2 text-sm text-gray-500">Loading...</span>
        </div>
      ) : (
        <DataTable
          headers={["Company Name", "Job Title", "Status", "Actions"]}
          empty={filtered.length === 0}
        >
          {filtered.map((job, i) => (
            <TableRow
              key={job.id.toString()}
              data-ocid={`admin.jobs.row.${i + 1}`}
            >
              <TableCell>
                <span className="font-bold text-gray-900">{job.company}</span>
              </TableCell>
              <TableCell className="text-gray-700">{job.title}</TableCell>
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
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(job.id)}
                    data-ocid={`admin.jobs.delete_button.${i + 1}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </DataTable>
      )}
    </SectionShell>
  );
}

// ─── Applications ─────────────────────────────────────────────────────────────
function AdminApplications() {
  const [applications, setApplications] = useState<BackendApplication[]>([]);
  const [jobs, setJobs] = useState<BackendJob[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([backendGetAllApplications(), backendGetAllJobs()]).then(
      ([a, j]) => {
        setApplications(a);
        setJobs(j);
        setLoading(false);
      },
    );
  }, []);

  // Build a map of jobId -> category for quick lookup
  const jobCategoryMap = new Map<string, string>();
  for (const job of jobs) {
    jobCategoryMap.set(job.id, job.category);
  }

  const filtered =
    categoryFilter === "All"
      ? applications
      : applications.filter(
          (app) => jobCategoryMap.get(app.jobId) === categoryFilter,
        );

  const handleApprove = async (appId: string) => {
    try {
      await backendAdminUpdateApplicationStatus(appId, "Approved");
      setApplications((prev) =>
        prev.map((a) =>
          a.id === appId ? { ...a, status: "Approved" as const } : a,
        ),
      );
      toast.success("Application approved");
    } catch {
      toast.error("Action failed, please try again");
    }
  };

  const handleReject = async (appId: string) => {
    try {
      await backendAdminUpdateApplicationStatus(appId, "Rejected");
      setApplications((prev) =>
        prev.map((a) =>
          a.id === appId ? { ...a, status: "Rejected" as const } : a,
        ),
      );
      toast.success("Application rejected");
    } catch {
      toast.error("Action failed, please try again");
    }
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
      {/* Category filter */}
      <div className="px-4 pt-4 pb-2">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          data-ocid="admin.applications.select"
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        >
          <option value="All">All Categories</option>
          {JOB_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div
          className="flex items-center justify-center py-10"
          data-ocid="admin.applications.loading_state"
        >
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          <span className="ml-2 text-sm text-gray-500">Loading...</span>
        </div>
      ) : (
        <>
          {filtered.length === 0 && (
            <div
              className="p-6 text-center text-gray-400 text-sm"
              data-ocid="admin.applications.empty_state"
            >
              No applications
              {categoryFilter !== "All" ? ` in ${categoryFilter}` : " yet"}
            </div>
          )}
          {filtered.length > 0 && (
            <DataTable
              headers={[
                "Candidate Name",
                "Phone",
                "Job Title",
                "Company",
                "Status",
                "Actions",
              ]}
              empty={filtered.length === 0}
            >
              {filtered.map((app, i) => (
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
        </>
      )}
    </SectionShell>
  );
}

// ─── Reports ─────────────────────────────────────────────────────────────────
function AdminReports() {
  const [exporting, setExporting] = useState(false);
  const [jobs, setJobs] = useState<BackendJob[]>([]);
  const [apps, setApps] = useState<BackendApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([backendGetAllJobs(), backendGetAllApplications()]).then(
      ([j, a]) => {
        setJobs(j);
        setApps(a);
        setLoading(false);
      },
    );
  }, []);

  const handleExportExcel = () => {
    setExporting(true);
    try {
      const wb = XLSX.utils.book_new();

      // Sheet 1: Employees — build from backend applications
      const employeePhoneSeen = new Set<string>();
      const employeeRows: {
        Name: string;
        Phone: string;
        Email: string;
        "Jobs Applied": number;
        "Application Status": string;
      }[] = [];

      // Try local profiles first for richer data, then merge with backend
      const localProfiles = getAllEmployeeProfiles();
      const localProfileMap = new Map(localProfiles.map((p) => [p.phone, p]));

      for (const a of apps) {
        if (!employeePhoneSeen.has(a.employeePhone)) {
          employeePhoneSeen.add(a.employeePhone);
          const myApps = apps.filter(
            (x) => x.employeePhone === a.employeePhone,
          );
          const localProfile = localProfileMap.get(a.employeePhone);
          employeeRows.push({
            Name: localProfile?.name || a.employeeName || "—",
            Phone: a.employeePhone,
            Email: localProfile?.email || a.employeeEmail || "—",
            "Jobs Applied": myApps.length,
            "Application Status":
              myApps.map((x) => `${x.jobTitle} (${x.status})`).join("; ") ||
              "—",
          });
        }
      }

      const wsEmployees = XLSX.utils.json_to_sheet(
        employeeRows.length > 0
          ? employeeRows
          : [
              {
                Name: "No data",
                Phone: "",
                Email: "",
                "Jobs Applied": 0,
                "Application Status": "",
              },
            ],
      );
      XLSX.utils.book_append_sheet(wb, wsEmployees, "Employees");

      // Sheet 2: Employers — build from backend jobs
      const employerPhoneSeen = new Set<string>();
      const employerRows: {
        "Company Name": string;
        Phone: string;
        Plan: string;
        "Jobs Posted": number;
        "Job Titles": string;
      }[] = [];

      for (const j of jobs) {
        if (!employerPhoneSeen.has(j.employerPhone)) {
          employerPhoneSeen.add(j.employerPhone);
          const myJobs = jobs.filter(
            (x) => x.employerPhone === j.employerPhone,
          );
          const plan = (() => {
            try {
              const raw = localStorage.getItem(
                `qr_erp_plan_${j.employerPhone}`,
              );
              if (raw) {
                const val = raw.trim().replace(/"/g, "");
                if (val === "Silver" || val === "Gold") return val;
              }
            } catch {
              /* ignore */
            }
            return "Basic";
          })();
          employerRows.push({
            "Company Name": j.company || "—",
            Phone: j.employerPhone,
            Plan: plan,
            "Jobs Posted": myJobs.length,
            "Job Titles": myJobs.map((x) => x.title).join("; ") || "—",
          });
        }
      }

      const wsEmployers = XLSX.utils.json_to_sheet(
        employerRows.length > 0
          ? employerRows
          : [
              {
                "Company Name": "No data",
                Phone: "",
                Plan: "",
                "Jobs Posted": 0,
                "Job Titles": "",
              },
            ],
      );
      XLSX.utils.book_append_sheet(wb, wsEmployers, "Employers");

      // Sheet 3: Jobs
      const jobRows = jobs.map((j) => ({
        "Job Title": j.title,
        "Company Name": j.company,
        Location: j.location,
        Category: j.category,
        Salary: j.salary,
        Status: j.status,
        "Posted At": new Date(j.postedAt).toLocaleDateString("en-IN"),
      }));

      const wsJobs = XLSX.utils.json_to_sheet(
        jobRows.length > 0
          ? jobRows
          : [
              {
                "Job Title": "No data",
                "Company Name": "",
                Location: "",
                Category: "",
                Salary: "",
                Status: "",
                "Posted At": "",
              },
            ],
      );
      XLSX.utils.book_append_sheet(wb, wsJobs, "Jobs");

      // Sheet 4: Applications
      const appRows = apps.map((a) => ({
        "Candidate Name": a.employeeName || "—",
        Phone: a.employeePhone,
        Email: a.employeeEmail || "—",
        "Job Title": a.jobTitle,
        "Company Name": a.company,
        Location: a.location,
        Experience: a.experience || "—",
        Status: a.status,
        "Candidate Status": a.candidateStatus || "—",
        "Applied At": new Date(a.appliedAt).toLocaleDateString("en-IN"),
      }));

      const wsApps = XLSX.utils.json_to_sheet(
        appRows.length > 0
          ? appRows
          : [
              {
                "Candidate Name": "No data",
                Phone: "",
                Email: "",
                "Job Title": "",
                "Company Name": "",
                Location: "",
                Experience: "",
                Status: "",
                "Candidate Status": "",
                "Applied At": "",
              },
            ],
      );
      XLSX.utils.book_append_sheet(wb, wsApps, "Applications");

      // Download
      const dateStr = new Date().toISOString().slice(0, 10);
      XLSX.writeFile(wb, `QuickRozgar_Report_${dateStr}.xlsx`);
      toast.success("Report download ho rahi hai! ✅");
    } catch (err) {
      console.error(err);
      toast.error("Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  // Compute stats
  const totalEmployees = new Set(apps.map((a) => a.employeePhone)).size;
  const totalEmployers = new Set(jobs.map((j) => j.employerPhone)).size;
  const totalJobs = jobs.length;
  const totalApps = apps.length;

  return (
    <SectionShell
      title="Reports"
      description="Export complete platform data to Excel"
    >
      <div className="p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            {
              label: "Employees",
              value: loading ? "..." : totalEmployees,
              color: "bg-blue-50 text-blue-700",
            },
            {
              label: "Employers",
              value: loading ? "..." : totalEmployers,
              color: "bg-emerald-50 text-emerald-700",
            },
            {
              label: "Total Jobs",
              value: loading ? "..." : totalJobs,
              color: "bg-violet-50 text-violet-700",
            },
            {
              label: "Applications",
              value: loading ? "..." : totalApps,
              color: "bg-amber-50 text-amber-700",
            },
          ].map((card) => (
            <div key={card.label} className={`rounded-xl p-4 ${card.color}`}>
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-xs font-medium mt-0.5">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Export Section */}
        <div className="border border-gray-200 rounded-xl p-5 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
              <FileSpreadsheet className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                Full Platform Export
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">
                Downloads all real data from the database as a structured Excel
                file with 4 sheets:
              </p>
              <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                📋 <strong>Employees:</strong> Name, Phone, Email, Jobs Applied,
                Status
                <br />🏢 <strong>Employers:</strong> Company Name, Plan, Jobs
                Posted
                <br />💼 <strong>Jobs:</strong> Title, Company, Status, Location
                <br />📝 <strong>Applications:</strong> Candidate Name, Job
                Title, Status, Candidate Status
              </p>
            </div>
          </div>

          <Button
            onClick={handleExportExcel}
            disabled={exporting || loading}
            className="w-full h-11 gap-2 font-semibold bg-green-600 hover:bg-green-700 text-white"
            data-ocid="admin.export_excel_button"
          >
            {exporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" /> Export to Excel (.xlsx)
              </>
            )}
          </Button>
        </div>
      </div>
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
