import { type Metadata } from "next";
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import FloatingDockClient from "../components/FloatingDockClient";
import { ThemeProvider } from "@/components/theme-provider";

import { Navbar } from "@/components/ui/simple-header";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "formyr",
  description: "Create and manage forms with ai",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <ThemeProvider>
        <nav className="sticky top-0 z-50 items-stretch justify-center">
          <Navbar />
        </nav>
        <html lang="en" suppressHydrationWarning>
          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          >
            {/* <header className="flex h-16 items-center justify-end gap-4 p-4"> */}
            <SignedOut></SignedOut>
            <SignedIn>
              {/* <UserButton /> */}

              <FloatingDockClient />
            </SignedIn>
            {/* </header> */}
            <FloatingDockClient />
            {children}
          </body>
        </html>
      </ThemeProvider>
    </ClerkProvider>
  );
}
