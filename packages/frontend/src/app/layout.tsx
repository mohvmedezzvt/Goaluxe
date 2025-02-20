import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryClientProvider } from "@/components/providers/query-client-provider";
import { cn } from "@/lib/utils";
import { HeroUIProvider, ToastProvider } from "@heroui/react";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Goaluxe - Your Personal Goal Tracking System",
  description: "Set goals, track progress, and earn rewards with Goaluxe",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className)} suppressHydrationWarning>
        <QueryClientProvider>
          <HeroUIProvider>
            <div id="app" suppressHydrationWarning>
              <ToastProvider placement="top-right" />
              <main className="min-h-screen bg-background ">{children}</main>
            </div>
          </HeroUIProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
