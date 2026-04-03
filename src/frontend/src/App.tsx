import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/sonner";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import BottomNav, { type TabName } from "./components/BottomNav";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import AbroadScreen from "./pages/AbroadScreen";
import AdminApp from "./pages/AdminApp";
import EmployerDashboard from "./pages/EmployerDashboard";
import HomeScreen from "./pages/HomeScreen";
import JobDetailScreen from "./pages/JobDetailScreen";
import JobsScreen from "./pages/JobsScreen";
import LearnScreen from "./pages/LearnScreen";
import ProfileScreen from "./pages/ProfileScreen";
import ProfileSetupScreen from "./pages/ProfileSetupScreen";
import SplashScreen from "./pages/SplashScreen";
import {
  clearEmployeeSession,
  getEmployeeSession,
  saveEmployeeSession,
} from "./utils/employeeSession";
import {
  clearEmployerSession,
  getEmployerSession,
} from "./utils/employerSession";
import { getEmployeeProfile, saveEmployeeProfile } from "./utils/localDb";

type Screen =
  | { id: "splash" }
  | { id: "main"; tab: TabName }
  | { id: "job-detail"; jobId: bigint }
  | { id: "profile-setup" }
  | { id: "employer" }
  | { id: "location-select"; category: string; categoryEmoji: string };

// One-time name prompt modal
function NamePromptModal({
  phone,
  email,
  onSave,
}: { phone: string; email: string; onSave: (name: string) => void }) {
  const [name, setName] = useState("");

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Naam likhna zaroori hai");
      return;
    }
    onSave(trimmed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="text-center mb-5">
          <div className="text-4xl mb-3">👋</div>
          <h2 className="text-xl font-bold text-gray-900">Apna Naam Batao</h2>
          <p className="text-sm text-gray-500 mt-1">
            Yeh sirf ek baar poochha jayega. Iske baad app aapka naam yaad
            rakhega.
          </p>
        </div>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="name-prompt-input"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Aapka Poora Naam
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              id="name-prompt-input"
              placeholder="e.g. Ramesh Kumar"
              className="h-12 text-base rounded-xl"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              autoFocus
            />
          </div>
          <Button
            onClick={handleSubmit}
            className="w-full h-12 rounded-xl text-base font-bold"
          >
            Save Karo ✅
          </Button>
        </div>
        <p className="text-xs text-center text-gray-400 mt-3">
          {phone} • {email}
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const isAdminHash =
    typeof window !== "undefined" && window.location.hash === "#admin";

  // Check localStorage for an existing session immediately
  const initialScreen = (): Screen => {
    const empSession = getEmployeeSession();
    if (empSession) return { id: "main", tab: "home" };
    const erpSession = getEmployerSession();
    if (erpSession) return { id: "employer" };
    return { id: "splash" };
  };

  const [screen, setScreen] = useState<Screen>(initialScreen);
  // Controls whether the one-time name prompt is showing
  const [showNamePrompt, setShowNamePrompt] = useState(false);

  const { clear } = useInternetIdentity();

  // After employee session is active, check if they have a name in profile
  useEffect(() => {
    if (screen.id === "main") {
      const sess = getEmployeeSession();
      if (!sess) return;
      const profile = getEmployeeProfile(sess.phone);
      // Show prompt if no name saved in profile yet
      if (!profile?.name) {
        setShowNamePrompt(true);
      }
    }
  }, [screen.id]);

  // Protect employer dashboard: if no session, redirect to splash
  useEffect(() => {
    if (screen.id === "employer") {
      const session = getEmployerSession();
      if (!session) setScreen({ id: "splash" });
    }
  }, [screen.id]);

  const goToMain = (tab: TabName = "home") => setScreen({ id: "main", tab });
  const goToJob = (jobId: bigint) => setScreen({ id: "job-detail", jobId });

  const handleGetStarted = (mode: "employee" | "employer") => {
    if (mode === "employer") {
      setScreen({ id: "employer" });
    } else {
      goToMain("home");
    }
  };

  const handleLogout = async () => {
    clearEmployeeSession();
    clearEmployerSession();
    await clear();
    setShowNamePrompt(false);
    setScreen({ id: "splash" });
  };

  const handleNameSave = (name: string) => {
    const sess = getEmployeeSession();
    if (!sess) return;
    // Save to permanent profile store
    saveEmployeeProfile(sess.phone, name, sess.email);
    // Also update session so name is immediately available in ProfileScreen
    saveEmployeeSession(sess.phone, sess.email, name);
    setShowNamePrompt(false);
    toast.success(`Swagat hai, ${name}! 🎉`);
  };

  const activeTab = screen.id === "main" ? screen.tab : "home";
  const showBottomNav = screen.id === "main";

  if (isAdminHash) return <AdminApp />;

  // Get current employee session for name prompt
  const empSess = screen.id === "main" ? getEmployeeSession() : null;

  return (
    <div className="min-h-screen bg-muted">
      <div className="app-shell">
        <AnimatePresence mode="wait">
          {screen.id === "splash" && (
            <motion.div
              key="splash"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="content-area"
            >
              <SplashScreen onGetStarted={handleGetStarted} />
            </motion.div>
          )}

          {screen.id === "employer" && (
            <motion.div
              key="employer-dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="content-area"
            >
              <EmployerDashboard onLogout={handleLogout} />
            </motion.div>
          )}

          {screen.id === "main" && (
            <motion.div
              key={`main-${screen.tab}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="content-area"
            >
              {screen.tab === "home" && (
                <HomeScreen
                  onNavigate={(tab) => setScreen({ id: "main", tab })}
                  onJobClick={goToJob}
                  onCategoryClick={(category, categoryEmoji) =>
                    setScreen({
                      id: "location-select",
                      category,
                      categoryEmoji,
                    })
                  }
                />
              )}
              {screen.tab === "jobs" && <JobsScreen onJobClick={goToJob} />}
              {screen.tab === "learn" && <LearnScreen />}
              {screen.tab === "abroad" && <AbroadScreen />}
              {screen.tab === "profile" && (
                <ProfileScreen
                  onNavigate={(tab) => setScreen({ id: "main", tab })}
                  onSetupProfile={() => setScreen({ id: "profile-setup" })}
                  onEmployer={() => setScreen({ id: "employer" })}
                  onLogout={handleLogout}
                />
              )}
            </motion.div>
          )}

          {screen.id === "location-select" && (
            <motion.div
              key="location-select"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="content-area"
            >
              <JobsScreen
                onJobClick={goToJob}
                initialCategory={screen.category}
                onBack={() => goToMain("home")}
              />
            </motion.div>
          )}

          {screen.id === "job-detail" && (
            <motion.div
              key="job-detail"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="content-area"
            >
              <JobDetailScreen
                jobId={screen.jobId}
                onBack={() => setScreen({ id: "main", tab: "jobs" })}
                onLoginNeeded={() => setScreen({ id: "main", tab: "profile" })}
              />
            </motion.div>
          )}

          {screen.id === "profile-setup" && (
            <motion.div
              key="profile-setup"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="content-area"
            >
              <ProfileSetupScreen
                onComplete={() => goToMain("profile")}
                onBack={() => goToMain("profile")}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {showBottomNav && (
          <BottomNav
            activeTab={activeTab}
            onTabChange={(tab) => setScreen({ id: "main", tab })}
          />
        )}

        <Toaster position="top-center" richColors />
      </div>

      {/* One-time name prompt after employee login */}
      {showNamePrompt && empSess && (
        <NamePromptModal
          phone={empSess.phone}
          email={empSess.email}
          onSave={handleNameSave}
        />
      )}

      {/* Footer */}
      {screen.id === "main" && screen.tab === "home" && (
        <div className="max-w-[430px] mx-auto">
          <footer className="px-4 py-3 text-center pb-[80px]">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()}. Built with ❤️ using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                caffeine.ai
              </a>
            </p>
          </footer>
        </div>
      )}
    </div>
  );
}
