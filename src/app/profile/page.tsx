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

const Profile = () => {
	return (
		<>
			<SignedIn>
				<div>Profile</div>
			</SignedIn>
			<SignedOut>
				<RedirectToSignIn />
			</SignedOut>
		</>
	);
};

export default Profile;
