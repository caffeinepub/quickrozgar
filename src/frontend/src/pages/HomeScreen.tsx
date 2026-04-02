import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { MapPin } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import type { TabName } from "../components/BottomNav";

interface HomeScreenProps {
  onNavigate: (tab: TabName) => void;
  onJobClick: (jobId: bigint) => void;
  onCategoryClick: (category: string, emoji: string) => void;
}

const MAIN_ACTIONS = [
  { label: "Find a Job", emoji: "🔍", tab: "jobs" as TabName },
  { label: "Learn Skills", emoji: "📚", tab: "learn" as TabName },
  { label: "Work Abroad", emoji: "✈️", tab: "abroad" as TabName },
];

const JOB_CATEGORIES = [
  { label: "Waiter", emoji: "🍽️" },
  { label: "Chef", emoji: "👨‍🍳" },
  { label: "Housekeeping", emoji: "🧹" },
  { label: "Delivery Boy", emoji: "🛵" },
  { label: "Call Centre Jobs", emoji: "📞" },
  { label: "Retail Jobs", emoji: "🛍️" },
];

const LOCATIONS = ["Siliguri", "Gangtok", "Darjeeling"];

const SUCCESS_STORIES = [
  {
    name: "Rahul Sharma",
    role: "Waiter at Hotel Sinclairs",
    feedback: "QuickRozgar se 2 din mein naukri mili! Bahut aasan tha.",
    city: "Siliguri",
  },
  {
    name: "Priya Devi",
    role: "Housekeeping at Mayfair Hotels",
    feedback: "Pehli baar job dhundh rahi thi, itna easy process tha!",
    city: "Gangtok",
  },
  {
    name: "Arjun Tamang",
    role: "Delivery at Swiggy",
    feedback: "Form bhara aur usi din call aaya. Highly recommend!",
    city: "Darjeeling",
  },
  {
    name: "Meena Rai",
    role: "Call Centre Agent",
    feedback: "Entry level ke liye perfect platform. Thank you!",
    city: "Siliguri",
  },
];

export default function HomeScreen({
  onNavigate,
  onCategoryClick,
}: HomeScreenProps) {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();

  useEffect(() => {
    if (!carouselApi) return;
    const interval = setInterval(() => {
      carouselApi.scrollNext();
    }, 3000);
    return () => clearInterval(interval);
  }, [carouselApi]);

  return (
    <div className="flex flex-col min-h-screen bg-background pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-primary px-5 pt-14 pb-8 rounded-b-3xl"
      >
        <h1 className="text-white text-2xl font-bold leading-snug">
          Find Jobs. Learn Skills.
          <br />
          Grow Career.
        </h1>
        <p className="text-white/70 text-sm mt-1">
          QuickRozgar — Apka Career Partner
        </p>
      </motion.div>

      <div className="px-4 mt-6 space-y-7">
        {/* Main Action Buttons */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <div className="grid grid-cols-3 gap-3">
            {MAIN_ACTIONS.map((action) => (
              <button
                key={action.tab}
                type="button"
                onClick={() => onNavigate(action.tab)}
                className="flex flex-col items-center gap-2 p-4 bg-card rounded-2xl shadow-card border border-border active:scale-95 transition-transform"
                data-ocid={`home.${action.tab}_button`}
              >
                <span className="text-3xl">{action.emoji}</span>
                <span className="text-xs font-semibold text-foreground text-center leading-tight">
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </motion.section>

        {/* Job Categories */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <h2 className="text-base font-bold text-foreground mb-3">
            Job Categories
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {JOB_CATEGORIES.map((cat) => (
              <button
                key={cat.label}
                type="button"
                onClick={() => onCategoryClick(cat.label, cat.emoji)}
                className="flex items-center gap-3 p-3 bg-card rounded-2xl shadow-card border border-border active:scale-95 transition-transform text-left"
                data-ocid="home.category.button"
              >
                <span className="text-2xl">{cat.emoji}</span>
                <span className="text-xs font-semibold text-foreground/80 leading-tight">
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </motion.section>

        {/* Popular Locations */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <h2 className="text-base font-bold text-foreground mb-3">
            Popular Locations
          </h2>
          <div className="flex flex-wrap gap-2">
            {LOCATIONS.map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => onNavigate("jobs")}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold active:scale-95 transition-transform"
                data-ocid="home.location.button"
              >
                <MapPin size={13} />
                {loc}
              </button>
            ))}
          </div>
        </motion.section>

        {/* Success Stories */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="pb-4"
        >
          <h2 className="text-base font-bold text-foreground mb-3">
            Success Stories ⭐
          </h2>
          <Carousel
            setApi={setCarouselApi}
            opts={{ loop: true }}
            className="w-full"
          >
            <CarouselContent>
              {SUCCESS_STORIES.map((story) => (
                <CarouselItem key={story.name}>
                  <div className="bg-card rounded-2xl border border-border shadow-sm p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                        🙂
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-sm">
                          {story.name}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {story.role}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-foreground/80 italic">
                      "{story.feedback}"
                    </p>
                    <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                      <MapPin size={10} />
                      {story.city}
                    </span>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </motion.section>
      </div>
    </div>
  );
}
