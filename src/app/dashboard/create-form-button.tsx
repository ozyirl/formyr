"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function CreateFormButton() {
  const router = useRouter();

  return (
    <Button onClick={() => router.push("/create-form")} variant="default">
      Create New Form
    </Button>
  );
}
