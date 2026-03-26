"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, MonitorPlay, Users, User } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Keşfet", path: "/", icon: Search },
    { name: "Yayınlar", path: "/yayinlar", icon: MonitorPlay },
    { name: "Kurbanlarım", path: "/kurbanlarim", icon: Users },
    { name: "Profil", path: "/profil", icon: User },
  ];

  // İlan detay, Auth veya Admin sayfalarında bottom nav gizle
  if (pathname.startsWith("/ilan/") || pathname === "/giris" || pathname === "/kayit" || pathname.startsWith("/admin")) return null;

  return (
    <nav
      style={{ transform: "translateZ(0)", willChange: "transform" }}
      className="fixed bottom-0 left-0 right-0 bg-[var(--bg-secondary)] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.4)] border-t border-[var(--border-color)] pb-2 md:hidden z-[100]"
    >
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
                isActive ? "text-[var(--accent-main)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Icon size={22} className="mb-1" strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] ${isActive ? "font-bold" : "font-medium"}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
