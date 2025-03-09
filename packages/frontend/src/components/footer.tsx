"use client";
import React from "react";
import withPathLayout from "./hoc/with-path-layout";

const Footer = () => {
  return (
    <footer className="border-t py-12 bg-white dark:bg-gray-900 text-zinc-900 dark:text-white">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-zinc-900 dark:text-white font-bold text-xl mb-4">
              Goaluxe
            </h3>
            <p className="text-sm text-zinc-600 dark:text-gray-300">
              Empowering individuals to achieve their dreams through smart
              goal-setting and tracking.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-zinc-900 dark:text-white">
              Product
            </h4>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-gray-300">
              <li>
                <a
                  href="#"
                  className="hover:text-zinc-900 dark:hover:text-white"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-zinc-900 dark:hover:text-white"
                >
                  Integrations
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-zinc-900 dark:hover:text-white"
                >
                  FAQ
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-zinc-900 dark:text-white">
              Company
            </h4>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-gray-300">
              <li>
                <a
                  href="#"
                  className="hover:text-zinc-900 dark:hover:text-white"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-zinc-900 dark:hover:text-white"
                >
                  Careers
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-zinc-900 dark:hover:text-white"
                >
                  Blog
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-zinc-900 dark:text-white">
              Legal
            </h4>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-gray-300">
              <li>
                <a
                  href="#"
                  className="hover:text-zinc-900 dark:hover:text-white"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-zinc-900 dark:hover:text-white"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-zinc-900 dark:hover:text-white"
                >
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-zinc-600 dark:text-gray-400">
          <p>&copy; {new Date().getFullYear()} Goaluxe. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default withPathLayout(Footer, ["/login", "/register", "/dashboard"]);
