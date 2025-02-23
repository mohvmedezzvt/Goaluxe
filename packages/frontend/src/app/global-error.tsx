"use client";

import {
  ExclamationCircleIcon,
  ArrowPathIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
          <div className="text-center">
            {/* Error Icon */}
            <div className="flex justify-center">
              <ExclamationCircleIcon className="h-24 w-24 text-red-500/90" />
            </div>

            {/* Error Content */}
            <div className="mt-8">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                Critical Error
              </h1>
              <p className="mt-6 text-base leading-7 text-gray-600 max-w-md mx-auto">
                We've encountered a serious problem. Our team has been notified
                and is working to resolve the issue.
              </p>
            </div>

            {/* Error Details (if in production, you might want to hide detailed errors) */}
            {process.env.NODE_ENV === "development" && (
              <div className="mt-8 bg-red-50 p-4 rounded-lg max-w-md mx-auto">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Error details
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error.message || "An unexpected error occurred"}</p>
                      {error.digest && (
                        <p className="mt-2 text-xs text-red-600/80">
                          Error ID: {error.digest}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <button
                onClick={() => reset()}
                className="rounded-md bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 flex items-center gap-2"
              >
                <ArrowPathIcon className="h-4 w-4" />
                Try again
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                className="rounded-md bg-white px-5 py-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 flex items-center gap-2"
              >
                <HomeIcon className="h-4 w-4" />
                Go to Homepage
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-16 text-center">
            <p className="text-sm text-gray-500">
              If the problem persists, please contact support
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
