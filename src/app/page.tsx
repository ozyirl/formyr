"use client";

import {
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
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
