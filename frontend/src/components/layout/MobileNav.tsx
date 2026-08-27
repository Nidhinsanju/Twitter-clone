"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Home, Mail, Search, User } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/explore", label: "Explore", icon: Search },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/messages", label: "Messages", icon: Mail },
  { href: "/profile/nidhinsanju", label: "Profile", icon: User },
];

export default function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-border bg-bg/90 py-1 backdrop-blur-md md:hidden">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-1 items-center justify-center py-2.5"
            aria-label={item.label}
          >
            <Icon className="h-6 w-6" strokeWidth={active ? 2.5 : 2} />
          </Link>
        );
      })}
    </nav>
  );
}
