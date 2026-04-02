import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Briefcase, Lock, Mail } from "lucide-react";
import { useState } from "react";

interface AdminLoginScreenProps {
  onLogin: () => void;
}

export default function AdminLoginScreen({ onLogin }: AdminLoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setTimeout(() => {
      if (email === "admin@quickrozgar.com" && password === "Admin@123") {
        onLogin();
      } else {
        setError("Invalid email or password. Please try again.");
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-admin-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-admin-accent flex items-center justify-center mb-3 shadow-lg">
            <Briefcase className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Quick Rozgar
          </h1>
          <p className="text-admin-muted text-sm mt-1">Admin Control Panel</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            Sign in to Admin
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Authorized personnel only
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-gray-700 font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@quickrozgar.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  data-ocid="admin.input"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-gray-700 font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                  data-ocid="admin.input"
                  required
                />
              </div>
            </div>

            {error && (
              <p
                className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2"
                data-ocid="admin.error_state"
              >
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full bg-admin-sidebar hover:bg-admin-sidebar/90 text-white font-semibold h-11"
              disabled={loading}
              data-ocid="admin.submit_button"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
