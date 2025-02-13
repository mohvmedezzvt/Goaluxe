"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { 
  LayoutDashboard, 
  Target, 
  Trophy,
  UserCircle,
  LogOut
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

const navItems = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard
  },
  {
    title: "Goals",
    href: "/dashboard/goals",
    icon: Target
  },
  {
    title: "Rewards",
    href: "/dashboard/rewards",
    icon: Trophy
  },
  {
    title: "Profile",
    href: "/dashboard/profile",
    icon: UserCircle
  }
]

export function DashboardNav() {
  const pathname = usePathname()
  const { logout } = useAuth()

  return (
    <nav className="w-64 min-h-screen p-4 border-r bg-background">
      <div className="space-y-4">
        <div className="py-2">
          <h2 className="text-2xl font-bold tracking-tight">Goaluxe</h2>
          <p className="text-sm text-muted-foreground">
            Track your goals and rewards
          </p>
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
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.title}
            </Link>
          ))}
        </div>

        <div className="pt-4 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={logout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </nav>
  )
} 