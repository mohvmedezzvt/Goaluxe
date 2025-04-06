// vitest.setup.ts (or .js)
import { vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@testing-library/jest-dom";

// Create a wrapper for React Query context
const createWrapper = () => {
  const queryClient = new QueryClient();
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

// Optional: Configure global test setup
beforeEach(() => {
  // Clear query client cache between tests
  const queryClient = new QueryClient();
  queryClient.clear();
});

// Optional: Add global mocks if needed
vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual("@tanstack/react-query");
  return {
    ...actual,
    useQuery: vi.fn(),
    // Add other mocks as needed
  };
});

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

// Export the wrapper for use in tests
export { createWrapper, pushMock };
