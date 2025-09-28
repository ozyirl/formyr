"use client";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
const Dashboard = () => {
  const router = useRouter();
  return (
    <>
      <div className="flex justify-center items-center">
        <SignedIn>
          <Button
            className="flex justify-center items-center"
            onClick={() => {
              router.push("/create-form");
            }}
            variant="default"
          >
            create form
          </Button>
        </SignedIn>
        <SignedOut>
          <></>
        </SignedOut>
      </div>
    </>
  );
};

export default Dashboard;
