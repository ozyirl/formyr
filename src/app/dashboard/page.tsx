import {
	ClerkProvider,
	SignInButton,
	SignUpButton,
	SignedIn,
	SignedOut,
	UserButton,
} from "@clerk/nextjs";
import { FloatingDock } from "@/components/ui/floating-dock";
import {
	IconBrandGithub,
	IconBrandX,
	IconExchange,
	IconHome,
	IconNewSection,
	IconTerminal2,
	IconPlus,
	IconList,
} from "@tabler/icons-react";

const Dashboard = () => {
	return (
		<>
			<SignedIn>
				<>
					<UserButton />
					<FloatingDockDemo />
				</>
			</SignedIn>
			<SignedOut>
				<SignInButton />
				<SignUpButton />
			</SignedOut>
		</>
	);
};

export function FloatingDockDemo() {
	const links = [
		{
			title: "My Forms",
			icon: (
				<IconList className="h-full w-full text-neutral-500 dark:text-neutral-300" />
			),
			href: "#",
		},

		{
			title: "Create Forms",
			icon: (
				<IconPlus className="h-full w-full text-neutral-500 dark:text-neutral-300" />
			),
			href: "#",
		},
		{
			title: "Analytics",
			icon: (
				<IconNewSection className="h-full w-full text-neutral-500 dark:text-neutral-300" />
			),
			href: "#",
		},
		{
			title: "Profile",
			icon: (
				<img
					src="https://assets.aceternity.com/logo-dark.png"
					width={20}
					height={20}
					alt="Aceternity Logo"
				/>
			),
			href: "#",
		},
	];
	return (
		<div className="flex items-center justify-center h-[35rem] w-full">
			<FloatingDock
				mobileClassName="translate-y-20" // only for demo, remove for production
				items={links}
			/>
		</div>
	);
}
export default Dashboard;
