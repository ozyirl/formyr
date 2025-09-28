"use client";

import { RedirectToSignIn, SignedIn, SignedOut } from "@clerk/nextjs";

import { ModeToggle } from "@/components/mode-toggle";

const Profile = () => {
  return (
    <>
      <SignedIn>
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold text-foreground">Profile</span>
          <ModeToggle />
        </div>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
};

export default Profile;
