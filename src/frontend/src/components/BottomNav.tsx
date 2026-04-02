import { BookOpen, Briefcase, Home, Plane, User } from "lucide-react";
import { motion } from "motion/react";

export type TabName = "home" | "jobs" | "learn" | "abroad" | "profile";

interface BottomNavProps {
  activeTab: TabName;
  onTabChange: (tab: TabName) => void;
}

const tabs = [
  { id: "home" as TabName, label: "Home", icon: Home },
  { id: "jobs" as TabName, label: "Naukri", icon: Briefcase },
  { id: "learn" as TabName, label: "Seekho", icon: BookOpen },
  { id: "abroad" as TabName, label: "Abroad", icon: Plane },
  { id: "profile" as TabName, label: "Profile", icon: User },
];

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav
      className="bottom-nav fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-card border-t border-border shadow-nav z-50"
      data-ocid="bottom_nav"
    >
      <div className="flex items-stretch h-[68px]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              type="button"
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors relative ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
              data-ocid={`nav_${tab.id}_link`}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-b-full"
                />
              )}
              <Icon
                size={22}
                strokeWidth={isActive ? 2.5 : 1.8}
                className={isActive ? "text-primary" : "text-muted-foreground"}
              />
              <span
                className={`text-[10px] font-semibold ${isActive ? "text-primary" : "text-muted-foreground"}`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
