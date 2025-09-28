"use client";

import { RedirectToSignIn, SignedIn, SignedOut } from "@clerk/nextjs";

import { ThemeToggle } from "@/components/theme-toggle";

const Profile = () => {
    return (
        <>
            <SignedIn>
                <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold text-foreground">Profile</span>
                    <ThemeToggle />
                </div>
            </SignedIn>
            <SignedOut>
                <RedirectToSignIn />
            </SignedOut>
        </>
    );
};

export default Profile;

