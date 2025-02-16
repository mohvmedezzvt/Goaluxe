import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/providers/toast-provider";
import { QueryClientProvider } from "@/components/providers/query-client-provider";
import { cn } from "@/lib/utils";
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
      <body
        className={cn(inter.className, "overflow-y-hidden")}
        suppressHydrationWarning
      >
        <QueryClientProvider>
          <div id="app" className="overflow-y-hidden" suppressHydrationWarning>
            <ToastProvider />
            <main className="min-h-screen bg-background ">{children}</main>
          </div>
        </QueryClientProvider>
      </body>
    </html>
  );
}
