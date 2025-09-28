"use client";

import { FloatingDock } from "@/components/ui/floating-dock";
import {
  IconChartHistogram,
  IconList,
  IconPlus,
  IconUserCircle,
} from "@tabler/icons-react";
import { usePathname } from "next/navigation";

export default function FloatingDockClient() {
  const pathname = usePathname();

  if (pathname?.startsWith("/f/")) {
    return null;
  }
  const links = [
    {
      title: "Dashboard",
      icon: (
        <IconList className="h-full w-full text-muted-foreground transition-colors" />
      ),
      href: "/dashboard",
    },
    {
      title: "Create Form",
      icon: (
        <IconPlus className="h-full w-full text-muted-foreground transition-colors" />
      ),
      href: "/create-form",
    },
    {
      title: "Analytics",
      icon: (
        <IconChartHistogram className="h-full w-full text-muted-foreground transition-colors" />
      ),
      href: "/analytics",
    },
    {
      title: "Profile",
      icon: (
        <IconUserCircle className="h-full w-full text-muted-foreground transition-colors" />
      ),
      href: "/profile",
    },
  ];

  return (
    // Keep clicks only on the dock; let clicks pass through elsewhere
    <div className="pointer-events-none fixed left-1/2 -translate-x-1/2 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50">
      <div className="pointer-events-auto">
        <FloatingDock items={links} />
      </div>
    </div>
  );
}
