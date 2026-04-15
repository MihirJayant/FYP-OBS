import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Star,
  Award,
  Menu,
  X,
  Gavel,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    href: "/users",
    icon: Users,
  },
  {
    title: "Jobs",
    href: "/jobs",
    icon: Briefcase,
  },
  {
    title: "Bids",
    href: "/bids",
    icon: Gavel,
  },
  {
    title: "Ratings",
    href: "/ratings",
    icon: Star,
  },
  {
    title: "Payments",
    href: "/payments",
    icon: CreditCard,
  },
  {
    title: "Wallet Ledger",
    href: "/walletLedger",
    icon: Award,
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden bg-card shadow-md"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-sidebar transition-all duration-300 ease-in-out",
          collapsed ? "w-16" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
          {!collapsed && (
            <h1 className="text-xl font-bold text-sidebar-foreground">
              Admin Panel
            </h1>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin py-4 px-2 h-[calc(100vh-4rem)]">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={item.href}>
                  <NavLink
                    to={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                        : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5 flex-shrink-0",
                        collapsed && "mx-auto"
                      )}
                    />
                    {!collapsed && (
                      <span className="truncate">{item.title}</span>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}
