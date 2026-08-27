"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Bell,
  Bookmark,
  Home,
  Mail,
  MoreHorizontal,
  Search,
  User,
  Moon,
  Sun,
  LogOut,
  Feather,
} from "lucide-react";
import TwitterLogo from "@/components/icons/TwitterLogo";
import Avatar from "@/components/ui/Avatar";
import { useComposeModal } from "@/context/ComposeModalContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { open } = useComposeModal();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!user) return null;

  const NAV_ITEMS = [
    { href: "/", label: "Home", icon: Home },
    { href: "/explore", label: "Explore", icon: Search },
    { href: "/notifications", label: "Notifications", icon: Bell },
    { href: "/messages", label: "Messages", icon: Mail },
    { href: "/bookmarks", label: "Bookmarks", icon: Bookmark },
    { href: `/profile/${user.handle}`, label: "Profile", icon: User },
  ];

  async function handleLogout() {
    setMenuOpen(false);
    await logout();
    router.push("/login");
  }

  return (
    <div className="flex h-full flex-col justify-between px-2 py-1 xl:items-stretch items-center">
      <div className="flex flex-col items-center xl:items-stretch">
        <Link
          href="/"
          className="mb-1 flex h-12 w-12 items-center justify-center rounded-full text-accent transition-colors hover:bg-hover-blue"
        >
          <TwitterLogo />
        </Link>

        <nav className="flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-4 rounded-full py-3 px-3 transition-colors hover:bg-hover xl:pr-5"
              >
                <Icon
                  className="h-[26px] w-[26px] shrink-0"
                  strokeWidth={active ? 2.5 : 2}
                />
                <span
                  className={`hidden text-xl xl:inline ${
                    active ? "font-bold" : "font-normal"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <button
          onClick={open}
          className="mt-4 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-accent font-bold text-white transition-colors hover:bg-accent-hover xl:w-full"
          aria-label="Post"
        >
          <Feather className="h-6 w-6 xl:hidden" />
          <span className="hidden text-lg xl:inline">Post</span>
        </button>
      </div>

      <div className="relative mb-2">
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="animate-slide-down absolute bottom-full left-0 z-20 mb-2 w-64 overflow-hidden rounded-2xl border border-border bg-bg shadow-[0_0_15px_rgba(101,119,134,0.2)]">
              <button
                onClick={toggleTheme}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-[15px] hover:bg-hover"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
                Switch to {theme === "dark" ? "light" : "dark"} mode
              </button>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-[15px] hover:bg-hover"
              >
                <LogOut className="h-5 w-5" />
                Log out @{user.handle}
              </button>
            </div>
          </>
        )}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex w-full items-center gap-3 rounded-full p-3 transition-colors hover:bg-hover"
        >
          <Avatar user={user} size="md" />
          <div className="hidden min-w-0 flex-1 text-left xl:block">
            <p className="truncate text-[15px] font-bold">{user.name}</p>
            <p className="truncate text-[15px] text-text-secondary">@{user.handle}</p>
          </div>
          <MoreHorizontal className="hidden h-5 w-5 xl:block" />
        </button>
      </div>
    </div>
  );
}
