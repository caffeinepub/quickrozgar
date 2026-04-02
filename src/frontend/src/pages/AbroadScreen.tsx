import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, Globe, MapPin } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { ABROAD_JOBS } from "../data/sampleData";

function getAppliedAbroad(): string[] {
  try {
    return JSON.parse(localStorage.getItem("appliedAbroadJobs") ?? "[]");
  } catch {
    return [];
  }
}

function saveAppliedAbroad(ids: string[]) {
  localStorage.setItem("appliedAbroadJobs", JSON.stringify(ids));
}

const COUNTRY_FILTERS = [
  "All",
  "UAE",
  "Qatar",
  "Saudi Arabia",
  "Singapore",
  "Malaysia",
];
const CATEGORY_FILTERS = [
  "All",
  "Security",
  "Construction",
  "Hotel",
  "Driver",
  "Cleaner",
];
const SALARY_FILTERS = ["All", "Under ₹15k", "₹15k–₹25k", "Above ₹25k"];

const COUNTRY_MAP: Record<string, string> = {
  UAE: "UAE",
  Qatar: "Qatar",
  "Saudi Arabia": "Saudi Arabia",
  Singapore: "Singapore",
  Malaysia: "Malaysia",
};

export default function AbroadScreen() {
  const [countryFilter, setCountryFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [salaryFilter, setSalaryFilter] = useState("All");
  const [appliedIds, setAppliedIds] = useState<string[]>(getAppliedAbroad);

  const handleApply = (jobId: number, company: string) => {
    const id = String(jobId);
    const updated = [...appliedIds, id];
    saveAppliedAbroad(updated);
    setAppliedIds(updated);
    toast.success(`${company} mein application bhej di! ✅`);
  };

  const filteredJobs = ABROAD_JOBS.filter((job) => {
    if (countryFilter !== "All") {
      const matchCountry = Object.entries(COUNTRY_MAP).some(
        ([key]) => countryFilter === key && job.country.includes(key),
      );
      if (!matchCountry) return false;
    }
    if (categoryFilter !== "All" && job.category !== categoryFilter)
      return false;
    // All jobs have ₹10k–₹20k so Under ₹15k and ₹15k–₹25k both match; Above ₹25k won't
    if (salaryFilter === "Above ₹25k") return false;
    return true;
  });

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-primary px-4 pt-12 pb-6 rounded-b-[2rem]">
        <div className="flex items-center gap-2 mb-1">
          <Globe size={20} className="text-white" />
          <h1 className="text-white font-bold text-xl">Abroad Jobs ✈️</h1>
        </div>
        <p className="text-white/80 text-sm mb-4">
          Videsh mein kaam karo, zyada kamao
        </p>

        {/* Country filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {COUNTRY_FILTERS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCountryFilter(c)}
              className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                countryFilter === c
                  ? "bg-white text-indigo-700"
                  : "bg-white/15 text-white"
              }`}
              data-ocid={`abroad.country_filter.${c.toLowerCase().replace(/\s+/g, "_")}_button`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Category + Salary filters */}
      <div className="px-4 mt-3 space-y-2">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORY_FILTERS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategoryFilter(c)}
              className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                categoryFilter === c
                  ? "bg-primary text-white border-primary"
                  : "bg-card text-muted-foreground border-border"
              }`}
              data-ocid={`abroad.category_filter.${c.toLowerCase()}_button`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {SALARY_FILTERS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSalaryFilter(s)}
              className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                salaryFilter === s
                  ? "bg-amber-500 text-white border-amber-500"
                  : "bg-card text-muted-foreground border-border"
              }`}
              data-ocid={`abroad.salary_filter.${s.toLowerCase().replace(/[₹\s–]+/g, "_")}_button`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Info Banner */}
      <div className="px-4 mt-3">
        <div className="bg-accent/10 rounded-2xl p-3 flex items-center gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <p className="text-sm font-bold text-foreground">
              Free Document Help
            </p>
            <p className="text-xs text-muted-foreground">
              Passport, visa aur documents mein help milegi
            </p>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="flex-1 px-4 mt-4 space-y-3 pb-6">
        <h2 className="font-bold text-foreground">
          {filteredJobs.length === 0
            ? "Koi job nahi mila"
            : "International Jobs"}
        </h2>

        {filteredJobs.length === 0 && (
          <div
            className="text-center text-muted-foreground text-sm py-12"
            data-ocid="abroad.jobs.empty_state"
          >
            <p className="text-3xl mb-3">🔍</p>
            <p>Is filter mein koi job nahi hai.</p>
            <p className="text-xs mt-1">Filters change karo.</p>
          </div>
        )}

        {filteredJobs.map((job, i) => {
          const isApplied = appliedIds.includes(String(job.id));
          return (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-card rounded-2xl shadow-card p-4"
              data-ocid={`abroad.job.item.${i + 1}`}
            >
              {/* Company name - TOP, bold prominent */}
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-lg">{job.flag}</span>
                <p className="font-bold text-base text-foreground">
                  {job.company}
                </p>
                <Badge
                  variant="outline"
                  className="ml-auto text-[10px] rounded-lg border-indigo-200 text-indigo-600"
                >
                  {job.category}
                </Badge>
              </div>

              {/* Salary INR - just below company */}
              <p className="text-amber-600 font-semibold text-sm mb-2">
                {job.salaryINR}
              </p>

              {/* Job title */}
              <p className="text-sm text-foreground mb-1 font-medium">
                {job.title}
              </p>

              {/* Country */}
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                <MapPin size={11} />
                <span>{job.country}</span>
              </div>

              {/* Processing fee */}
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
                <CreditCard size={11} />
                <span>{job.processingFee}</span>
              </div>

              {/* Apply button */}
              {isApplied ? (
                <div className="w-full text-center bg-green-50 text-green-700 border border-green-200 rounded-xl py-2 text-sm font-semibold">
                  Applied ✓
                </div>
              ) : (
                <Button
                  className="w-full rounded-xl font-bold"
                  onClick={() => handleApply(job.id, job.company)}
                  data-ocid={`abroad.apply.${i + 1}_button`}
                >
                  Apply Now
                </Button>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
