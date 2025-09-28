"use client";
import Image from "next/image";
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
import Landing from "./landing/page";

const RedirectToDashboard = () => {
	const router = useRouter();

	useEffect(() => {
		router.push("/dashboard"); // target page
	}, [router]);

	return null; // render nothing
};

export default function Home() {
	return (
		<>
			<SignedIn>
				<RedirectToDashboard />
			</SignedIn>
			<SignedOut>
				<Landing />
			</SignedOut>
		</>
	);
}
