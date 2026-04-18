import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, Beef, Milk, Wheat, HeartPulse, StickyNote, Baby, Bell, BarChart3, Wallet, DollarSign, Users, LogOut, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const links = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/my-herd", icon: Beef, label: "My Herd" },
  { to: "/milk-records", icon: Milk, label: "Milk Records" },
  { to: "/feeding", icon: Wheat, label: "Feeding" },
  { to: "/health", icon: HeartPulse, label: "Health" },
  { to: "/notes", icon: StickyNote, label: "Notes" },
  { to: "/breeding", icon: Baby, label: "Breeding" },
  { to: "/alerts", icon: Bell, label: "Alerts" },
  { to: "/reports", icon: BarChart3, label: "Reports" },
  { to: "/expenses", icon: Wallet, label: "Expenses" },
  { to: "/income", icon: DollarSign, label: "Income" },
  { to: "/workers", icon: Users, label: "Farm Workers" },
  { to: "/communication", icon: MessageCircle, label: "Communication" },
];

export default function AppLayout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen">
      <aside className="no-print w-40 bg-sidebar text-sidebar-foreground flex flex-col shrink-0">
        <div className="p-4 flex items-center gap-2 font-bold text-lg">
          <Beef className="h-6 w-6" />
          CowTrack
        </div>
        <nav className="flex-1 flex flex-col gap-0.5 px-2">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive ? "bg-sidebar-active text-sidebar-foreground font-medium" : "hover:bg-sidebar-hover"
                }`
              }
            >
              <l.icon className="h-4 w-4" />
              {l.label}
            </NavLink>
          ))}
        </nav>
        <button onClick={handleLogout} className="flex items-center gap-2 px-5 py-3 text-sm hover:bg-sidebar-hover transition-colors">
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </aside>
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
