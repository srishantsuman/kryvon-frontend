import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

/**
 * Google redirects here after user approves OAuth consent.
 * URL will be: /auth/callback?code=XXXXX
 * We extract the code, send it to the backend, get our JWT, and redirect to /app.
 */
export const GoogleCallback = () => {
  const [params] = useSearchParams();
  const { googleLogin } = useAuth();
  const navigate = useNavigate();
  const called = useRef(false); // Prevent double-call in React StrictMode

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const code = params.get("code");
    const error = params.get("error");

    if (error || !code) {
      toast.error("Google sign-in was cancelled or failed");
      navigate("/");
      return;
    }

    googleLogin(code)
      .then(() => {
        toast.success("Signed in with Google!");
        navigate("/app");
      })
      .catch(() => {
        toast.error("Google sign-in failed. Please try again.");
        navigate("/");
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: "#0A0A0A" }}>
      <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#00D4FF" }} />
      <p className="text-white/60 text-sm">Signing you in with Google...</p>
    </div>
  );
};
