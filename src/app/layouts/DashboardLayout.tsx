import { Outlet, useNavigate, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useTrades } from "../context/TradeContext";
import { Button } from "../components/ui/button";
import { LayoutDashboard, BookOpen, BarChart3, Calendar, LogOut, User, Loader2 } from "lucide-react";
import { useEffect } from "react";

const NAV = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/app" },
  { icon: BookOpen,         label: "Journal",   path: "/app/journal" },
  { icon: BarChart3,        label: "Analytics", path: "/app/analytics" },
  { icon: Calendar,         label: "Calendar",  path: "/app/calendar" },
];

export const DashboardLayout = () => {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const { fetchTrades } = useTrades();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate("/");
  }, [isAuthenticated, isLoading, navigate]);

  // Pre-load trades once when the layout mounts
  useEffect(() => {
    if (isAuthenticated) fetchTrades();
  }, [isAuthenticated, fetchTrades]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0A0A0A" }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#00D4FF" }} />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#0A0A0A" }}>
      {/* Sidebar */}
      <aside className="w-60 border-r hidden md:flex flex-col flex-shrink-0"
        style={{ background: "rgba(255,255,255,0.015)", borderColor: "rgba(255,255,255,0.06)" }}>
        {/* Logo */}
        <div className="p-6 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <span className="text-2xl font-bold" style={{
            background: "linear-gradient(135deg, #00D4FF 0%, #7A5CFF 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>KRYVON</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(({ icon: Icon, label, path }) => {
            const active = path === "/app"
              ? location.pathname === "/app"
              : location.pathname.startsWith(path);
            return (
              <button key={path} onClick={() => navigate(path)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all"
                style={{
                  background: active ? "rgba(0,212,255,0.1)" : "transparent",
                  color: active ? "#00D4FF" : "rgba(255,255,255,0.55)",
                  borderLeft: active ? "2px solid #00D4FF" : "2px solid transparent",
                }}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </button>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-3 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-3 p-2 mb-1">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #00D4FF, #7A5CFF)" }}>
                <User className="w-4 h-4 text-white" />
              </div>
            )}
            <p className="text-sm text-white/70 truncate flex-1">{user?.email}</p>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all text-white/40 hover:text-white hover:bg-white/5">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="md:hidden h-14 border-b flex items-center justify-between px-4"
          style={{ background: "rgba(255,255,255,0.015)", borderColor: "rgba(255,255,255,0.06)" }}>
          <span className="text-lg font-bold" style={{
            background: "linear-gradient(135deg, #00D4FF, #7A5CFF)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>KRYVON</span>
          <div className="flex gap-1">
            {NAV.map(({ icon: Icon, path }) => (
              <button key={path} onClick={() => navigate(path)}
                className="p-2 rounded-lg transition-colors"
                style={{ color: location.pathname === path ? "#00D4FF" : "rgba(255,255,255,0.4)" }}>
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
