import { Button } from "@/components/ui/button";
import { ChevronRight, Copy, IndianRupee, Share2, Users } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

const REFERRAL_CODE = "QR-RAMU7";

const REFERRALS = [
  { name: "Suresh Yadav", status: "Joined", earned: 50 },
  { name: "Priya Sharma", status: "Applied", earned: 100 },
  { name: "Mohan Lal", status: "Joined", earned: 50 },
];

export default function ReferralScreen() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(REFERRAL_CODE);
    setCopied(true);
    toast.success("Code copy ho gaya! 🎉");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-accent to-orange-600 px-4 pt-12 pb-8 rounded-b-[2rem]">
        <h1 className="text-white font-bold text-xl">Dosto Ko Bulao 🤝</h1>
        <p className="text-white/80 text-sm mt-1">Paisa Kamao!</p>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mt-6 bg-white rounded-2xl p-5 text-center shadow-card-hover"
        >
          <p className="text-xs text-muted-foreground font-medium mb-2">
            Tumhara Referral Code
          </p>
          <p className="text-3xl font-extrabold text-foreground tracking-widest">
            {REFERRAL_CODE}
          </p>
          <button
            type="button"
            onClick={handleCopy}
            className="mt-3 flex items-center gap-2 mx-auto text-sm text-primary font-semibold"
            data-ocid="referral.copy_button"
          >
            <Copy size={14} />
            {copied ? "Copied! ✅" : "Copy Karo"}
          </button>
        </motion.div>
      </div>

      <div className="flex-1 px-4 mt-4 space-y-5 pb-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-2xl p-3 shadow-card text-center">
            <Users size={20} className="text-primary mx-auto mb-1" />
            <p className="text-xl font-bold text-foreground">3</p>
            <p className="text-[10px] text-muted-foreground">Referrals</p>
          </div>
          <div className="bg-card rounded-2xl p-3 shadow-card text-center">
            <IndianRupee size={20} className="text-accent mx-auto mb-1" />
            <p className="text-xl font-bold text-foreground">₹200</p>
            <p className="text-[10px] text-muted-foreground">Kamaya</p>
          </div>
          <div className="bg-card rounded-2xl p-3 shadow-card text-center">
            <IndianRupee size={20} className="text-success mx-auto mb-1" />
            <p className="text-xl font-bold text-foreground">₹300</p>
            <p className="text-[10px] text-muted-foreground">Baki</p>
          </div>
        </div>

        {/* How it works */}
        <div>
          <h2 className="font-bold text-foreground mb-3">
            Kaise Kaam Karta Hai?
          </h2>
          <div className="space-y-3">
            {[
              { step: "1", text: "Apna code dosto ko share karo", icon: "📱" },
              { step: "2", text: "Dost QuickRozgar join kare", icon: "✅" },
              { step: "3", text: "₹50 tumhe milenge, ₹50 unhe", icon: "💰" },
            ].map((item) => (
              <div
                key={item.step}
                className="flex items-center gap-3 bg-card rounded-2xl p-4 shadow-card"
              >
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                  {item.step}
                </div>
                <p className="text-sm text-foreground">
                  <span className="mr-2">{item.icon}</span>
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Referral List */}
        <div>
          <h2 className="font-bold text-foreground mb-3">Tumhare Referrals</h2>
          <div className="space-y-2" data-ocid="referral.list">
            {REFERRALS.map((ref, i) => (
              <div
                key={ref.name}
                className="bg-card rounded-2xl px-4 py-3 shadow-card flex items-center justify-between"
                data-ocid={`referral.item.${i + 1}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                    {ref.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {ref.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {ref.status}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-bold text-success">
                  +₹{ref.earned}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Share CTA */}
        <Button
          className="w-full h-14 rounded-2xl text-base font-bold bg-accent hover:bg-accent/90 text-white"
          data-ocid="referral.share_button"
        >
          <Share2 size={18} className="mr-2" />
          Abhi Share Karo 🚀
        </Button>
      </div>
    </div>
  );
}
