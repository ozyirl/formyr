"use client";
import React from "react";
import { Grid2x2PlusIcon } from "lucide-react";
import { Sheet, SheetContent, SheetFooter } from "@/components/ui/sheet";
import { Button, buttonVariants } from "@/components/ui/button";
import { MenuToggle } from "@/components/ui/menu-toggle";
import { UserButton } from "@clerk/nextjs";
export function Navbar() {
  const [open, setOpen] = React.useState(false);

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-1/4 z-50 w-full border-b backdrop-blur-lg">
      <nav className="flex h-14 w-full items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Grid2x2PlusIcon className="size-6" />
          <p className="font-mono text-lg font-bold">Formyr</p>
        </div>
        <div className="hidden items-center gap-2 lg:flex">
          <h1 className={buttonVariants({ variant: "ghost" })}>Github</h1>

          <Button variant="outline">Sign In</Button>
          <Button>Get Started</Button>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <Button size="icon" variant="outline" className="lg:hidden">
            <MenuToggle
              strokeWidth={2.5}
              open={open}
              onOpenChange={setOpen}
              className="size-6"
            />
          </Button>
          <SheetContent
            className="bg-background/95 supports-[backdrop-filter]:bg-background/80 gap-0 backdrop-blur-lg"
            showClose={false}
            side="left"
          >
            <div className="grid gap-y-2 overflow-y-auto px-4 pt-12 pb-5">
              <h1 className={buttonVariants({ variant: "ghost" })}>About</h1>
            </div>
            <SheetFooter>
              <Button variant="outline">Sign In</Button>
              <Button>Get Started</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
