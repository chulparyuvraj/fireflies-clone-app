"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Meetings", href: "/", icon: "\u{1F4C1}" },
  { label: "Notifications", href: "#", icon: "\u{1F514}", soon: true },
  { label: "Integrations", href: "#", icon: "\u{1F517}", soon: true },
  { label: "Team", href: "#", icon: "\u{1F465}", soon: true },
  { label: "Settings", href: "#", icon: "\u2699\uFE0F", soon: true },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-[220px] shrink-0 flex-col bg-[#12101f] text-[#c9c5db]">
      <div className="flex items-center gap-2 px-5 py-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#7c6bff] to-[#4a3aff] text-sm font-bold text-white">
          F
        </div>
        <span className="text-[15px] font-semibold tracking-tight text-white">Fireflies<span className="text-[#9b8cff]">.clone</span></span>
      </div>

      <nav className="mt-2 flex-1 px-3">
        {NAV_ITEMS.map((item) => {
          const active = item.href === "/" && pathname === "/";
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={(e) => item.soon && e.preventDefault()}
              className={`group relative mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors
                ${active ? "bg-white/10 text-white" : "hover:bg-white/5 hover:text-white"}`}
            >
              <span className="text-base leading-none opacity-90">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
              {item.soon && (
                <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#9b8cff]">
                  Soon
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mx-3 mb-5 flex items-center gap-3 rounded-lg bg-white/5 px-3 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#4a3aff] text-xs font-bold text-white">
          YC
        </div>
        <div className="min-w-0">
          <div className="truncate text-xs font-semibold text-white">Yuvraj Chulpar</div>
          <div className="truncate text-[11px] text-[#8b84a8]">Default user</div>
        </div>
      </div>
    </aside>
  );
}
