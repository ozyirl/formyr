"use client";
import {
	ClerkProvider,
	SignInButton,
	SignUpButton,
	SignedIn,
	SignedOut,
	UserButton,
	RedirectToSignIn,
} from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const RedirectToDashboard = () => {
	const router = useRouter();

	useEffect(() => {
		router.push("/dashboard/home"); // target page
	}, [router]);

	return null; // render nothing
};

const Dashboard = () => {
	return (
		<>
			<SignedIn>
				<div>Dashboard</div>
			</SignedIn>
			<SignedOut>
				<RedirectToSignIn />
			</SignedOut>
		</>
	);
};

export default Dashboard;
