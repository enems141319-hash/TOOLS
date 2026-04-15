// src/app/(dashboard)/layout.tsx

import Link from "next/link";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  FolderOpen,
  Package,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { logoutUser } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const NAV_ITEMS = [
  { href: "/dashboard",  label: "總覽",     icon: LayoutDashboard },
  { href: "/projects",   label: "我的專案",  icon: FolderOpen },
  { href: "/materials",  label: "材料管理",  icon: Package },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="min-h-screen flex bg-muted/20">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-background border-r flex flex-col">
        {/* Logo */}
        <div className="px-5 py-4 border-b">
          <Link href="/dashboard" className="font-bold text-lg text-primary tracking-tight">
            DecoCost
          </Link>
          <p className="text-[10px] text-muted-foreground mt-0.5">裝潢估價系統</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors group"
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{label}</span>
              <ChevronRight className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-50 transition-opacity" />
            </Link>
          ))}
        </nav>

        <Separator />

        {/* User + Logout */}
        <div className="px-3 py-3 space-y-1">
          <p className="text-xs font-medium truncate px-2">{session.user.name}</p>
          <p className="text-[10px] text-muted-foreground truncate px-2">{session.user.email}</p>
          <form action={logoutUser}>
            <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground mt-1 h-8" type="submit">
              <LogOut className="h-3.5 w-3.5 mr-2" />
              登出
            </Button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-auto">
        {children}
      </main>
    </div>
  );
}
