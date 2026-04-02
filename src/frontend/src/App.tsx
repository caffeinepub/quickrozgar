import { Toaster } from "@/components/ui/sonner";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
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
} from "./utils/employeeSession";
import {
  clearEmployerSession,
  getEmployerSession,
} from "./utils/employerSession";

type Screen =
  | { id: "splash" }
  | { id: "main"; tab: TabName }
  | { id: "job-detail"; jobId: bigint }
  | { id: "profile-setup" }
  | { id: "employer" }
  | { id: "location-select"; category: string; categoryEmoji: string };

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

  const { clear } = useInternetIdentity();

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
    setScreen({ id: "splash" });
  };

  const activeTab = screen.id === "main" ? screen.tab : "home";
  const showBottomNav = screen.id === "main";

  if (isAdminHash) return <AdminApp />;

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
