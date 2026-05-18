"use client";

import Link from "next/link";
import { LayoutDashboard, Plus, BarChart2, Settings } from "lucide-react";

type ActiveTab = "dashboard" | "log" | "history" | "settings";

interface Props {
  active: ActiveTab;
}

interface TabConfig {
  id: ActiveTab;
  href: string;
  label: string;
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
}

const TABS: TabConfig[] = [
  { id: "dashboard", href: "/app", label: "Heute", Icon: LayoutDashboard },
  { id: "log", href: "/app/log", label: "Hinzufügen", Icon: Plus },
  { id: "history", href: "/app/history", label: "Verlauf", Icon: BarChart2 },
  { id: "settings", href: "/app/settings", label: "Einstellungen", Icon: Settings },
];

export default function NavBar({ active }: Props) {
  return (
    <nav
      style={{
        backgroundColor: "var(--bg2)",
        borderTop: "1px solid var(--border)",
      }}
      className="fixed bottom-0 left-0 right-0 z-50 flex items-stretch"
    >
      {TABS.map(({ id, href, label, Icon }) => {
        const isActive = active === id;
        return (
          <Link
            key={id}
            href={href}
            className="flex flex-1 flex-col items-center justify-center gap-1 py-3 transition-opacity active:opacity-70"
            style={{
              color: isActive ? "var(--green)" : "var(--text3)",
              textDecoration: "none",
            }}
          >
            <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
            <span
              style={{
                fontSize: "10px",
                fontWeight: isActive ? 600 : 400,
                letterSpacing: "0.02em",
                lineHeight: 1,
              }}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
