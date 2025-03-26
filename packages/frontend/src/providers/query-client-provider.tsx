"use client"; // Mark this as a Client Component

import React, { useRef } from "react";
import {
  QueryClient,
  QueryClientProvider as Provider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export function QueryClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // ✅ Ensure queryClient persists across renders
  const queryClientRef = useRef<QueryClient | null>(null);
  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient({
      defaultOptions: {
        queries: {
          retry: 2,
          staleTime: 0,
        },
      },
    });
  }

  return (
    <Provider client={queryClientRef.current}>
      {children}
      {process.env.NODE_ENV === "development" ? (
        <ReactQueryDevtools initialIsOpen={false} />
      ) : null}
    </Provider>
  );
}
