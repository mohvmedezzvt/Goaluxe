"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import {
  LayoutDashboard,
  Target,
  Trophy,
  UserCircle,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { useState } from "react";

const navItems = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Goals",
    href: "/dashboard/goals",
    icon: Target,
  },
  {
    title: "Rewards",
    href: "/dashboard/rewards",
    icon: Trophy,
  },
  {
    title: "Profile",
    href: "/dashboard/profile",
    icon: UserCircle,
  },
];

export function DashboardNav() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  return (
    <motion.nav
      animate={open ? { width: "16rem" } : { width: "5rem" }}
      initial={{ width: "16rem" }}
      transition={{ ease: "backOut" }}
      className="min-h-screen p-4 border-r bg-background overflow-hidden"
    >
      <div className="space-y-4">
        <div
          className={cn(
            "flex justify-between items-center py-2",
            !open && "!justify-center"
          )}
        >
          <div className={cn(!open && "hidden")}>
            <h2 className="text-2xl font-bold tracking-tight">Goaluxe</h2>
          </div>
          <div
            onClick={() => setOpen(!open)}
            className="p-1 rounded-lg flex justify-center items-center hover:bg-slate-200 duration-300 w-fit h-fit"
          >
            <ChevronRight
              className={cn("duration-500", open && "rotate-180 ")}
            />
          </div>
        </div>

        <div className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                pathname === item.href
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
                !open && "justify-center"
              )}
            >
              <item.icon className="w-4 h-4" />

              {open && item.title}
            </Link>
          ))}
        </div>

        <div className="pt-4 border-t">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50",
              !open && "!justify-center"
            )}
            onClick={logout}
          >
            <LogOut className={cn("w-4 h-4", open && " mr-2")} />

            <span className={cn(!open && "hidden")}>Logout</span>
          </Button>
        </div>
      </div>
    </motion.nav>
  );
}
