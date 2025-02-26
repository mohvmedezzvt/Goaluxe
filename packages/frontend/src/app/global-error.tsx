"use client";

import { useState } from "react";
import {
  ExclamationCircleIcon,
  ArrowPathIcon,
  HomeIcon,
  ChatBubbleBottomCenterTextIcon,
} from "@heroicons/react/24/outline";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <html>
      <body className="min-h-screen bg-gradient-to-r from-gray-100 to-white flex flex-col items-center justify-center p-4">
        <main className="w-full max-w-lg">
          <div className="bg-white shadow-lg rounded-lg p-8 text-center">
            {/* Error Icon */}
            <div className="flex justify-center">
              <ExclamationCircleIcon className="h-24 w-24 text-red-500" />
            </div>

            {/* Error Content */}
            <div className="mt-6">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                Critical Error
              </h1>
              <p className="mt-4 text-base text-gray-600">
                We've encountered a serious problem. Our team has been notified
                and is working to resolve the issue.
              </p>
            </div>

            {/* Toggle Error Details (visible in development) */}
            {process.env.NODE_ENV === "development" && (
              <div className="mt-6">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-red-600 hover:underline focus:outline-none"
                  aria-expanded={showDetails}
                  aria-controls="error-details"
                >
                  {showDetails ? "Hide error details" : "Show error details"}
                </button>
                {showDetails && (
                  <div
                    id="error-details"
                    className="mt-4 bg-red-50 p-4 rounded-lg text-left text-sm text-red-700"
                  >
                    <p>{error.message || "An unexpected error occurred."}</p>
                    {error.digest && (
                      <p className="mt-2 text-xs">
                        <span className="font-semibold">Error ID:</span>{" "}
                        {error.digest}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={reset}
                className="flex items-center gap-2 px-5 py-3 bg-red-600 text-white text-sm font-semibold rounded-md shadow hover:bg-red-500 transition duration-200 focus:outline-none focus:ring-2 focus:ring-red-600"
              >
                <ArrowPathIcon className="h-5 w-5" />
                Try again
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                className="flex items-center gap-2 px-5 py-3 bg-white text-gray-900 text-sm font-semibold rounded-md shadow ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                <HomeIcon className="h-5 w-5" />
                Go to Homepage
              </button>
              <a
                href="mailto:support@example.com"
                className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white text-sm font-semibold rounded-md shadow hover:bg-blue-500 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <ChatBubbleBottomCenterTextIcon className="h-5 w-5" />
                Contact Support
              </a>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500">
              If the problem persists, please reach out to our support team.
            </p>
          </div>
        </main>
      </body>
    </html>
  );
}
