import { Outlet, Link, useLocation } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  FileText,
  ShieldCheck,
  Mail,
  Building2,
  Settings,
  LogOut,
  Menu,
  X,
  CreditCard,
  Lock,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/reports", label: "Credit Reports", icon: FileText },
  { path: "/disputes", label: "Dispute Center", icon: ShieldCheck },
  { path: "/letters", label: "Letters", icon: Mail },
  { path: "/creditors", label: "Creditors", icon: Building2 },
  { path: "/settings", label: "Settings", icon: Settings },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) return <Outlet />;

  return (
    <div className="flex h-screen bg-[#0a0b0f] overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[260px] flex flex-col transition-transform lg:transform-none ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          background: "linear-gradient(180deg, #0f1117 0%, #0a0b0f 100%)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 h-16 px-5 shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <Link to="/" className="flex items-center gap-2.5" onClick={() => setSidebarOpen(false)}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #d4a843, #f0c96a)",
                boxShadow: "0 2px 12px rgba(212,168,67,0.35)",
              }}>
              <CreditCard className="w-4.5 h-4.5 text-black" />
            </div>
            <div>
              <h1 className="text-[15px] font-bold tracking-wide" style={{ fontFamily: "'Playfair Display', serif" }}>
                <span className="gold-text">Credit</span>
                <span className="text-white/90">Repair</span>
              </h1>
              <p className="text-[9px] uppercase tracking-[0.2em] text-white/30">Premium</p>
            </div>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto p-1 rounded-md hover:bg-white/5">
            <X className="w-4 h-4 text-white/50" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <p className="px-4 pt-4 pb-2 text-[10px] uppercase tracking-[0.15em] text-white/25 font-medium">
            Menu
          </p>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`nav-item ${isActive ? "active" : ""}`}
              >
                <Icon className={`w-[18px] h-[18px] ${isActive ? "text-[#f0c96a]" : "text-white/40"}`} />
                <span>{item.label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto text-[#d4a843]" />}
              </Link>
            );
          })}
        </nav>

        {/* Security badge */}
        <div className="px-3 pb-2">
          <div className="glass-card p-3 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-emerald-400">AES-256 Encrypted</p>
              <p className="text-[10px] text-white/30">E2E Data Protection</p>
            </div>
          </div>
        </div>

        {/* User section */}
        <div className="p-3 shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
              style={{
                background: "linear-gradient(135deg, rgba(212,168,67,0.2), rgba(240,201,106,0.1))",
                border: "1px solid rgba(212,168,67,0.3)",
                color: "#f0c96a",
              }}>
              {(user.name || "U").charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white/90 truncate">{user.name || "User"}</p>
              <p className="text-[11px] text-white/30 truncate">{user.email || ""}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-white/40 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-all mt-1"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden h-14 shrink-0 flex items-center px-4 gap-3"
          style={{
            background: "linear-gradient(180deg, #0f1117, #0a0b0f)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}>
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-white/5">
            <Menu className="w-5 h-5 text-white/60" />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #d4a843, #f0c96a)" }}>
              <CreditCard className="w-3.5 h-3.5 text-black" />
            </div>
            <span className="text-sm font-bold gold-text">CreditRepair Pro</span>
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 xl:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
