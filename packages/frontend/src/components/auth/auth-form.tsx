"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/api";
import {
  validateEmail,
  validatePassword,
  validateUsername,
  isStrongPassword,
} from "@/lib/validations";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";

export function AuthForm({ mode }: AuthFormProps) {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (mode === "register") {
      if (!isStrongPassword(formData.password)) {
        newErrors.password =
          "Password must be at least 8 characters and include uppercase, lowercase, and numbers";
      }
    } else {
      if (!validatePassword(formData.password)) {
        newErrors.password = "Password must be at least 6 characters";
      }
    }

    if (mode === "register" && !validateUsername(formData.username)) {
      newErrors.username =
        "Username must be 3-20 characters and can contain letters, numbers, underscores, and hyphens";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    const loadingToast = toast.loading(
      mode === "login" ? "Signing in..." : "Creating your account..."
    );

    try {
      let response;

      if (mode === "login") {
        response = await auth.login(formData.email, formData.password);
      } else {
        response = await auth.register(
          formData.username,
          formData.email,
          formData.password
        );
      }

      if (!response.success || !response.data) {
        throw new Error(response.error || "Authentication failed");
      }

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      // Show success message
      toast.success(
        mode === "login"
          ? `Welcome back, ${response.data.user.username}!`
          : "Account created successfully!"
      );

      // Update auth state
      await login(response.data.user);

      // Navigate to dashboard
      router.push("dashboard");
    } catch (error) {
      toast.dismiss(loadingToast);
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      toast.error(errorMessage);

      setErrors({
        general: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>
          {mode === "login" ? "Login" : "Create an account"}
        </CardTitle>
        <CardDescription>
          {mode === "login"
            ? "Enter your credentials to access your account"
            : "Enter your information to create an account"}
        </CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          {errors.general && (
            <div className="text-sm font-medium text-red-500">
              {errors.general}
            </div>
          )}

          {mode === "register" && (
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="johndoe"
                value={formData.username}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
              {errors.username && (
                <p className="text-sm text-red-500">{errors.username}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password}</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-2">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading
              ? "Please wait..."
              : mode === "login"
                ? "Sign in"
                : "Sign up"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
