import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Bell,
  Briefcase,
  CheckCircle2,
  CreditCard,
  Edit2,
  LayoutDashboard,
  Loader2,
  LogOut,
  Pause,
  Phone,
  Play,
  Plus,
  Star,
  Trophy,
  User,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { backendPostJob, backendSaveEmployerProfile } from "../utils/backendDb";
import { getEmployerSession } from "../utils/employerSession";
import {
  getApplicationsForEmployer,
  getEmployerProfileData,
  saveEmployerProfileData,
} from "../utils/localDb";
import {
  getEmployerJobs,
  getAllJobs as getLocalAllJobs,
  deleteJob as localDeleteJob,
  postJob,
  updateCandidateStatus,
} from "../utils/localDb";

interface EmployerDashboardProps {
  onLogout: () => void;
}

type View =
  | "login"
  | "dashboard"
  | "post-job"
  | "manage-jobs"
  | "applications"
  | "plans"
  | "profile";

type LoginMethod = "otp" | "email";
type AuthTab = "login" | "signup";

const JOB_CATEGORIES = [
  { emoji: "🍽️", label: "Waiter" },
  { emoji: "👨\u200d🍳", label: "Chef" },
  { emoji: "🧹", label: "Housekeeping" },
  { emoji: "🛵", label: "Delivery Boy" },
  { emoji: "📞", label: "Call Centre Jobs" },
  { emoji: "🛍️", label: "Retail Jobs" },
];

const _SAMPLE_CANDIDATES = [
  {
    name: "Rahul Sharma",
    phone: "9876543210",
    job: "Waiter",
    location: "Siliguri",
    status: "New" as const,
  },
  {
    name: "Priya Devi",
    phone: "9781122334",
    job: "Housekeeping",
    location: "Gangtok",
    status: "Viewed" as const,
  },
  {
    name: "Arjun Tamang",
    phone: "9312345678",
    job: "Chef",
    location: "Darjeeling",
    status: "Contacted" as const,
  },
  {
    name: "Meena Rai",
    phone: "8745678901",
    job: "Delivery Boy",
    location: "Siliguri",
    status: "New" as const,
  },
  {
    name: "Suman Gurung",
    phone: "7623456789",
    job: "Call Centre Jobs",
    location: "Kalimpong",
    status: "New" as const,
  },
  {
    name: "Anita Thapa",
    phone: "9988776655",
    job: "Retail Jobs",
    location: "Delhi",
    status: "Viewed" as const,
  },
  {
    name: "Bikash Roy",
    phone: "8877665544",
    job: "Waiter",
    location: "Mumbai",
    status: "New" as const,
  },
  {
    name: "Sunita Devi",
    phone: "9765432109",
    job: "Housekeeping",
    location: "Bangalore",
    status: "Contacted" as const,
  },
];

type CandidateStatus = "New" | "Viewed" | "Contacted";

const APPLICANT_COUNTS = [3, 7, 2, 5, 1, 8, 4, 6];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function StatusBadge({ status }: { status: CandidateStatus }) {
  const styles: Record<CandidateStatus, string> = {
    New: "bg-blue-100 text-blue-700",
    Viewed: "bg-gray-100 text-gray-600",
    Contacted: "bg-green-100 text-green-700",
  };
  return (
    <span
      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${styles[status]}`}
    >
      {status}
    </span>
  );
}

// Suppress unused warning
const _StatusBadge = StatusBadge;

// ─── Login / Signup ───────────────────────────────────────────────────────────
function LoginView({ onEnter }: { onEnter: () => void }) {
  const [authTab, setAuthTab] = useState<AuthTab>("login");
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("otp");
  const [otpSent, setOtpSent] = useState(false);
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signup, setSignup] = useState({
    companyName: "",
    contactPerson: "",
    mobile: "",
    email: "",
    location: "",
  });

  const handleSendOtp = () => {
    if (!mobile || mobile.length < 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }
    setOtpSent(true);
    toast.success(`OTP sent to ${mobile}`);
  };

  const handleLogin = () => {
    toast.success("Login successful! Welcome to QuickRozgar Employer");
    onEnter();
  };

  const handleSignup = () => {
    if (
      !signup.companyName ||
      !signup.contactPerson ||
      !signup.mobile ||
      !signup.email ||
      !signup.location
    ) {
      toast.error("Please fill all required fields");
      return;
    }
    toast.success("Login successful! Welcome to QuickRozgar Employer");
    onEnter();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[oklch(25%_0.08_261)] to-[oklch(35%_0.12_261)] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[400px]"
      >
        {/* Header Banner */}
        <div className="rounded-t-3xl bg-[oklch(20%_0.1_261)] px-6 py-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Briefcase className="text-yellow-400" size={28} />
            <span className="text-white font-bold text-2xl tracking-tight">
              Quick<span className="text-yellow-400">Rozgar</span>
            </span>
          </div>
          <p className="text-yellow-400 font-semibold text-sm mt-1">
            Hire the Right Talent, Faster
          </p>
          <p className="text-white/60 text-xs mt-1">Employer Portal</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-b-3xl shadow-2xl px-6 pb-8 pt-6">
          {/* Tabs */}
          <div
            className="flex rounded-2xl bg-gray-100 p-1 mb-6"
            data-ocid="employer.auth.tab"
          >
            {(["login", "signup"] as AuthTab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setAuthTab(t)}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                  authTab === t
                    ? "bg-white text-[oklch(30%_0.1_261)] shadow-sm"
                    : "text-gray-500"
                }`}
              >
                {t === "login" ? "Login" : "Sign Up"}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {authTab === "login" ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                className="space-y-4"
              >
                {/* Login method toggle */}
                <div className="flex gap-2">
                  {(["otp", "email"] as LoginMethod[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setLoginMethod(m);
                        setOtpSent(false);
                      }}
                      className={`flex-1 py-2 rounded-xl border text-xs font-semibold transition-all ${
                        loginMethod === m
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-gray-200 text-gray-500"
                      }`}
                      data-ocid={`employer.login.${m}_toggle`}
                    >
                      {m === "otp" ? "📱 Mobile OTP" : "✉️ Email & Password"}
                    </button>
                  ))}
                </div>

                {loginMethod === "otp" ? (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs font-semibold text-gray-700">
                        Mobile Number
                      </Label>
                      <Input
                        placeholder="Enter 10-digit mobile number"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        className="mt-1 rounded-xl"
                        data-ocid="employer.login.mobile_input"
                      />
                    </div>
                    {!otpSent ? (
                      <Button
                        className="w-full rounded-xl font-bold bg-[oklch(30%_0.1_261)] hover:bg-[oklch(25%_0.1_261)] text-white"
                        onClick={handleSendOtp}
                        data-ocid="employer.login.send_otp_button"
                      >
                        Send OTP
                      </Button>
                    ) : (
                      <>
                        <div>
                          <Label className="text-xs font-semibold text-gray-700">
                            Enter OTP
                          </Label>
                          <Input
                            placeholder="Enter OTP received"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="mt-1 rounded-xl"
                            data-ocid="employer.login.otp_input"
                          />
                        </div>
                        <Button
                          className="w-full rounded-xl font-bold bg-[oklch(30%_0.1_261)] hover:bg-[oklch(25%_0.1_261)] text-white"
                          onClick={handleLogin}
                          data-ocid="employer.login.verify_button"
                        >
                          Verify &amp; Login
                        </Button>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs font-semibold text-gray-700">
                        Email Address
                      </Label>
                      <Input
                        type="email"
                        placeholder="your@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 rounded-xl"
                        data-ocid="employer.login.email_input"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-gray-700">
                        Password
                      </Label>
                      <Input
                        type="password"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 rounded-xl"
                        data-ocid="employer.login.password_input"
                      />
                    </div>
                    <Button
                      className="w-full rounded-xl font-bold bg-[oklch(30%_0.1_261)] hover:bg-[oklch(25%_0.1_261)] text-white"
                      onClick={handleLogin}
                      data-ocid="employer.login.submit_button"
                    >
                      Login
                    </Button>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="signup"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                className="space-y-3"
              >
                {(
                  [
                    {
                      field: "companyName" as const,
                      label: "Company Name",
                      placeholder: "e.g. Sharma Enterprises",
                    },
                    {
                      field: "contactPerson" as const,
                      label: "Contact Person Name",
                      placeholder: "e.g. Raj Sharma",
                    },
                    {
                      field: "mobile" as const,
                      label: "Mobile Number",
                      placeholder: "10-digit mobile number",
                    },
                    {
                      field: "email" as const,
                      label: "Email ID",
                      placeholder: "company@email.com",
                    },
                    {
                      field: "location" as const,
                      label: "Company Location",
                      placeholder: "e.g. Siliguri, West Bengal",
                    },
                  ] as const
                ).map(({ field, label, placeholder }) => (
                  <div key={field}>
                    <Label className="text-xs font-semibold text-gray-700">
                      {label} *
                    </Label>
                    <Input
                      placeholder={placeholder}
                      value={signup[field]}
                      onChange={(e) =>
                        setSignup((s) => ({ ...s, [field]: e.target.value }))
                      }
                      className="mt-1 rounded-xl"
                      data-ocid={`employer.signup.${field}_input`}
                    />
                  </div>
                ))}
                <Button
                  className="w-full rounded-xl font-bold bg-[oklch(30%_0.1_261)] hover:bg-[oklch(25%_0.1_261)] text-white mt-2"
                  onClick={handleSignup}
                  data-ocid="employer.signup.submit_button"
                >
                  Create Account
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Dashboard Overview ────────────────────────────────────────────────────────
function DashboardView({
  onNavigate,
  onLogout,
  jobCount,
}: {
  onNavigate: (v: View) => void;
  onLogout: () => void;
  jobCount: number;
}) {
  const dashCards = [
    {
      icon: <Plus size={22} />,
      title: "Post a Job",
      desc: "Create a new job listing",
      view: "post-job" as View,
      color: "bg-blue-50 text-blue-600",
    },
    {
      icon: <Briefcase size={22} />,
      title: "Manage Jobs",
      desc: "View and edit your listings",
      view: "manage-jobs" as View,
      color: "bg-green-50 text-green-600",
    },
    {
      icon: <Users size={22} />,
      title: "Applications",
      desc: "Review candidate applications",
      view: "applications" as View,
      color: "bg-purple-50 text-purple-600",
    },
    {
      icon: <CreditCard size={22} />,
      title: "Subscription Plan",
      desc: "Upgrade your hiring plan",
      view: "plans" as View,
      color: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <motion.div
      key="dashboard"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      {/* Greeting */}
      <div className="bg-gradient-to-r from-[oklch(28%_0.1_261)] to-[oklch(38%_0.12_261)] rounded-2xl p-5 text-white">
        <p className="text-white/70 text-sm">Welcome back,</p>
        <h2 className="font-bold text-xl mt-0.5">Good Day, Employer 👋</h2>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-xs text-white/60">Quick Rozgar Pvt. Ltd.</span>
          <span className="bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto">
            Basic Plan
          </span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Jobs Posted", value: jobCount, color: "text-blue-600" },
          {
            label: "Applications",
            value: (() => {
              const sess = getEmployerSession();
              return sess ? getApplicationsForEmployer(sess.phone).length : 0;
            })(),
            color: "text-purple-600",
          },
          { label: "Active Plan", value: "Basic", color: "text-amber-600" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl p-3 text-center border border-gray-100 shadow-sm"
          >
            <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Notification */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
        <Bell size={18} className="text-blue-500 mt-0.5 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-800">
            🔔 You have 3 new candidate applications
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            Review them before they expire
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="rounded-xl text-xs border-blue-200 text-blue-600 shrink-0"
          onClick={() => onNavigate("applications")}
          data-ocid="employer.dashboard.view_applications_button"
        >
          View
        </Button>
      </div>

      {/* Action Cards */}
      <div>
        <h3 className="font-bold text-gray-800 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          {dashCards.map((card, _i) => (
            <button
              key={card.view}
              type="button"
              onClick={() => onNavigate(card.view)}
              className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-left active:scale-[0.97] transition-transform"
              data-ocid={`employer.dashboard.${card.view}_button`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}
              >
                {card.icon}
              </div>
              <p className="font-semibold text-sm text-gray-800">
                {card.title}
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">{card.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Logout */}
      <Button
        variant="outline"
        className="w-full rounded-2xl h-11 text-red-500 border-red-100"
        onClick={onLogout}
        data-ocid="employer.dashboard.logout_button"
      >
        <LogOut size={16} className="mr-2" /> Logout
      </Button>
    </motion.div>
  );
}

// ─── Employer Profile View ─────────────────────────────────────────────────────
function ProfileView({ onSaved }: { onSaved: () => void }) {
  const session = getEmployerSession();
  const [companyName, setCompanyName] = useState(() => {
    if (!session?.phone) return "";
    return getEmployerProfileData(session.phone)?.companyName ?? "";
  });
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    if (!companyName.trim()) {
      toast.error("Company Name is required");
      return;
    }
    if (!session?.phone) {
      toast.error("Session not found. Please re-login.");
      return;
    }
    setSaving(true);
    saveEmployerProfileData(session.phone, { companyName: companyName.trim() });
    // Also save to ICP backend for cross-device sync
    backendSaveEmployerProfile(session.phone, companyName.trim()).catch(
      () => {},
    ); // fire-and-forget
    toast.success("Profile saved! ✅");
    setSaving(false);
    onSaved();
  };

  return (
    <motion.div
      key="profile"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-[oklch(28%_0.1_261)]/10 flex items-center justify-center">
            <User size={22} className="text-[oklch(28%_0.1_261)]" />
          </div>
          <div>
            <p className="font-bold text-gray-800">Company Profile</p>
            <p className="text-xs text-gray-500">
              Manage your business details
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold text-gray-700">
            Company Name *
          </Label>
          <Input
            placeholder="e.g. Quick Rozgar Pvt. Ltd."
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="rounded-xl"
            data-ocid="employer.profile.company_name_input"
          />
          <p className="text-[11px] text-gray-400">
            ℹ️ This company name will be shown in all your job postings
          </p>
        </div>

        <Button
          className="w-full rounded-xl font-bold bg-[oklch(30%_0.1_261)] hover:bg-[oklch(25%_0.1_261)] text-white"
          onClick={handleSave}
          disabled={saving}
          data-ocid="employer.profile.save_button"
        >
          {saving ? <Loader2 size={16} className="mr-2 animate-spin" /> : null}
          Save Profile
        </Button>
      </div>
    </motion.div>
  );
}

// ─── Post Job (3-step) ─────────────────────────────────────────────────────────
function PostJobView({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState("");
  const [form, setForm] = useState({
    title: "",
    salary: "",
    location: "",
    openings: "",
    description: "",
  });
  const handlePost = () => {
    const erpSession = getEmployerSession();
    const profileData = erpSession?.phone
      ? getEmployerProfileData(erpSession.phone)
      : null;
    const companyName =
      profileData?.companyName ||
      erpSession?.companyName ||
      erpSession?.email?.split("@")[0] ||
      "My Company";
    const newJob = postJob({
      title: form.title,
      company: companyName,
      location: form.location,
      salary: form.salary || "Negotiable",
      category,
      description: form.description,
      employerPhone: erpSession?.phone || "unknown",
    });
    // Also save to ICP backend for cross-device sync
    backendPostJob({
      id: newJob.id,
      title: newJob.title,
      company: newJob.company,
      location: newJob.location,
      salary: newJob.salary,
      category: newJob.category,
      description: newJob.description,
      employerPhone: newJob.employerPhone,
      postedAt: newJob.postedAt,
    }).catch(() => {}); // fire-and-forget
    toast.success("Job posted successfully! 🎉");
    onDone();
  };

  return (
    <motion.div
      key="post-job"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      {/* Stepper */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className="flex items-center gap-2 flex-1 last:flex-none"
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                step >= s
                  ? "bg-[oklch(30%_0.1_261)] text-white"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {step > s ? <CheckCircle2 size={16} /> : s}
            </div>
            {s < 3 && (
              <div
                className={`h-1 flex-1 rounded-full ${step > s ? "bg-[oklch(30%_0.1_261)]" : "bg-gray-200"}`}
              />
            )}
          </div>
        ))}
        <p className="text-xs text-gray-500 ml-2 shrink-0">Step {step} of 3</p>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
          >
            <h3 className="font-bold text-gray-800 text-lg mb-4">
              Select Job Category
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {JOB_CATEGORIES.map((cat) => (
                <button
                  key={cat.label}
                  type="button"
                  onClick={() => setCategory(cat.label)}
                  className={`rounded-2xl p-4 border-2 text-left transition-all active:scale-[0.97] ${
                    category === cat.label
                      ? "border-[oklch(30%_0.1_261)] bg-[oklch(30%_0.1_261)]/5"
                      : "border-gray-100 bg-white"
                  }`}
                  data-ocid={`employer.postjob.category_${cat.label.toLowerCase().replace(/ /g, "_")}_button`}
                >
                  <span className="text-2xl">{cat.emoji}</span>
                  <p className="font-semibold text-sm text-gray-800 mt-2">
                    {cat.label}
                  </p>
                </button>
              ))}
            </div>
            <Button
              className="w-full mt-5 rounded-2xl font-bold bg-[oklch(30%_0.1_261)] hover:bg-[oklch(25%_0.1_261)] text-white"
              onClick={() => {
                if (!category) {
                  toast.error("Please select a job category");
                  return;
                }
                setStep(2);
              }}
              data-ocid="employer.postjob.step1_next_button"
            >
              Next
            </Button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            className="space-y-4"
          >
            <h3 className="font-bold text-gray-800 text-lg">
              Enter Job Details
            </h3>
            <div className="space-y-3">
              <div>
                <Label className="text-xs font-semibold">Job Title *</Label>
                <Input
                  placeholder="e.g. Senior Waiter"
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  className="mt-1 rounded-xl"
                  data-ocid="employer.postjob.title_input"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">
                  Salary Range (optional)
                </Label>
                <Input
                  placeholder="e.g. ₹12,000 – ₹18,000/month"
                  value={form.salary}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, salary: e.target.value }))
                  }
                  className="mt-1 rounded-xl"
                  data-ocid="employer.postjob.salary_input"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Job Location *</Label>
                <Input
                  placeholder="e.g. Siliguri, West Bengal"
                  value={form.location}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, location: e.target.value }))
                  }
                  className="mt-1 rounded-xl"
                  data-ocid="employer.postjob.location_input"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">
                  Number of Openings *
                </Label>
                <Input
                  type="number"
                  placeholder="e.g. 3"
                  value={form.openings}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, openings: e.target.value }))
                  }
                  className="mt-1 rounded-xl"
                  data-ocid="employer.postjob.openings_input"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">
                  Job Description *
                </Label>
                <Textarea
                  placeholder="Describe the role, responsibilities, requirements..."
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  className="mt-1 rounded-xl resize-none"
                  rows={4}
                  data-ocid="employer.postjob.description_textarea"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={() => setStep(1)}
                data-ocid="employer.postjob.step2_back_button"
              >
                Back
              </Button>
              <Button
                className="flex-1 rounded-xl font-bold bg-[oklch(30%_0.1_261)] hover:bg-[oklch(25%_0.1_261)] text-white"
                onClick={() => {
                  if (
                    !form.title ||
                    !form.location ||
                    !form.openings ||
                    !form.description
                  ) {
                    toast.error("Please fill all required fields");
                    return;
                  }
                  setStep(3);
                }}
                data-ocid="employer.postjob.step2_next_button"
              >
                Next
              </Button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            className="space-y-4"
          >
            <h3 className="font-bold text-gray-800 text-lg">
              Review &amp; Publish
            </h3>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
              <div className="flex justify-between">
                <span className="text-xs text-gray-500">Category</span>
                <span className="text-sm font-semibold text-gray-800">
                  {category}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-500">Job Title</span>
                <span className="text-sm font-semibold text-gray-800">
                  {form.title}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-500">Salary</span>
                <span className="text-sm font-semibold text-gray-800">
                  {form.salary || "Negotiable"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-500">Location</span>
                <span className="text-sm font-semibold text-gray-800">
                  {form.location}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-500">Openings</span>
                <span className="text-sm font-semibold text-gray-800">
                  {form.openings}
                </span>
              </div>
              <div className="pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-500">Description</span>
                <p className="text-sm text-gray-700 mt-1">{form.description}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={() => setStep(2)}
                data-ocid="employer.postjob.step3_back_button"
              >
                Back
              </Button>
              <Button
                className="flex-1 rounded-xl font-bold bg-[oklch(30%_0.1_261)] hover:bg-[oklch(25%_0.1_261)] text-white"
                onClick={handlePost}
                disabled={false}
                data-ocid="employer.postjob.submit_button"
              >
                Post Job
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Manage Jobs ───────────────────────────────────────────────────────────────
function ManageJobsView() {
  const session = getEmployerSession();
  const [jobs, setJobs] = useState(() =>
    session ? getEmployerJobs(session.phone) : [],
  );
  const [paused, setPaused] = useState<Set<string>>(new Set());

  const handleDelete = (jobId: string) => {
    localDeleteJob(jobId);
    setJobs(session ? getEmployerJobs(session.phone) : []);
    toast.success("Job closed successfully");
  };

  if (!jobs || jobs.length === 0) {
    return (
      <div
        className="text-center py-16 text-gray-500"
        data-ocid="employer.managejobs.empty_state"
      >
        <Briefcase size={40} className="mx-auto mb-3 opacity-30" />
        <p className="font-semibold">No jobs posted yet.</p>
        <p className="text-sm mt-1">
          Post your first job to find the right talent.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      key="manage-jobs"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {jobs.map((job, i) => {
        const isPaused = paused.has(job.id);
        const applicantCount = APPLICANT_COUNTS[i % APPLICANT_COUNTS.length];
        return (
          <div
            key={job.id}
            className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm"
            data-ocid={`employer.managejobs.item.${i + 1}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800">{job.company}</p>
                <p className="text-sm text-gray-600 truncate">{job.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{job.location}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-purple-600 font-semibold bg-purple-50 px-2 py-0.5 rounded-full">
                    {applicantCount} Applicants
                  </span>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      isPaused
                        ? "bg-gray-100 text-gray-500"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {isPaused ? "Paused" : "Active"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-3 shrink-0">
                <button
                  type="button"
                  onClick={() => toast.info("Edit feature coming soon")}
                  className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center"
                  data-ocid={`employer.managejobs.edit_button.${i + 1}`}
                >
                  <Edit2 size={14} className="text-blue-500" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPaused((prev) => {
                      const next = new Set(prev);
                      if (next.has(job.id)) next.delete(job.id);
                      else next.add(job.id);
                      return next;
                    })
                  }
                  className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center"
                  data-ocid={`employer.managejobs.pause_button.${i + 1}`}
                >
                  {isPaused ? (
                    <Play size={14} className="text-amber-500" />
                  ) : (
                    <Pause size={14} className="text-amber-500" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(job.id)}
                  className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center"
                  data-ocid={`employer.managejobs.delete_button.${i + 1}`}
                >
                  <X size={14} className="text-red-500" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </motion.div>
  );
}

// Candidate status badge helper
function CandidateStatusBadge({ status }: { status: string }) {
  let cls = "bg-yellow-100 text-yellow-700";
  if (status === "Selected") cls = "bg-green-100 text-green-700";
  if (status === "Rejected") cls = "bg-red-100 text-red-700";
  return (
    <span
      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cls}`}
    >
      {status}
    </span>
  );
}

// ─── Applications ──────────────────────────────────────────────────────────────
function ApplicationsView() {
  const session = getEmployerSession();
  const [candidates] = useState(() =>
    session ? getApplicationsForEmployer(session.phone) : [],
  );
  const [statusMap, setStatusMap] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const c of candidates) {
      map[c.id] = c.candidateStatus || "Under Review";
    }
    return map;
  });

  return (
    <motion.div
      key="applications"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Candidate Cards */}
      {candidates.length === 0 ? (
        <div
          className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-sm text-gray-400"
          data-ocid="employer.applications.empty_state"
        >
          No approved applications yet. Admin needs to approve applications
          first.
        </div>
      ) : (
        <div className="space-y-3">
          {candidates.map((candidate, i) => (
            <div
              key={candidate.id}
              className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm"
              data-ocid={`employer.applications.item.${i + 1}`}
            >
              <div className="flex items-start gap-3">
                <Avatar className="w-10 h-10 shrink-0">
                  <AvatarFallback className="bg-[oklch(30%_0.1_261)] text-white text-xs font-bold">
                    {getInitials(
                      candidate.employeeName || candidate.employeePhone,
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-sm text-gray-800">
                      {candidate.employeeName || "Applicant"}
                    </p>
                    <CandidateStatusBadge
                      status={statusMap[candidate.id] || "Under Review"}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    📞 {candidate.employeePhone}
                  </p>
                  {candidate.experience && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      💼 Experience: {candidate.experience}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                      {candidate.jobTitle}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      📍 {candidate.location}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Management */}
              <div className="mt-3 space-y-2">
                <Label className="text-xs font-semibold text-gray-600">
                  Candidate Status
                </Label>
                <div className="flex gap-2">
                  <Select
                    value={statusMap[candidate.id] || "Under Review"}
                    onValueChange={(val) =>
                      setStatusMap((prev) => ({ ...prev, [candidate.id]: val }))
                    }
                  >
                    <SelectTrigger
                      className="flex-1 rounded-xl text-xs h-9"
                      data-ocid={`employer.applications.status_select.${i + 1}`}
                    >
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Under Review">Under Review</SelectItem>
                      <SelectItem value="Selected">Selected</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    className="rounded-xl text-xs h-9 px-4 bg-[oklch(30%_0.1_261)] hover:bg-[oklch(25%_0.1_261)] text-white"
                    onClick={() => {
                      updateCandidateStatus(
                        candidate.id,
                        statusMap[candidate.id] || "Under Review",
                      );
                      toast.success("Status updated! ✅");
                    }}
                    data-ocid={`employer.applications.save_status_button.${i + 1}`}
                  >
                    Save
                  </Button>
                </div>
              </div>

              <Button
                size="sm"
                variant="outline"
                className="w-full mt-3 rounded-xl text-xs border-green-200 text-green-700 hover:bg-green-50"
                onClick={() => {
                  window.location.href = `tel:${candidate.employeePhone}`;
                }}
                data-ocid={`employer.applications.call_button.${i + 1}`}
              >
                <Phone size={12} className="mr-1.5" /> Call Candidate
              </Button>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ─── Plans ─────────────────────────────────────────────────────────────────────
function PlansView() {
  const plans = [
    {
      name: "BASIC",
      icon: null,
      price: "₹0",
      period: "Free",
      features: ["1 Job Posting", "Valid for 7 days", "Limited visibility"],
      cta: "Current Plan",
      ctaDisabled: true,
      highlight: false,
      cardClass: "border-gray-200 bg-white",
      ctaClass: "bg-gray-100 text-gray-400 cursor-not-allowed",
      badge: null,
    },
    {
      name: "SILVER",
      icon: <Star size={16} className="text-gray-500" />,
      price: "₹499",
      period: "/ month",
      features: [
        "5 Job Postings",
        "Valid for 30 days",
        "Medium visibility",
        "Jobs appear higher in listing",
      ],
      cta: "Choose Plan",
      ctaDisabled: false,
      highlight: false,
      cardClass: "border-gray-300 bg-white",
      ctaClass:
        "bg-[oklch(30%_0.1_261)] text-white hover:bg-[oklch(25%_0.1_261)]",
      badge: null,
    },
    {
      name: "GOLD",
      icon: <Trophy size={16} className="text-amber-500" />,
      price: "₹999",
      period: "/ month",
      features: [
        "Unlimited Job Postings",
        "Valid for 30–60 days",
        "Top visibility (featured)",
        "Highlighted job listing",
        "Priority candidate access",
        "Contact candidates directly",
      ],
      cta: "Choose Plan",
      ctaDisabled: false,
      highlight: true,
      cardClass: "border-2 border-amber-400 bg-amber-50",
      ctaClass: "bg-amber-400 text-amber-900 hover:bg-amber-500 font-bold",
      badge: "Most Popular",
    },
  ];

  return (
    <motion.div
      key="plans"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="text-center">
        <h2 className="font-bold text-gray-800 text-xl">
          Choose Your Hiring Plan
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Upgrade to reach more candidates faster
        </p>
      </div>

      <div className="space-y-4">
        {plans.map((plan, i) => (
          <div
            key={plan.name}
            className={`rounded-2xl p-5 ${plan.cardClass} relative`}
            data-ocid={`employer.plans.item.${i + 1}`}
          >
            {plan.badge && (
              <span className="absolute top-3 right-3 text-[10px] font-bold bg-amber-400 text-amber-900 px-2 py-0.5 rounded-full">
                {plan.badge}
              </span>
            )}
            <div className="flex items-center gap-2 mb-1">
              {plan.icon}
              <p className="font-bold text-gray-800 text-base">{plan.name}</p>
            </div>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-2xl font-bold text-gray-900">
                {plan.price}
              </span>
              <span className="text-sm text-gray-500">{plan.period}</span>
            </div>
            <ul className="space-y-2 mb-5">
              {plan.features.map((feat) => (
                <li
                  key={feat}
                  className="flex items-start gap-2 text-sm text-gray-700"
                >
                  <CheckCircle2
                    size={14}
                    className="text-green-500 mt-0.5 shrink-0"
                  />
                  {feat}
                </li>
              ))}
            </ul>
            <button
              type="button"
              disabled={plan.ctaDisabled}
              onClick={() =>
                !plan.ctaDisabled && toast.info("Plan upgrade coming soon!")
              }
              className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${plan.ctaClass}`}
              data-ocid={`employer.plans.choose_button.${i + 1}`}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Root Component ────────────────────────────────────────────────────────────
export default function EmployerDashboard({
  onLogout,
}: EmployerDashboardProps) {
  const [view, setView] = useState<View>("login");
  const [jobs, setJobs] = useState(() => getLocalAllJobs());
  // refresh job count when view changes
  const _ = setJobs;

  if (view === "login") {
    return <LoginView onEnter={() => setView("dashboard")} />;
  }

  const navItems = [
    {
      id: "dashboard" as View,
      icon: <LayoutDashboard size={20} />,
      label: "Dashboard",
    },
    { id: "post-job" as View, icon: <Plus size={20} />, label: "Post Job" },
    {
      id: "applications" as View,
      icon: <Users size={20} />,
      label: "Applications",
    },
    { id: "plans" as View, icon: <CreditCard size={20} />, label: "Plans" },
    { id: "profile" as View, icon: <User size={20} />, label: "Profile" },
  ];

  const subViews: View[] = [
    "post-job",
    "manage-jobs",
    "applications",
    "plans",
    "profile",
  ];
  const isSubView = subViews.includes(view);

  const viewTitles: Partial<Record<View, string>> = {
    "post-job": "Post a Job",
    "manage-jobs": "Manage Jobs",
    applications: "Applications Received",
    plans: "Subscription Plans",
    profile: "My Profile",
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[oklch(28%_0.1_261)] px-4 pt-10 pb-4">
        <div className="flex items-center gap-3">
          {isSubView && (
            <button
              type="button"
              onClick={() => setView("dashboard")}
              className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white"
              data-ocid="employer.header.back_button"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <div className="flex-1">
            {isSubView ? (
              <h1 className="text-white font-bold text-lg">
                {viewTitles[view]}
              </h1>
            ) : (
              <div className="flex items-center gap-2">
                <Briefcase size={20} className="text-yellow-400" />
                <span className="text-white font-bold text-lg">
                  Quick<span className="text-yellow-400">Rozgar</span>
                </span>
              </div>
            )}
          </div>
          {view === "manage-jobs" && (
            <button
              type="button"
              onClick={() => setView("post-job")}
              className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white"
              data-ocid="employer.header.add_job_button"
            >
              <Plus size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pt-5 pb-28">
        <AnimatePresence mode="wait">
          {view === "dashboard" && (
            <DashboardView
              key="dashboard"
              onNavigate={setView}
              onLogout={onLogout}
              jobCount={(jobs ?? []).length}
            />
          )}
          {view === "post-job" && (
            <PostJobView key="post-job" onDone={() => setView("manage-jobs")} />
          )}
          {view === "manage-jobs" && <ManageJobsView key="manage-jobs" />}
          {view === "applications" && <ApplicationsView key="applications" />}
          {view === "plans" && <PlansView key="plans" />}
          {view === "profile" && (
            <ProfileView key="profile" onSaved={() => setView("dashboard")} />
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-gray-100 z-50 shadow-[0_-2px_20px_oklch(0_0_0/0.08)]">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setView(item.id)}
              className={`flex flex-col items-center gap-1 flex-1 py-2 rounded-xl transition-colors ${
                view === item.id ? "text-[oklch(28%_0.1_261)]" : "text-gray-400"
              }`}
              data-ocid={`employer.nav.${item.id}_button`}
            >
              {item.icon}
              <span className="text-[10px] font-semibold">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
