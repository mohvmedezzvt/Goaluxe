import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuth } from "../hooks/use-auth";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock("@/lib/api", () => ({
  auth: {
    logout: vi.fn().mockResolvedValue({}),
    login: vi.fn().mockResolvedValue({
      success: true,
      data: {
        user: {
          id: 1,
          username: "testuser",
          email: "test@example.com",
          roles: ["user"],
        },
      },
    }),
    register: vi.fn().mockResolvedValue({
      success: true,
      data: {
        user: {
          id: 2,
          username: "newuser",
          email: "new@example.com",
          roles: ["user"],
        },
      },
    }),
  },
}));

vi.mock("@heroui/react", () => ({
  addToast: vi.fn(),
}));

// Utility: wrapper with React Query provider
const createWrapper = () => {
  const queryClient = new QueryClient();
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useAuth (Vitest)", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("should load user from localStorage", async () => {
    const fakeUser = {
      id: 1,
      username: "localUser",
      email: "local@example.com",
      roles: ["admin"],
    };
    localStorage.setItem("user", JSON.stringify(fakeUser));

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await act(() => Promise.resolve()); // wait for useEffect

    expect(result.current.user).toEqual(fakeUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("should login and store user in localStorage", async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    const newUser: User = {
      id: "3",
      username: "newuser",
      email: "new@example.com",
      role: "user",
    };

    await act(async () => {
      await result.current.login(newUser);
    });

    expect(result.current.user).toEqual(newUser);
    expect(JSON.parse(localStorage.getItem("user")!)).toEqual(newUser);
  });

  it("should logout and clear user", async () => {
    const fakeUser = {
      id: 4,
      username: "logoutuser",
      email: "logout@example.com",
      roles: ["user"],
    };
    localStorage.setItem("user", JSON.stringify(fakeUser));

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await act(() => Promise.resolve());

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
  });
});
