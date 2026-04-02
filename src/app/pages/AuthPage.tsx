import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

type AuthMode = "login" | "register" | "forgot" | "reset";

export const AuthPage = () => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, register, forgotPassword, resetPassword, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) { navigate("/app"); return null; }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
        toast.success("Welcome back!");
        navigate("/app");
      } else if (mode === "register") {
        if (password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
        await register(email, password);
        toast.success("Account created!");
        navigate("/app");
      } else if (mode === "forgot") {
        await forgotPassword(email);
        toast.success("Check your email for the reset code");
        setMode("reset");
      } else if (mode === "reset") {
        await resetPassword(email, otp, newPassword);
        toast.success("Password reset! Please log in.");
        setMode("login");
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(msg || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) { toast.error("Google OAuth not configured"); return; }
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: `${window.location.origin}/auth/callback`,
      response_type: "code",
      scope: "openid email profile",
    });
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  };

  const titles: Record<AuthMode, string> = {
    login: "Welcome back",
    register: "Create account",
    forgot: "Reset password",
    reset: "Enter reset code",
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: "#0A0A0A" }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #00D4FF 0%, transparent 70%)", filter: "blur(80px)" }}
          animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 8, repeat: Infinity }} />
        <motion.div className="absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #7A5CFF 0%, transparent 70%)", filter: "blur(80px)" }}
          animate={{ scale: [1.2, 1, 1.2] }} transition={{ duration: 8, repeat: Infinity }} />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md mx-4">
        <div className="rounded-2xl p-8 backdrop-blur-xl border"
          style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.1)" }}>

          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-5xl mb-2 font-bold" style={{
              background: "linear-gradient(135deg, #00D4FF 0%, #7A5CFF 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>KRYVON</h1>
            <p style={{ color: "rgba(255,255,255,0.5)" }} className="text-sm">Professional Trading Journal</p>
          </div>

          {/* Back button for sub-modes */}
          {(mode === "forgot" || mode === "reset") && (
            <button onClick={() => setMode("login")} className="flex items-center gap-1 text-sm mb-4 hover:text-white transition-colors"
              style={{ color: "rgba(255,255,255,0.5)" }}>
              <ArrowLeft className="w-4 h-4" /> Back to login
            </button>
          )}

          <p className="text-white text-lg mb-6">{titles[mode]}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email — shown on all modes */}
            <div className="space-y-2">
              <Label style={{ color: "rgba(255,255,255,0.9)" }}>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" required
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#00D4FF]" />
            </div>

            {/* Password — login and register */}
            {(mode === "login" || mode === "register") && (
              <div className="space-y-2">
                <Label style={{ color: "rgba(255,255,255,0.9)" }}>Password</Label>
                <div className="relative">
                  <Input type={showPassword ? "text" : "password"} value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === "register" ? "Min. 8 characters" : "Enter password"}
                    required className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#00D4FF] pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* OTP + new password — reset mode */}
            {mode === "reset" && (
              <>
                <div className="space-y-2">
                  <Label style={{ color: "rgba(255,255,255,0.9)" }}>6-digit code</Label>
                  <Input value={otp} onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456" maxLength={6} required
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 text-center text-2xl tracking-widest focus:border-[#00D4FF]" />
                </div>
                <div className="space-y-2">
                  <Label style={{ color: "rgba(255,255,255,0.9)" }}>New password</Label>
                  <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 8 characters" required
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#00D4FF]" />
                </div>
              </>
            )}

            <Button type="submit" disabled={loading} className="w-full"
              style={{ background: "linear-gradient(135deg, #00D4FF 0%, #7A5CFF 100%)", border: "none" }}>
              {loading ? "Processing..." : mode === "login" ? "Sign in" : mode === "register" ? "Create account" : mode === "forgot" ? "Send code" : "Reset password"}
            </Button>

            {/* Mode switchers */}
            {mode === "login" && (
              <div className="flex justify-between text-sm pt-1">
                <button type="button" onClick={() => setMode("register")}
                  className="hover:text-[#00D4FF] transition-colors" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Create account
                </button>
                <button type="button" onClick={() => setMode("forgot")}
                  className="hover:text-[#00D4FF] transition-colors" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Forgot password?
                </button>
              </div>
            )}
            {mode === "register" && (
              <div className="text-center text-sm">
                <button type="button" onClick={() => setMode("login")}
                  className="hover:text-[#00D4FF] transition-colors" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Already have an account? Sign in
                </button>
              </div>
            )}
          </form>

          {/* Google OAuth — only on login / register */}
          {(mode === "login" || mode === "register") && (
            <div className="mt-6">
              <div className="relative flex items-center mb-4">
                <div className="flex-1 border-t" style={{ borderColor: "rgba(255,255,255,0.1)" }} />
                <span className="px-3 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>OR</span>
                <div className="flex-1 border-t" style={{ borderColor: "rgba(255,255,255,0.1)" }} />
              </div>
              <Button type="button" variant="outline" onClick={handleGoogleLogin}
                className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-[#00D4FF]">
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
