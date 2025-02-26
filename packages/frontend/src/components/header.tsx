"use client";
import useTheme from "@/stores/useTheme";
import { Button } from "@heroui/react";
import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import Link from "next/link";
import React from "react";
import withPathLayout from "./hoc/with-path-layout";

const Header = () => {
  const { IsTheme, setTheme } = useTheme();
  return (
    <motion.nav
      className="fixed w-full border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50 transition-colors duration-300"
      initial={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <h1 className="font-semibold text-2xl">Goaluxe</h1>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-zinc-900 dark:text-white">
              Features
            </Link>
            <Link href="/" className="text-zinc-900 dark:text-white">
              About
            </Link>

            <Button className="bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-gray-200 text-white dark:text-zinc-900">
              Join Waitlist
            </Button>

            {IsTheme === "light" ? (
              <Button
                className="!w-fit !min-w-0 rounded-full !p-2 !h-auto bg-black"
                onPress={() => setTheme("dark")}
              >
                <Sun className="h-5 w-5 text-yellow-400" />
              </Button>
            ) : (
              <Button
                className="!w-fit !min-w-0 rounded-full !p-2 !h-auto bg-black"
                onPress={() => setTheme("light")}
              >
                <Moon className="h-5 w-5 text-white" />
              </Button>
            )}
          </div>
          <Button
            variant="ghost"
            className="md:hidden text-zinc-900 dark:text-white"
          >
            Menu
          </Button>
        </div>
      </div>
    </motion.nav>
  );
};

export default withPathLayout(Header, ["/login", "/register", "/dashboard"]);
