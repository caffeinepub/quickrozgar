import { Badge } from "@/components/ui/badge";
import {
  Award,
  CheckCircle,
  ChevronRight,
  Clock,
  PlayCircle,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { HUNAR_PROGRAM, SAMPLE_COURSES } from "../data/sampleData";
import { useGetAllCourses } from "../hooks/useQueries";

function getEnrolledPrograms(): string[] {
  try {
    return JSON.parse(localStorage.getItem("enrolledPrograms") ?? "[]");
  } catch {
    return [];
  }
}

function setEnrolledPrograms(ids: string[]) {
  localStorage.setItem("enrolledPrograms", JSON.stringify(ids));
}

export default function LearnScreen() {
  const { data: backendCourses } = useGetAllCourses();
  const [playingId, setPlayingId] = useState<bigint | null>(null);
  const [enrolled, setEnrolled] = useState<string[]>(getEnrolledPrograms);

  const allCourses = [
    ...SAMPLE_COURSES,
    ...(backendCourses ?? [])
      .filter((bc) => !SAMPLE_COURSES.some((sc) => sc.id === bc.id))
      .map((bc) => ({
        ...bc,
        duration: "N/A",
        badge: "New",
        emoji: "\uD83D\uDCD6",
      })),
  ];

  const isEnrolled = enrolled.includes(HUNAR_PROGRAM.id);

  const handleEnroll = () => {
    const updated = [...enrolled, HUNAR_PROGRAM.id];
    setEnrolledPrograms(updated);
    setEnrolled(updated);
    toast.success("Program mein enroll ho gaye! 🎉");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="bg-gradient-to-br from-primary to-blue-700 px-4 pt-12 pb-8 rounded-b-[2rem]">
        <h1 className="text-primary-foreground font-bold text-xl mb-1">
          Seekho aur Kamao 📚
        </h1>
        <p className="text-primary-foreground/80 text-sm">
          Free courses, real certificates
        </p>
        <div className="mt-4 bg-white/10 rounded-2xl p-4 flex items-center gap-4">
          <span className="text-3xl">🏆</span>
          <div>
            <p className="text-white font-bold text-sm">
              Tumne 0 courses complete kiye
            </p>
            <p className="text-white/70 text-xs mt-0.5">
              Pehla course shuru karo aaj!
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 mt-4 space-y-4 pb-6">
        {/* Featured Program: Hunar ki Udaan */}
        <div>
          <h2 className="font-bold text-foreground mb-3">Featured Program</h2>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl overflow-hidden shadow-lg"
            data-ocid="learn.hunar_program.card"
          >
            <div className="p-5">
              {/* Top row */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <span className="text-5xl">{HUNAR_PROGRAM.emoji}</span>
                <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                  {HUNAR_PROGRAM.badge}
                </span>
              </div>

              <h3 className="text-white font-bold text-lg leading-tight">
                {HUNAR_PROGRAM.title}
              </h3>
              <p className="text-white/80 text-xs font-medium mb-3">
                by {HUNAR_PROGRAM.partner}
              </p>

              <p className="text-white/90 text-xs leading-relaxed mb-4">
                {HUNAR_PROGRAM.description}
              </p>

              {/* Info rows */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <Clock size={13} className="text-white/80 shrink-0" />
                  <span className="text-white/90 text-xs">
                    Duration: {HUNAR_PROGRAM.duration}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={13} className="text-white/80 shrink-0" />
                  <span className="text-white/90 text-xs">
                    Eligibility: {HUNAR_PROGRAM.eligibility}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Award size={13} className="text-white/80 shrink-0" />
                  <span className="text-white/90 text-xs">
                    Certificate: {HUNAR_PROGRAM.certification}
                  </span>
                </div>
              </div>

              {/* Action */}
              {isEnrolled ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 bg-white/20 rounded-xl px-3 py-2">
                    <CheckCircle size={14} className="text-green-300" />
                    <span className="text-white font-bold text-sm">
                      Enrolled ✓
                    </span>
                  </div>
                  <p className="text-white/70 text-xs text-center">
                    Week 1 of 4–8 complete
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleEnroll}
                  className="w-full bg-black/30 hover:bg-black/40 text-white font-bold text-sm py-3 rounded-2xl transition-colors"
                  data-ocid="learn.hunar_program.apply_button"
                >
                  Apply Now 🚀
                </button>
              )}
            </div>
          </motion.div>
        </div>

        {/* Top Courses */}
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-foreground">Top Courses</h2>
          <Badge className="bg-accent/10 text-accent text-xs">
            <Zap size={10} className="mr-1" />
            Trending
          </Badge>
        </div>

        {allCourses.map((course, i) => (
          <motion.div
            key={course.id.toString()}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 + 0.1 }}
            className="bg-card rounded-2xl shadow-card overflow-hidden"
            data-ocid={`learn.course.item.${i + 1}`}
          >
            <button
              type="button"
              className="relative h-36 w-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center cursor-pointer"
              onClick={() =>
                setPlayingId(playingId === course.id ? null : course.id)
              }
              data-ocid={`learn.play.${i + 1}_button`}
            >
              <span className="text-5xl">{course.emoji}</span>
              <div className="absolute bottom-3 left-3">
                <Badge className="bg-success/90 text-success-foreground text-[10px]">
                  {course.badge}
                </Badge>
              </div>
              <div className="absolute bottom-3 right-3 bg-black/50 rounded-full p-1">
                <PlayCircle size={24} className="text-white" />
              </div>
              {playingId === course.id && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <p className="text-white font-semibold text-sm">
                    Video yahan chalega ▶️
                  </p>
                </div>
              )}
            </button>
            <div className="p-4">
              <h3 className="font-bold text-foreground text-base">
                {course.title}
              </h3>
              <p className="text-muted-foreground text-xs mt-1 leading-relaxed">
                {course.description}
              </p>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock size={12} />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Award size={12} />
                    <span>Certificate</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="flex items-center gap-1 text-xs text-primary font-bold"
                  data-ocid={`learn.start.${i + 1}_button`}
                >
                  Shuru Karo <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
