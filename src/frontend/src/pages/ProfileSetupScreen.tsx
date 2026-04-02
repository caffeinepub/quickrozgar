import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useSaveWorkerProfile } from "../hooks/useQueries";

const SKILLS = [
  "Security Guard",
  "Driver",
  "Delivery",
  "Cook",
  "Electrician",
  "Plumber",
  "Helper",
  "Cleaner",
  "Carpenter",
  "Painter",
  "Mason",
  "Gardener",
  "Welder",
  "AC Technician",
  "Barber",
];

const CITIES = [
  "Delhi",
  "Mumbai",
  "Bangalore",
  "Pune",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Jaipur",
  "Ahmedabad",
  "Surat",
];

interface ProfileSetupProps {
  onComplete: () => void;
  onBack: () => void;
}

export default function ProfileSetupScreen({
  onComplete,
  onBack,
}: ProfileSetupProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [city, setCity] = useState("");
  const [experience, setExperience] = useState("0");
  const saveProfile = useSaveWorkerProfile();
  const { identity } = useInternetIdentity();

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill],
    );
  };

  const handleNext = () => {
    if (step < totalSteps) setStep((s) => s + 1);
  };

  const handleFinish = async () => {
    try {
      await saveProfile.mutateAsync({
        name,
        skills: selectedSkills,
        location: city,
        experience: BigInt(Number.parseInt(experience) || 0),
      });
      toast.success("Profile save ho gaya! 🎉");
      onComplete();
    } catch {
      toast.error("Profile save nahi hua. Dubara try karo.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="bg-card px-4 pt-12 pb-4 border-b border-border">
        <div className="flex items-center gap-3 mb-4">
          <button
            type="button"
            onClick={onBack}
            data-ocid="profile_setup.back_button"
          >
            <ArrowLeft size={22} className="text-foreground" />
          </button>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground font-medium">
              Step {step} of {totalSteps}
            </p>
            <div className="h-2 bg-muted rounded-full mt-1">
              <motion.div
                className="h-full bg-primary rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 py-6">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  Apna Naam Batao 👋
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Tumhara profile shuru karte hain
                </p>
              </div>
              <div className="flex flex-col items-center gap-4">
                <button
                  type="button"
                  className="w-24 h-24 rounded-full bg-muted border-2 border-dashed border-border flex flex-col items-center justify-center gap-1"
                  data-ocid="profile_setup.photo_upload_button"
                >
                  <Camera size={28} className="text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground font-medium">
                    Photo Upload
                  </span>
                </button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold">
                  Pura Naam
                </Label>
                <Input
                  id="name"
                  placeholder="Jaise: Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 rounded-xl text-base"
                  data-ocid="profile_setup.name_input"
                />
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="space-y-4"
            >
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  Kaunsa Kaam Jaante Ho? 🔧
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Ek ya zyada select karo
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {SKILLS.map((skill) => (
                  <button
                    type="button"
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                      selectedSkills.includes(skill)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                    data-ocid={`profile_setup.skill_${skill.toLowerCase().replace(/ /g, "_")}_toggle`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="space-y-4"
            >
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  Kahan Rehte Ho? 📍
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Aas-paas ki naukri dikhayenge
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {CITIES.map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setCity(c)}
                    className={`py-3 px-4 rounded-2xl text-sm font-semibold transition-colors ${
                      city === c
                        ? "bg-primary text-primary-foreground"
                        : "bg-card shadow-card text-foreground"
                    }`}
                    data-ocid={`profile_setup.city_${c.toLowerCase()}_button`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  Kitna Kaam Ka Anubhav Hai? 💪
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Saal mein batao
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {["0", "1", "2", "3", "4", "5+"].map((yr) => (
                  <button
                    type="button"
                    key={yr}
                    onClick={() => setExperience(yr === "5+" ? "5" : yr)}
                    className={`py-4 rounded-2xl text-center transition-colors ${
                      experience === (yr === "5+" ? "5" : yr)
                        ? "bg-primary text-primary-foreground"
                        : "bg-card shadow-card text-foreground"
                    }`}
                    data-ocid={`profile_setup.exp_${yr}_button`}
                  >
                    <p className="text-2xl font-bold">{yr}</p>
                    <p className="text-xs mt-0.5">saal</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center pt-8 space-y-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center"
              >
                <CheckCircle2 size={48} className="text-success" />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  Bilkul Tayyar! 🎉
                </h2>
                <p className="text-muted-foreground text-sm mt-2">
                  Tumhara profile ready hai. Ab naukri dhundo!
                </p>
              </div>
              <div className="w-full bg-muted rounded-2xl p-4 space-y-2 text-left">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Naam:</span>
                  <span className="font-semibold">{name || "(blank)"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Skills:</span>
                  <span className="font-semibold">
                    {selectedSkills.slice(0, 2).join(", ") || "(none)"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">City:</span>
                  <span className="font-semibold">{city || "(blank)"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Experience:</span>
                  <span className="font-semibold">{experience} saal</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CTA */}
      <div className="px-4 pb-8 pt-3">
        {step < totalSteps ? (
          <Button
            className="w-full h-14 rounded-2xl text-base font-bold"
            onClick={handleNext}
            data-ocid="profile_setup.next_button"
          >
            Aage Jao <ArrowRight size={18} className="ml-2" />
          </Button>
        ) : (
          <Button
            className="w-full h-14 rounded-2xl text-base font-bold bg-success hover:bg-success/90 text-success-foreground"
            onClick={handleFinish}
            disabled={saveProfile.isPending || !identity}
            data-ocid="profile_setup.submit_button"
          >
            {saveProfile.isPending ? (
              <>
                <Loader2 size={18} className="mr-2 animate-spin" />
                Save ho raha hai...
              </>
            ) : (
              "Profile Save Karo 🚀"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
