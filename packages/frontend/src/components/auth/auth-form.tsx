"use client";

import { useState } from "react";
import { Button } from "@heroui/react";
import { Input } from "@heroui/input";
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
import { addToast } from "@heroui/react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";

interface AuthFormProps {
  mode: "login" | "register";
}

interface FormErrors {
  firstName?: string;
  secondName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  username?: string;
  general?: string;
}

export function AuthForm({ mode }: AuthFormProps) {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: "",
    secondName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (mode === "register" && !isStrongPassword(formData.password)) {
      newErrors.password =
        "Password must be at least 8 characters long, include letters, numbers, and a special character";
    } else if (!validatePassword(formData.password)) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (mode === "register") {
      if (!formData.firstName || !validateUsername(formData.firstName)) {
        newErrors.firstName =
          "First name must be 3-20 characters and can contain letters, numbers, underscores, and hyphens";
      }
      if (!formData.secondName || !validateUsername(formData.secondName)) {
        newErrors.secondName =
          "Second name must be 3-20 characters and can contain letters, numbers, underscores, and hyphens";
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value, // Ensure this is updating correctly
    }));

    // Clear errors when typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      let response;

      if (mode === "login") {
        response = await auth.login(formData.email, formData.password);
      } else {
        response = await auth.register(
          `${formData.firstName} ${formData.secondName}`,
          formData.email,
          formData.password
        );
      }

      if (!response.success || !response.data) {
        throw new Error(response.error || "Authentication failed");
      }

      addToast({
        title:
          mode === "login"
            ? `Welcome back, ${response.data.user.username}!`
            : "Account created successfully!",
        color: "success",
        timeout: 2000,
      });

      await login(response.data.user);
      router.push("/dashboard");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again later.";

      setErrors({
        general:
          mode === "login"
            ? "Login failed. Incorrect email or password. Please try again."
            : "Signup failed. Please check your details and try again.",
      });
      addToast({
        title: mode === "login" ? "Login Error" : "SignUp Error",
        description: errorMessage,
        color: "danger",
        timeout: 2000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-[480px]">
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
      <form onSubmit={handleSubmit} noValidate>
        <CardContent className="space-y-8">
          {errors.general && (
            <div className="text-sm font-medium text-red-500">
              {errors.general}
            </div>
          )}

          {mode === "register" && (
            <div className="flex gap-5">
              <div className="space-y-2">
                <Input
                  id="first-name"
                  name="firstName"
                  label="First Name"
                  labelPlacement="outside"
                  variant="bordered"
                  type="text"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  isInvalid={!!errors.firstName}
                  errorMessage={errors.firstName}
                />
              </div>
              <div className="space-y-2">
                <Input
                  id="second-name"
                  name="secondName"
                  label="Second Name"
                  labelPlacement="outside"
                  variant="bordered"
                  type="text"
                  placeholder="Doe"
                  value={formData.secondName}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  isInvalid={!!errors.secondName}
                  errorMessage={errors.secondName}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Input
              id="email"
              name="email"
              label="Email"
              labelPlacement="outside"
              type="email"
              variant="bordered"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading}
              isInvalid={!!errors.email}
              errorMessage={errors.email}
            />
          </div>

          <div className="space-y-2">
            <Input
              id="password"
              name="password"
              label="Password"
              labelPlacement="outside"
              type="password"
              variant="bordered"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isLoading}
              isInvalid={!!errors.password}
              errorMessage={errors.password}
            />
          </div>

          {mode === "register" && (
            <div className="space-y-2">
              <Input
                id="confirm-password"
                name="confirmPassword"
                labelPlacement="outside"
                label="Confirm Password"
                variant="bordered"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={isLoading}
                isInvalid={!!errors.confirmPassword}
                errorMessage={errors.confirmPassword}
              />
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-2">
          <Button
            type="submit"
            className="w-full bg-black text-white"
            isLoading={isLoading}
            aria-busy={isLoading}
          >
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
