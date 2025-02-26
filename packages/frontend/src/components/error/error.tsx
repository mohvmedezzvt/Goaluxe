"use client";

import { useEffect, useState } from "react";
import {
  ExclamationTriangleIcon,
  ArrowPathIcon,
  HomeIcon,
  ChatBubbleBottomCenterTextIcon,
} from "@heroicons/react/24/outline";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-red-50 to-white p-4">
      <div className="max-w-lg w-full bg-white shadow-lg rounded-lg p-6 text-center">
        <div className="flex justify-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500" />
        </div>
        <div className="mt-6">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Oops, something went wrong!
          </h1>
          <p className="mt-4 text-base text-gray-600">
            We’re sorry for the inconvenience. An unexpected error occurred
            while processing your request.
          </p>
        </div>
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
                  <p className="mt-2">
                    <span className="font-semibold">Error ID:</span>{" "}
                    {error.digest}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-md shadow hover:bg-red-500 transition duration-200 focus:outline-none focus:ring-2 focus:ring-red-600"
          >
            <ArrowPathIcon className="h-5 w-5" />
            Try Again
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-900 text-sm font-semibold rounded-md shadow hover:bg-gray-200 transition duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            <HomeIcon className="h-5 w-5" />
            Home
          </button>
          <a
            href="mailto:support@example.com"
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md shadow hover:bg-blue-500 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <ChatBubbleBottomCenterTextIcon className="h-5 w-5" />
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
