import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryClientProvider } from "@/providers/query-client-provider";
import { cn } from "@/lib/utils";
import { HeroUIProvider, ToastProvider } from "@heroui/react";
import ErrorBoundary from "@/components/error/error-boundary";
import Error from "@/components/error/error";
import Header from "@/components/header";
import Footer from "@/components/footer";
import ThemeProvider from "@/providers/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Goaluxe - Your Personal Goal Tracking System",
  description: "Set goals, track progress, and earn rewards with Goaluxe",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className)} suppressHydrationWarning>
        <QueryClientProvider>
          <HeroUIProvider>
            <ThemeProvider>
              <ErrorBoundary FallbackComponent={Error}>
                <div
                  id="app"
                  className="text-foreground-800"
                  suppressHydrationWarning
                >
                  <ToastProvider placement="top-right" />
                  <Header />
                  {children}
                  <Footer />
                </div>
              </ErrorBoundary>
            </ThemeProvider>
          </HeroUIProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
