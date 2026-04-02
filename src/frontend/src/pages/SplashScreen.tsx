import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { saveEmployeeSession } from "../utils/employeeSession";
import { saveEmployerSession } from "../utils/employerSession";

interface SplashScreenProps {
  onGetStarted: (mode: "employee" | "employer") => void;
}

type EmployeeStep = "form" | "otp" | "done";
type EmployerStep = "form" | "done";

export default function SplashScreen({ onGetStarted }: SplashScreenProps) {
  const [activeTab, setActiveTab] = useState<"employee" | "employer">(
    "employee",
  );

  // Employee state
  const [empStep, setEmpStep] = useState<EmployeeStep>("form");
  const [empMobile, setEmpMobile] = useState("");
  const [empEmail, setEmpEmail] = useState("");
  const [empOtp, setEmpOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Employer state
  const [erpStep, setErpStep] = useState<EmployerStep>("form");
  const [erpMobile, setErpMobile] = useState("");
  const [erpEmail, setErpEmail] = useState("");
  const [erpPassword, setErpPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Signup modal state
  const [showSignup, setShowSignup] = useState(false);
  const [signupRole, setSignupRole] = useState<"employee" | "employer">(
    "employee",
  );
  const [signupName, setSignupName] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupCompany, setSignupCompany] = useState("");

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startCountdown = () => {
    setCountdown(30);
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const makeOtp = () => String(Math.floor(100000 + Math.random() * 900000));

  // --- Employee handlers (no Internet Identity needed) ---
  const handleSendOtp = () => {
    if (!empMobile || empMobile.length < 10) {
      toast.error("Valid mobile number enter karo");
      return;
    }
    if (!empEmail || !empEmail.includes("@")) {
      toast.error("Valid email enter karo");
      return;
    }
    const otp = makeOtp();
    setGeneratedOtp(otp);
    setEmpStep("otp");
    startCountdown();
    toast.success(`OTP bheja gaya! 📱 (Demo: ${otp})`);
  };

  const handleVerifyOtp = () => {
    if (empOtp.length < 4) {
      toast.error("OTP daalo");
      return;
    }
    if (generatedOtp && empOtp !== generatedOtp) {
      toast.error("Galat OTP! Please dobara try karo.");
      return;
    }
    // Save employee session to localStorage (no Internet Identity required)
    saveEmployeeSession(empMobile, empEmail);
    window.dispatchEvent(new Event("storage"));
    setEmpStep("done");
    // Small delay for the success UI to show
    setTimeout(() => {
      onGetStarted("employee");
    }, 800);
  };

  const handleResend = () => {
    if (countdown > 0) return;
    const otp = makeOtp();
    setGeneratedOtp(otp);
    startCountdown();
    toast.success(`OTP dobara bheja gaya! 📱 (Demo: ${otp})`);
  };

  // --- Employer handlers (localStorage session, no Internet Identity) ---
  const handleEmployerLogin = () => {
    if (!erpMobile || erpMobile.length < 10) {
      toast.error("Valid mobile number enter karo");
      return;
    }
    if (!erpEmail || !erpEmail.includes("@")) {
      toast.error("Valid email enter karo");
      return;
    }
    if (!erpPassword || erpPassword.length < 4) {
      toast.error("Password enter karo (min 4 characters)");
      return;
    }
    // Save session to localStorage and redirect immediately
    saveEmployerSession(erpMobile, erpEmail);
    window.dispatchEvent(new Event("storage"));
    setErpStep("done");
    setTimeout(() => {
      onGetStarted("employer");
    }, 600);
  };

  const handleForgotPassword = () => {
    toast.info("Password reset link bheja jayega aapke email par");
  };

  const handleCreateAccount = (role: "employee" | "employer") => {
    setSignupRole(role);
    setSignupName("");
    setSignupPhone("");
    setSignupEmail("");
    setSignupPassword("");
    setSignupCompany("");
    setShowSignup(true);
  };

  const handleSignupSubmit = () => {
    if (!signupName.trim()) {
      toast.error("Name enter karo");
      return;
    }
    if (!signupPhone || signupPhone.length < 10) {
      toast.error("Valid mobile number enter karo");
      return;
    }
    if (!signupEmail || !signupEmail.includes("@")) {
      toast.error("Valid email enter karo");
      return;
    }
    if (signupRole === "employer" && !signupCompany.trim()) {
      toast.error("Company name enter karo");
      return;
    }

    if (signupRole === "employee") {
      // Employee signup: save to localStorage and redirect
      saveEmployeeSession(signupPhone, signupEmail, signupName);
      window.dispatchEvent(new Event("storage"));
      setShowSignup(false);
      toast.success("Account create ho gaya!");
      setTimeout(() => onGetStarted("employee"), 300);
    } else {
      // Employer signup: save to localStorage and redirect immediately
      saveEmployerSession(signupPhone, signupEmail, signupCompany);
      window.dispatchEvent(new Event("storage"));
      setShowSignup(false);
      toast.success("Employer account create ho gaya!");
      setTimeout(() => onGetStarted("employer"), 300);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#0a1628] via-[#1a2b5e] to-[#0d1f4c] relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-amber-400/5 -translate-y-1/3 translate-x-1/3 blur-2xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-blue-400/8 translate-y-1/3 -translate-x-1/3 blur-2xl" />

      <div className="flex-1 flex flex-col items-center justify-start px-5 pt-12 pb-6 relative z-10">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <img
            src="/assets/generated/quick-rozgar-logo-transparent.dim_400x120.png"
            alt="Quick Rozgar"
            className="h-14 mx-auto mb-3 object-contain"
          />
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-white text-2xl font-extrabold text-center leading-tight"
        >
          Welcome to Quick Rozgar
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-amber-400 text-sm font-semibold text-center mt-1 mb-6"
        >
          Find Jobs or Hire Talent Easily
        </motion.p>

        {/* Tab toggle */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full flex bg-white/10 backdrop-blur-sm rounded-2xl p-1 mb-5 gap-1"
        >
          <button
            type="button"
            onClick={() => setActiveTab("employee")}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
              activeTab === "employee"
                ? "bg-white text-[#0a1628] shadow-md"
                : "text-white/70 hover:text-white"
            }`}
            data-ocid="splash.employee_tab"
          >
            👤 Employee Login
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("employer")}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
              activeTab === "employer"
                ? "bg-amber-500 text-white shadow-md"
                : "text-white/70 hover:text-white"
            }`}
            data-ocid="splash.employer_tab"
          >
            💼 Employer Login
          </button>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6"
        >
          <AnimatePresence mode="wait">
            {/* ======= EMPLOYEE LOGIN ======= */}
            {activeTab === "employee" && (
              <motion.div
                key="employee-panel"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {empStep === "form" && (
                  <>
                    <p className="text-white font-bold text-base text-center">
                      Employee Login
                    </p>
                    <div className="space-y-3">
                      <div>
                        <p className="text-white/70 text-xs font-semibold block mb-1">
                          Mobile Number
                        </p>
                        <Input
                          type="tel"
                          placeholder="10-digit mobile number"
                          value={empMobile}
                          onChange={(e) => setEmpMobile(e.target.value)}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-2xl h-12"
                          data-ocid="splash.emp_mobile_input"
                        />
                      </div>
                      <div>
                        <p className="text-white/70 text-xs font-semibold block mb-1">
                          Email ID
                        </p>
                        <Input
                          type="email"
                          placeholder="your@email.com"
                          value={empEmail}
                          onChange={(e) => setEmpEmail(e.target.value)}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-2xl h-12"
                          data-ocid="splash.emp_email_input"
                        />
                      </div>
                    </div>
                    <Button
                      className="w-full h-12 rounded-2xl font-bold bg-white text-[#0a1628] hover:bg-white/90"
                      onClick={handleSendOtp}
                      data-ocid="splash.emp_get_otp_button"
                    >
                      Get OTP & Login as Employee 📲
                    </Button>
                    <button
                      type="button"
                      onClick={() => handleCreateAccount("employee")}
                      className="w-full text-center text-amber-400 text-sm font-semibold hover:text-amber-300 transition-colors"
                      data-ocid="splash.emp_create_account_button"
                    >
                      + Create New Account
                    </button>
                  </>
                )}

                {empStep === "otp" && (
                  <>
                    <div className="text-center">
                      <p className="text-white font-bold text-base">
                        Enter OTP
                      </p>
                      <p className="text-white/50 text-xs mt-1">
                        Sent to: {empMobile}
                      </p>
                    </div>
                    <Input
                      type="number"
                      placeholder="6-digit OTP"
                      value={empOtp}
                      onChange={(e) => setEmpOtp(e.target.value.slice(0, 6))}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-2xl h-12 text-center text-lg tracking-widest"
                      data-ocid="splash.emp_otp_input"
                    />
                    <Button
                      className="w-full h-12 rounded-2xl font-bold bg-white text-[#0a1628] hover:bg-white/90"
                      onClick={handleVerifyOtp}
                      data-ocid="splash.emp_verify_otp_button"
                    >
                      Login as Employee ✅
                    </Button>
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setEmpStep("form")}
                        className="text-white/50 text-xs hover:text-white/80"
                      >
                        ← Back
                      </button>
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={countdown > 0}
                        className={`text-xs font-semibold ${
                          countdown > 0
                            ? "text-white/30"
                            : "text-amber-400 hover:text-amber-300"
                        }`}
                        data-ocid="splash.emp_resend_otp_button"
                      >
                        {countdown > 0
                          ? `Resend in ${countdown}s`
                          : "Resend OTP"}
                      </button>
                    </div>
                  </>
                )}

                {empStep === "done" && (
                  <div className="text-center py-4">
                    <p className="text-4xl mb-2">✅</p>
                    <p className="text-white font-bold">Login Successful!</p>
                    <p className="text-white/50 text-xs mt-1">
                      Redirecting to Employee Dashboard...
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* ======= EMPLOYER LOGIN ======= */}
            {activeTab === "employer" && (
              <motion.div
                key="employer-panel"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {erpStep === "form" && (
                  <>
                    <p className="text-white font-bold text-base text-center">
                      Employer Login
                    </p>
                    <div className="space-y-3">
                      <div>
                        <p className="text-white/70 text-xs font-semibold block mb-1">
                          Mobile Number
                        </p>
                        <Input
                          type="tel"
                          placeholder="10-digit mobile number"
                          value={erpMobile}
                          onChange={(e) => setErpMobile(e.target.value)}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-2xl h-12"
                          data-ocid="splash.erp_mobile_input"
                        />
                      </div>
                      <div>
                        <p className="text-white/70 text-xs font-semibold block mb-1">
                          Email ID
                        </p>
                        <Input
                          type="email"
                          placeholder="company@email.com"
                          value={erpEmail}
                          onChange={(e) => setErpEmail(e.target.value)}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-2xl h-12"
                          data-ocid="splash.erp_email_input"
                        />
                      </div>
                      <div>
                        <p className="text-white/70 text-xs font-semibold block mb-1">
                          Password
                        </p>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter password"
                            value={erpPassword}
                            onChange={(e) => setErpPassword(e.target.value)}
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-2xl h-12 pr-12"
                            data-ocid="splash.erp_password_input"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((p) => !p)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 text-xs"
                          >
                            {showPassword ? "Hide" : "Show"}
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={handleForgotPassword}
                          className="text-amber-400 text-xs font-semibold mt-1 hover:text-amber-300 transition-colors float-right"
                          data-ocid="splash.erp_forgot_password_button"
                        >
                          Forgot Password?
                        </button>
                        <div className="clear-both" />
                      </div>
                    </div>
                    <Button
                      className="w-full h-12 rounded-2xl font-bold bg-amber-500 hover:bg-amber-400 text-white"
                      onClick={handleEmployerLogin}
                      data-ocid="splash.erp_login_button"
                    >
                      Login as Employer 💼
                    </Button>
                    <button
                      type="button"
                      onClick={() => handleCreateAccount("employer")}
                      className="w-full text-center text-amber-400 text-sm font-semibold hover:text-amber-300 transition-colors"
                      data-ocid="splash.erp_create_account_button"
                    >
                      + Create New Account
                    </button>
                  </>
                )}

                {erpStep === "done" && (
                  <div className="text-center py-4">
                    <p className="text-4xl mb-2">✅</p>
                    <p className="text-white font-bold">Login Successful!</p>
                    <p className="text-white/50 text-xs mt-1">
                      Redirecting to Employer Dashboard...
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Signup Modal */}
      <AnimatePresence>
        {showSignup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end justify-center z-50 px-4 pb-6"
            onClick={() => setShowSignup(false)}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-[#0f1e40] border border-white/20 rounded-3xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-white font-bold text-lg">
                  {signupRole === "employee"
                    ? "👤 Create Employee Account"
                    : "💼 Create Employer Account"}
                </p>
                <button
                  type="button"
                  onClick={() => setShowSignup(false)}
                  className="text-white/50 hover:text-white text-xl leading-none"
                >
                  ✕
                </button>
              </div>
              <p className="text-white/50 text-sm">
                Fill in your details to get started on Quick Rozgar.
              </p>
              <Input
                placeholder="Full Name"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-2xl h-11"
              />
              <Input
                type="tel"
                placeholder="Mobile Number"
                value={signupPhone}
                onChange={(e) => setSignupPhone(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-2xl h-11"
              />
              <Input
                type="email"
                placeholder="Email ID"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-2xl h-11"
              />
              {signupRole === "employer" && (
                <Input
                  placeholder="Company Name"
                  value={signupCompany}
                  onChange={(e) => setSignupCompany(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-2xl h-11"
                />
              )}
              {signupRole === "employer" && (
                <Input
                  type="password"
                  placeholder="Set Password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-2xl h-11"
                />
              )}
              <Button
                className={`w-full h-12 rounded-2xl font-bold ${
                  signupRole === "employer"
                    ? "bg-amber-500 hover:bg-amber-400 text-white"
                    : "bg-white text-[#0a1628] hover:bg-white/90"
                }`}
                onClick={handleSignupSubmit}
              >
                {signupRole === "employee"
                  ? "Create Employee Account"
                  : "Create Employer Account"}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
