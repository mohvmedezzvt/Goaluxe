"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import withPathLayout from "./hoc/with-path-layout";
import ThemeSwitch from "./ui/theme-switch";

const Header = () => {
  return (
    <motion.nav
      className="fixed w-full border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-20 transition-colors duration-300"
      initial={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <h1 className="font-semibold text-2xl bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
                Goaluxe
              </h1>
            </Link>
            <div className="relative">
              <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-medium bg-pink-500 text-white">
                Early Access Available
              </span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-6">
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
            >
              Features
            </Link>
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
            >
              About
            </Link>

            <Button
              className="bg-gradient-to-r from-pink-500 to-orange-500 text-white hover:opacity-90 transition-opacity"
              size="sm"
            >
              Join Waitlist
            </Button>
            <Link href="/login">
              <Button
                size="sm"
                className="bg-white bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent border"
              >
                Login
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="sm"
                className=" bg-gradient-to-r from-pink-500 to-orange-500"
              >
                SignUp
              </Button>
            </Link>

            <ThemeSwitch />
          </div>

          <Button variant="ghost" size="icon" className="lg:hidden">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </Button>
        </div>
      </div>
    </motion.nav>
  );
};

export default withPathLayout(Header, ["/login", "/dashboard", "/register"]);
