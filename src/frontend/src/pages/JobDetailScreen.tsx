import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Bookmark,
  Briefcase,
  CheckCircle2,
  Clock,
  MapPin,
  Share2,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { JOB_CATEGORIES, SAMPLE_JOBS } from "../data/sampleData";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useApplyToJob } from "../hooks/useQueries";

interface JobDetailScreenProps {
  jobId: bigint;
  onBack: () => void;
  onLoginNeeded: () => void;
}

export default function JobDetailScreen({
  jobId,
  onBack,
  onLoginNeeded,
}: JobDetailScreenProps) {
  const { identity } = useInternetIdentity();
  const applyMutation = useApplyToJob();

  const job = SAMPLE_JOBS.find((j) => j.id === jobId) ?? null;

  if (!job) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Job nahi mili 😕</p>
      </div>
    );
  }

  const catInfo = JOB_CATEGORIES.find((c) => c.label === job.category);

  const handleApply = async () => {
    if (!identity) {
      onLoginNeeded();
      return;
    }
    try {
      await applyMutation.mutateAsync(job.id);
      toast.success("Apply ho gaya! Employer jald contact karega. ✅");
    } catch {
      toast.error("Kuch gadbad ho gayi. Dubara try karo.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col min-h-screen"
    >
      {/* Header */}
      <div className="bg-primary px-4 pt-12 pb-20 relative">
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
            data-ocid="job_detail.back_button"
          >
            <ArrowLeft size={20} className="text-primary-foreground" />
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
              data-ocid="job_detail.save_button"
            >
              <Bookmark size={18} className="text-primary-foreground" />
            </button>
            <button
              type="button"
              className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
              data-ocid="job_detail.share_button"
            >
              <Share2 size={18} className="text-primary-foreground" />
            </button>
          </div>
        </div>
        <h1 className="text-primary-foreground font-bold text-2xl">
          {job.title}
        </h1>
        <p className="text-primary-foreground/80 text-sm mt-1">{job.company}</p>
      </div>

      {/* Card floating over header */}
      <div className="px-4 -mt-12 mb-4">
        <div className="bg-card rounded-2xl shadow-card-hover p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl">
              {catInfo?.emoji ?? "💼"}
            </div>
            <div>
              <Badge className="bg-primary/10 text-primary text-xs">
                {job.category}
              </Badge>
              <p className="text-accent font-bold text-xl mt-1">{job.salary}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin size={13} className="text-accent" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Briefcase size={13} className="text-accent" />
              <span>Full Time</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock size={13} className="text-accent" />
              <span>8 Ghante / Din</span>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 px-4 space-y-5">
        {/* Description */}
        <section>
          <h2 className="font-bold text-foreground mb-2">Job Ki Jaankari</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {job.description}
          </p>
        </section>

        <Separator />

        {/* Requirements */}
        <section>
          <h2 className="font-bold text-foreground mb-3">Zaruriyaat</h2>
          <div className="space-y-2">
            {[
              "10th Pass ya zyada",
              "Hindi / English bolna aana chahiye",
              "Physical fitness good honi chahiye",
              "Fresher bhi apply kar sakte hain",
            ].map((req) => (
              <div
                key={req}
                className="flex items-center gap-2 text-sm text-foreground"
              >
                <CheckCircle2 size={15} className="text-success shrink-0" />
                <span>{req}</span>
              </div>
            ))}
          </div>
        </section>

        <Separator />

        {/* Map placeholder */}
        <section>
          <h2 className="font-bold text-foreground mb-2">Location 📍</h2>
          <div className="h-36 rounded-2xl bg-muted flex items-center justify-center border border-border">
            <div className="text-center">
              <MapPin size={32} className="text-primary mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground">
                {job.location}
              </p>
              <p className="text-xs text-muted-foreground">Map yahan dikhega</p>
            </div>
          </div>
        </section>

        {/* Company */}
        <section>
          <h2 className="font-bold text-foreground mb-3">
            Company Ke Baare Mein
          </h2>
          <div className="bg-muted rounded-2xl p-4">
            <p className="font-bold text-sm text-foreground">{job.company}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Ye ek trusted employer hai QuickRozgar par. ✅
            </p>
          </div>
        </section>
      </div>

      {/* CTA */}
      <div className="sticky bottom-[68px] bg-card border-t border-border px-4 py-3 mt-4">
        <Button
          className="w-full h-14 rounded-2xl text-base font-bold bg-accent hover:bg-accent/90 text-white"
          onClick={handleApply}
          disabled={applyMutation.isPending}
          data-ocid="job_detail.apply_button"
        >
          {applyMutation.isPending
            ? "Apply ho raha hai..."
            : "Abhi Apply Karo 🚀"}
        </Button>
      </div>
    </motion.div>
  );
}
