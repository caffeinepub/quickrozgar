import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getEmployeeSession } from "../utils/employeeSession";
import {
  getAllJobs as getLocalJobs,
  applyToJob as localApplyToJob,
} from "../utils/localDb";

interface JobsScreenProps {
  onJobClick: (jobId: bigint) => void;
  initialCategory?: string;
  onBack?: () => void;
}

const CATEGORIES = [
  { id: "waiter", label: "Waiter", emoji: "🍽️" },
  { id: "chef", label: "Chef", emoji: "👨‍🍳" },
  { id: "housekeeping", label: "Housekeeping", emoji: "🧹" },
  { id: "delivery", label: "Delivery Boy", emoji: "🛵" },
  { id: "callcentre", label: "Call Centre Jobs", emoji: "📞" },
  { id: "retail", label: "Retail Jobs", emoji: "🛍️" },
];

const LABEL_TO_ID: Record<string, string> = {
  Waiter: "waiter",
  Chef: "chef",
  Housekeeping: "housekeeping",
  "Delivery Boy": "delivery",
  Delivery: "delivery",
  "Call Centre Jobs": "callcentre",
  "Retail Jobs": "retail",
};

// Map category IDs to backend category strings
const ID_TO_CATEGORY: Record<string, string> = {
  waiter: "Waiter",
  chef: "Chef",
  housekeeping: "Housekeeping",
  delivery: "Delivery Boy",
  callcentre: "Call Centre Jobs",
  retail: "Retail Jobs",
};

const CITIES = [
  "Delhi",
  "Mumbai",
  "Bangalore",
  "Kolkata",
  "Chennai",
  "Hyderabad",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Surat",
  "Lucknow",
  "Noida",
  "Gurgaon",
  "Siliguri",
  "Gangtok",
  "Darjeeling",
];

const SALARY_BRACKET = "₹10,000 – ₹20,000/month";

const FALLBACK_JOBS: Record<string, { title: string; company: string }[]> = {
  waiter: [
    { title: "Restaurant Waiter", company: "Barbeque Nation" },
    { title: "Banquet Steward", company: "Taj Hotels" },
    { title: "F&B Service Staff", company: "ITC Hotels" },
    { title: "Dining Attendant", company: "Haldiram's" },
  ],
  chef: [
    { title: "Line Cook", company: "McDonald's India" },
    { title: "Sous Chef", company: "ITC Hotels" },
    { title: "Kitchen Staff", company: "Barbeque Nation" },
    { title: "Cook / Chef", company: "OYO Rooms" },
  ],
  housekeeping: [
    { title: "Room Attendant", company: "Marriott Hotels" },
    { title: "Housekeeping Supervisor", company: "OYO Rooms" },
    { title: "Laundry Staff", company: "Lemon Tree Hotels" },
    { title: "Floor Cleaner", company: "Phoenix Malls" },
  ],
  delivery: [
    { title: "Delivery Executive", company: "Zomato" },
    { title: "Last Mile Rider", company: "Swiggy" },
    { title: "Courier Partner", company: "Delhivery" },
    { title: "Delivery Associate", company: "Amazon Flex" },
  ],
  callcentre: [
    { title: "Customer Support Executive", company: "Concentrix" },
    { title: "BPO Agent", company: "Wipro BPS" },
    { title: "Call Centre Associate", company: "Teleperformance" },
    { title: "Inbound Support Staff", company: "iEnergizer" },
  ],
  retail: [
    { title: "Sales Associate", company: "Reliance Smart" },
    { title: "Store Executive", company: "D-Mart" },
    { title: "Cashier / Billing Staff", company: "Big Bazaar" },
    { title: "Floor Staff", company: "Shoppers Stop" },
  ],
};

type Step = "categories" | "location" | "listings";

interface ApplyFormState {
  name: string;
  phone: string;
  experience: string;
}

type DisplayJob = {
  title: string;
  company: string;
  localId?: string;
};

export default function JobsScreen({
  onJobClick: _onJobClick,
  initialCategory,
  onBack,
}: JobsScreenProps) {
  const [step, setStep] = useState<Step>("categories");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [citySearch, setCitySearch] = useState("");
  const [applyJob, setApplyJob] = useState<DisplayJob | null>(null);
  const [form, setForm] = useState<ApplyFormState>({
    name: "",
    phone: "",
    experience: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const [localJobs, setLocalJobs] = useState(() => getLocalJobs());
  useEffect(() => {
    if (step === "listings") setLocalJobs(getLocalJobs());
  }, [step]);

  // Handle initialCategory: jump straight to location step
  useEffect(() => {
    if (initialCategory) {
      const catId =
        LABEL_TO_ID[initialCategory] ?? initialCategory.toLowerCase();
      setSelectedCategory(catId);
      setStep("location");
    }
  }, [initialCategory]);

  const categoryObj = CATEGORIES.find((c) => c.id === selectedCategory);
  const filteredCities = CITIES.filter((c) =>
    c.toLowerCase().includes(citySearch.toLowerCase()),
  );

  // Build job listings: prefer backend jobs, fall back to sample data
  const jobListings: DisplayJob[] = (() => {
    if (!selectedCategory) return [];
    const catLabel = ID_TO_CATEGORY[selectedCategory] ?? selectedCategory;
    const cityFilter = selectedCity?.toLowerCase() ?? "";
    const matched = localJobs.filter(
      (j) =>
        j.category.toLowerCase() === catLabel.toLowerCase() &&
        (cityFilter === "" || j.location.toLowerCase().includes(cityFilter)),
    );
    if (matched.length > 0) {
      return matched.map((j) => ({
        title: j.title,
        company: j.company,
        localId: j.id,
      }));
    }
    // Fallback to sample data
    return FALLBACK_JOBS[selectedCategory] ?? [];
  })();

  function handleCategoryClick(catId: string) {
    setSelectedCategory(catId);
    setCitySearch("");
    setStep("location");
  }

  function handleCityClick(city: string) {
    setSelectedCity(city);
    setStep("listings");
  }

  function handleBackToCategories() {
    if (initialCategory && onBack) {
      onBack();
      return;
    }
    setStep("categories");
    setSelectedCategory(null);
    setSelectedCity(null);
    setCitySearch("");
  }

  function handleBackToLocation() {
    setStep("location");
    setSelectedCity(null);
    setCitySearch("");
  }

  function handleApplyClick(job: DisplayJob) {
    if (job.localId !== undefined) {
      // Local DB job — apply directly without form
      const session = getEmployeeSession();
      if (!session) {
        toast.error("Pehle login karo");
        return;
      }
      const result = localApplyToJob(
        job.localId,
        session.phone,
        session.name,
        session.email,
      );
      if (result.alreadyApplied) {
        toast.error("Aap pehle se apply kar chuke hain!");
      } else if (result.success) {
        toast.success("Application Bhej Di! 🎉");
      } else {
        toast.error("Apply nahi hua. Dobara try karo.");
      }
      return;
    }
    // Sample data job — show form dialog
    setApplyJob(job);
    setForm({ name: "", phone: "", experience: "" });
    setSubmitted(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  const pageVariants = {
    initial: { opacity: 0, x: 24 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -24 },
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {step === "categories" && (
          <motion.div
            key="categories"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.22 }}
            className="flex flex-col flex-1"
          >
            {/* Header */}
            <div className="bg-card px-4 pt-12 pb-5 border-b border-border">
              <h1 className="text-2xl font-bold text-foreground">
                Naukri Dhundo 💼
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Job category chunein
              </p>
            </div>

            {/* Category Cards */}
            <div className="p-4 grid grid-cols-2 gap-3">
              {CATEGORIES.map((cat, i) => (
                <motion.button
                  key={cat.id}
                  type="button"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  onClick={() => handleCategoryClick(cat.id)}
                  className="bg-card rounded-2xl p-5 shadow-sm border border-border flex flex-col items-center gap-3 active:scale-95 transition-transform text-center"
                  data-ocid={`jobs.${cat.id}.button`}
                >
                  <span className="text-4xl">{cat.emoji}</span>
                  <span className="font-bold text-foreground text-sm">
                    {cat.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {step === "location" && categoryObj && (
          <motion.div
            key="location"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.22 }}
            className="flex flex-col flex-1"
          >
            {/* Header */}
            <div className="bg-card px-4 pt-12 pb-4 border-b border-border">
              <button
                type="button"
                onClick={handleBackToCategories}
                className="text-primary text-sm font-semibold mb-3 flex items-center gap-1"
                data-ocid="jobs.location.back_button"
              >
                ← Wapas
              </button>
              <h1 className="text-xl font-bold text-foreground">
                {categoryObj.emoji} {categoryObj.label} — Sheher Chunein
              </h1>
              <div className="mt-3">
                <Input
                  placeholder="Sheher ka naam likho..."
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  className="rounded-xl h-11 bg-muted border-0"
                  data-ocid="jobs.city.search_input"
                />
              </div>
            </div>

            {/* City List */}
            <div className="flex-1 px-4 py-3 space-y-2">
              {filteredCities.length === 0 && (
                <p
                  className="text-muted-foreground text-sm text-center py-8"
                  data-ocid="jobs.city.empty_state"
                >
                  Koi sheher nahi mila 😕
                </p>
              )}
              {filteredCities.map((city, i) => (
                <motion.button
                  key={city}
                  type="button"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => handleCityClick(city)}
                  className="w-full text-left bg-card rounded-xl px-4 py-3 border border-border font-medium text-foreground text-sm active:bg-muted transition-colors flex items-center justify-between"
                  data-ocid={`jobs.city.item.${i + 1}`}
                >
                  <span>📍 {city}</span>
                  <span className="text-muted-foreground">→</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {step === "listings" && categoryObj && selectedCity && (
          <motion.div
            key="listings"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.22 }}
            className="flex flex-col flex-1"
          >
            {/* Header */}
            <div className="bg-card px-4 pt-12 pb-4 border-b border-border">
              <button
                type="button"
                onClick={handleBackToLocation}
                className="text-primary text-sm font-semibold mb-3 flex items-center gap-1"
                data-ocid="jobs.listings.back_button"
              >
                ← Wapas
              </button>
              <h1 className="text-xl font-bold text-foreground">
                {categoryObj.emoji} {categoryObj.label} — {selectedCity}
              </h1>
              <p className="text-muted-foreground text-xs mt-1">
                {jobListings.length} naukri mili
              </p>
            </div>

            {/* Job Cards */}
            <div className="flex-1 px-4 py-4 space-y-3 pb-8">
              {jobListings.map((job, i) => (
                <motion.div
                  key={`${job.company}-${job.title}-${i}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="bg-card rounded-2xl p-4 border border-border shadow-sm"
                  data-ocid={`jobs.item.${i + 1}`}
                >
                  {/* Company Name — TOP, bold and prominent */}
                  <p className="font-bold text-foreground text-base leading-tight">
                    {job.company}
                  </p>

                  {/* Salary Bracket — just below company name */}
                  <p className="text-green-600 font-semibold text-sm mt-1">
                    💰 {SALARY_BRACKET}
                  </p>

                  {/* Job Title */}
                  <p className="text-muted-foreground text-sm mt-2 font-medium">
                    {categoryObj.emoji} {job.title}
                  </p>

                  {/* Location */}
                  <p className="text-muted-foreground text-xs mt-1">
                    📍 {selectedCity}
                  </p>

                  {/* Apply Now Button */}
                  <Button
                    size="sm"
                    className="mt-3 w-full rounded-xl font-bold text-xs"
                    onClick={() => handleApplyClick(job)}
                    disabled={false}
                    data-ocid={`jobs.apply.${i + 1}_button`}
                  >
                    Apply Now
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Apply Dialog — only for sample/fallback jobs */}
      <Dialog
        open={!!applyJob}
        onOpenChange={(open) => !open && setApplyJob(null)}
      >
        <DialogContent
          className="rounded-2xl mx-4 max-w-sm"
          data-ocid="jobs.apply.dialog"
        >
          <DialogHeader>
            <DialogTitle>Apply Karo 📝</DialogTitle>
          </DialogHeader>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
              data-ocid="jobs.apply.success_state"
            >
              <p className="text-4xl mb-3">🎉</p>
              <p className="font-bold text-foreground text-lg">
                Application Bhej Di!
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                Company jaldi sampark karegi.
              </p>
              <Button
                className="mt-5 w-full rounded-xl"
                onClick={() => setApplyJob(null)}
                data-ocid="jobs.apply.close_button"
              >
                Theek Hai
              </Button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="apply-name">Naam</Label>
                <Input
                  id="apply-name"
                  placeholder="Aapka naam"
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  required
                  className="rounded-xl"
                  data-ocid="jobs.apply.name_input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="apply-phone">Phone Number</Label>
                <Input
                  id="apply-phone"
                  type="tel"
                  placeholder="10-digit number"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, phone: e.target.value }))
                  }
                  required
                  className="rounded-xl"
                  data-ocid="jobs.apply.phone_input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="apply-exp">Experience</Label>
                <Input
                  id="apply-exp"
                  placeholder="e.g. 2 saal"
                  value={form.experience}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, experience: e.target.value }))
                  }
                  required
                  className="rounded-xl"
                  data-ocid="jobs.apply.experience_input"
                />
              </div>
              <Button
                type="submit"
                className="w-full rounded-xl font-bold"
                data-ocid="jobs.apply.submit_button"
              >
                Send Karo
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
