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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Lock, Plus, Trash2, Users } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { JOB_CATEGORIES } from "../data/sampleData";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCreateJob, useDeleteJob, useGetAllJobs } from "../hooks/useQueries";

interface EmployerScreenProps {
  onBack: () => void;
}

const SAMPLE_LEADS = [
  {
    name: "Rahul Sharma",
    phone: "98765 5678",
    role: "Waiter",
    city: "Siliguri",
    status: "Applied",
  },
  {
    name: "Priya Devi",
    phone: "97811 1234",
    role: "Housekeeping",
    city: "Gangtok",
    status: "Applied",
  },
  {
    name: "Arjun Tamang",
    phone: "93****9012",
    role: "Chef",
    city: "Darjeeling",
    status: "Applied",
  },
  {
    name: "Meena Rai",
    phone: "87****3456",
    role: "Delivery",
    city: "Siliguri",
    status: "Applied",
  },
  {
    name: "Suman Gurung",
    phone: "76****7890",
    role: "Call Centre",
    city: "Kalimpong",
    status: "Applied",
  },
];

const FREE_LEADS_COUNT = 2;

export default function EmployerScreen({ onBack }: EmployerScreenProps) {
  const { identity } = useInternetIdentity();
  const { data: jobs, isLoading } = useGetAllJobs();
  const createJob = useCreateJob();
  const deleteJob = useDeleteJob();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    company: "",
    location: "",
    salary: "",
    category: "",
    description: "",
  });

  if (!identity) {
    return (
      <div className="flex flex-col items-center justify-center h-screen px-6 text-center gap-4">
        <span className="text-5xl">🔒</span>
        <h2 className="text-xl font-bold text-foreground">Login Karo</h2>
        <p className="text-muted-foreground text-sm">
          Employer section ke liye login zaroori hai
        </p>
        <Button
          className="rounded-2xl"
          onClick={onBack}
          data-ocid="employer.back_button"
        >
          Wapas Jao
        </Button>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (
      !form.title ||
      !form.company ||
      !form.location ||
      !form.salary ||
      !form.category
    ) {
      toast.error("Sab fields bharni zaroori hain");
      return;
    }
    try {
      await createJob.mutateAsync(form);
      toast.success("Job post ho gaya! 🎉");
      setForm({
        title: "",
        company: "",
        location: "",
        salary: "",
        category: "",
        description: "",
      });
      setShowForm(false);
    } catch {
      toast.error("Job post nahi hua. Dubara try karo.");
    }
  };

  const handleDelete = async (jobId: bigint) => {
    try {
      await deleteJob.mutateAsync(jobId);
      toast.success("Job delete ho gaya");
    } catch {
      toast.error("Delete nahi hua");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="bg-primary px-4 pt-12 pb-6 rounded-b-[2rem]">
        <div className="flex items-center gap-3 mb-2">
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
            data-ocid="employer.back_button"
          >
            <ArrowLeft size={20} className="text-primary-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-primary-foreground font-bold text-xl">
              Employer Panel 💼
            </h1>
            <p className="text-primary-foreground/70 text-xs">
              Jobs post karo, workers dhundo
            </p>
          </div>
          <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">
            Basic Plan
          </span>
        </div>
      </div>

      <div className="flex-1 px-4 mt-4 pb-6">
        <Tabs defaultValue="post-jobs">
          <TabsList
            className="w-full rounded-2xl mb-4"
            data-ocid="employer.tabs"
          >
            <TabsTrigger
              value="post-jobs"
              className="flex-1"
              data-ocid="employer.post_jobs.tab"
            >
              Post Jobs
            </TabsTrigger>
            <TabsTrigger
              value="leads"
              className="flex-1"
              data-ocid="employer.leads.tab"
            >
              Leads 👥
            </TabsTrigger>
          </TabsList>

          {/* Post Jobs Tab */}
          <TabsContent value="post-jobs" className="space-y-4">
            {!showForm && (
              <Button
                className="w-full h-14 rounded-2xl text-base font-bold"
                onClick={() => setShowForm(true)}
                data-ocid="employer.post_job_button"
              >
                <Plus size={20} className="mr-2" />
                Nayi Job Post Karo
              </Button>
            )}

            {showForm && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-2xl shadow-card p-4 space-y-4"
                data-ocid="employer.post_job_modal"
              >
                <h2 className="font-bold text-foreground">
                  Job Ki Details Bharo
                </h2>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs font-semibold">Job Title *</Label>
                    <Input
                      placeholder="Jaise: Security Guard"
                      value={form.title}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, title: e.target.value }))
                      }
                      className="rounded-xl mt-1"
                      data-ocid="employer.title_input"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">
                      Company Name *
                    </Label>
                    <Input
                      placeholder="Tumhari company ka naam"
                      value={form.company}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, company: e.target.value }))
                      }
                      className="rounded-xl mt-1"
                      data-ocid="employer.company_input"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Location *</Label>
                    <Input
                      placeholder="Jaise: Mumbai, Maharashtra"
                      value={form.location}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, location: e.target.value }))
                      }
                      className="rounded-xl mt-1"
                      data-ocid="employer.location_input"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Salary *</Label>
                    <Input
                      placeholder="Jaise: ₹15,000/month"
                      value={form.salary}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, salary: e.target.value }))
                      }
                      className="rounded-xl mt-1"
                      data-ocid="employer.salary_input"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Category *</Label>
                    <Select
                      value={form.category}
                      onValueChange={(v) =>
                        setForm((f) => ({ ...f, category: v }))
                      }
                    >
                      <SelectTrigger
                        className="rounded-xl mt-1"
                        data-ocid="employer.category_select"
                      >
                        <SelectValue placeholder="Category chunao" />
                      </SelectTrigger>
                      <SelectContent>
                        {JOB_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.label} value={cat.label}>
                            {cat.emoji} {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Description</Label>
                    <Textarea
                      placeholder="Job ki details batao..."
                      value={form.description}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, description: e.target.value }))
                      }
                      className="rounded-xl mt-1 resize-none"
                      rows={3}
                      data-ocid="employer.description_textarea"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl"
                    onClick={() => setShowForm(false)}
                    data-ocid="employer.cancel_button"
                  >
                    Ruk Jao
                  </Button>
                  <Button
                    className="flex-1 rounded-xl font-bold"
                    onClick={handleSubmit}
                    disabled={createJob.isPending}
                    data-ocid="employer.submit_button"
                  >
                    {createJob.isPending ? (
                      <Loader2 size={16} className="mr-2 animate-spin" />
                    ) : null}
                    Post Karo
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Jobs List */}
            <div>
              <h2 className="font-bold text-foreground mb-3">
                Tumhari Posted Jobs
              </h2>
              {isLoading && (
                <div
                  className="text-center py-8"
                  data-ocid="employer.loading_state"
                >
                  <Loader2
                    className="mx-auto animate-spin text-primary"
                    size={28}
                  />
                </div>
              )}
              {!isLoading && (!jobs || jobs.length === 0) && (
                <div
                  className="text-center py-12 text-muted-foreground"
                  data-ocid="employer.empty_state"
                >
                  <Users size={40} className="mx-auto mb-3 opacity-40" />
                  <p className="font-semibold">Abhi tak koi job post nahi ki</p>
                  <p className="text-sm mt-1">Upar button se job post karo</p>
                </div>
              )}
              <div className="space-y-3" data-ocid="employer.jobs_list">
                {(jobs ?? []).map((job, i) => (
                  <div
                    key={job.id.toString()}
                    className="bg-card rounded-2xl shadow-card p-4 flex items-start gap-3"
                    data-ocid={`employer.job.item.${i + 1}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-foreground">
                        {job.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {job.company} · {job.location}
                      </p>
                      <p className="text-xs text-accent font-semibold mt-1">
                        {job.salary}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(job.id)}
                      className="w-8 h-8 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0"
                      disabled={deleteJob.isPending}
                      data-ocid={`employer.delete.${i + 1}_button`}
                    >
                      <Trash2 size={14} className="text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Leads Tab */}
          <TabsContent value="leads" className="space-y-4">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-bold text-foreground">Job Applicants</h2>
              <span className="text-xs bg-primary/10 text-primary font-semibold px-2 py-1 rounded-full">
                {FREE_LEADS_COUNT}/{SAMPLE_LEADS.length} visible
              </span>
            </div>

            <div className="space-y-3">
              {SAMPLE_LEADS.map((lead, i) => {
                const isBlurred = i >= FREE_LEADS_COUNT;
                return (
                  <div
                    key={lead.name}
                    className={`bg-card rounded-2xl p-4 border border-border relative overflow-hidden ${
                      isBlurred ? "select-none" : ""
                    }`}
                    data-ocid={`employer.leads.item.${i + 1}`}
                  >
                    <div
                      className={isBlurred ? "blur-sm pointer-events-none" : ""}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                            👤
                          </div>
                          <div>
                            <p className="font-bold text-sm text-foreground">
                              {lead.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {lead.role} · {lead.city}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                          {lead.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        📞 {isBlurred ? "98****XXXX" : lead.phone}
                      </p>
                    </div>
                    {isBlurred && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/50">
                        <Lock size={18} className="text-muted-foreground" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Upgrade Card */}
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4 text-center space-y-3">
              <p className="text-2xl">🔓</p>
              <p className="font-bold text-foreground text-sm">
                Upgrade to Paid Plan
              </p>
              <p className="text-xs text-muted-foreground">
                Saare applicants ke phone numbers aur details dekho. Apna
                business badao!
              </p>
              <Button
                className="w-full rounded-2xl font-bold bg-yellow-400 hover:bg-yellow-500 text-yellow-900"
                onClick={() => toast.info("Paid plan coming soon! 🚀")}
                data-ocid="employer.upgrade_button"
              >
                Upgrade Now 🔓
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
