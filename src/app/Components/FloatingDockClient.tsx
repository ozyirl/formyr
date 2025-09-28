"use client";

import { FloatingDock } from "@/components/ui/floating-dock";
import {
	IconList,
	IconPlus,
	IconChartHistogram,
	IconUserCircle,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";

export default function FloatingDockClient() {
	const router = useRouter();
	const links = [
		{
			title: "My Forms",
			icon: (
				<IconList className="h-full w-full text-neutral-500 dark:text-neutral-300" />
			),
			href: "/dashboard",
		},
		{
			title: "Create Form",
			icon: (
				<IconPlus className="h-full w-full text-neutral-500 dark:text-neutral-300" />
			),
			href: "/create-form",
		},
		{
			title: "Analytics",
			icon: (
				<IconChartHistogram className="h-full w-full text-neutral-500 dark:text-neutral-300" />
			),
			href: "/analytics",
		},
		{
			title: "Profile",
			icon: (
				<IconUserCircle className="h-full w-full text-neutral-500 dark:text-neutral-300" />
			),
			href: "/profile",
		},
	];

	return (
		// Keep clicks only on the dock; let clicks pass through elsewhere
		<div
			className="pointer-events-none fixed left-1/2 -translate-x-1/2 z-50
                    bottom-[max(1rem,env(safe-area-inset-bottom))]"
		>
			<div className="pointer-events-auto">
				<FloatingDock items={links} />
			</div>
		</div>
	);
}
