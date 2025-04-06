import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuth } from "../hooks/use-auth";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock("@heroui/react", () => ({
  addToast: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  auth: {
    login: vi.fn(() =>
      Promise.resolve({
        success: true,
        data: {
          user: {
            id: "5",
            username: "loginuser",
            email: "log@example.com",
            role: "user",
          },
        },
      })
    ),
    logout: vi.fn(),
    register: vi.fn(),
  },
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
    const fakeUser: User = {
      id: "1",
      username: "localUser",
      email: "local@example.com",
      role: "admin",
    };
    localStorage.setItem("user", JSON.stringify(fakeUser));

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await act(() => Promise.resolve()); // wait for useEffect

    expect(result.current.user).toEqual(fakeUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("should handle login successfully", async () => {
    const setErrors = vi.fn();
    const setIsLoading = vi.fn();
    const validateForm = vi.fn(() => true);

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    const formData = { email: "log@example.com", password: "password" };

    await act(async () => {
      await result.current.handleAuth(
        "login",
        formData,
        validateForm,
        setErrors,
        setIsLoading
      );
    });

    expect(result.current.user?.email).toBe("log@example.com");
    expect(setErrors).not.toHaveBeenCalled();
    expect(setIsLoading).toHaveBeenCalledWith(true);
    expect(setIsLoading).toHaveBeenCalledWith(false);
  });

  it("should login and store user in localStorage", async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    const fakeUser: User = {
      id: "3",
      username: "newuser",
      email: "new@example.com",
      role: "user",
    };

    await act(async () => {
      await result.current.login(fakeUser);
    });

    expect(result.current.user).toEqual(fakeUser);
    expect(JSON.parse(localStorage.getItem("user")!)).toEqual(fakeUser);
  });

  it("should logout and clear user", async () => {
    const fakeUser: User = {
      id: "4",
      username: "logoutuser",
      email: "logout@example.com",
      role: "user",
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
    expect(result.current.isAuthenticated).toBe(false);
  });
});
