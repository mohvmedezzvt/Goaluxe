import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi } from "vitest";

// --- Define shared mocks before imports ---

// Spy for router.push
const pushMock = vi.fn();

// Shared spies for store actions
const clearDeletesMock = vi.fn();
const clearEditsMock = vi.fn();

// Mock next/navigation so useRouter returns our push spy.
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

// Mock API call.
vi.mock("@/lib/api", () => ({
  api: {
    delete: vi.fn(),
  },
}));

// Mock the useDelete store to return a consistent object with shared spies.
vi.mock("@/stores/useDelete", () => ({
  default: () => ({
    isDeleting: {
      goal: { goalId: "123" },
      subtask: null,
    },
    clearDeletes: clearDeletesMock,
  }),
}));

// Mock the useEdit store similarly.
vi.mock("@/stores/useEdit", () => ({
  default: () => ({
    clearEdits: clearEditsMock,
  }),
}));

// Now import the hook (after the mocks are defined).
import { useDelete } from "../use-delete"; // adjust the path as necessary

// Helper: Wrap our hook in a QueryClientProvider.
const createWrapper = () => {
  const queryClient = new QueryClient();
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useDelete", () => {
  beforeEach(() => {
    // Clear all shared mocks before each test.
    vi.clearAllMocks();
  });

  it("calls API delete and invalidates queries on success", async () => {
    // Get the API module to set the return value for delete.
    const { api } = await import("@/lib/api");
    (api.delete as any).mockResolvedValueOnce({ success: true });

    const { result } = renderHook(() => useDelete(), { wrapper: createWrapper() });

    // Trigger deletion.
    result.current.handleDelete();

    // Wait for the mutation to finish and onSettled to be called.
    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith("goals/123");
      expect(pushMock).toHaveBeenCalledWith("/dashboard");
      expect(clearDeletesMock).toHaveBeenCalled();
      expect(clearEditsMock).toHaveBeenCalled();
    });
  });
});
