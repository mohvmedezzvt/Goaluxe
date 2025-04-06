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
import {
  validateEmail,
  validatePassword,
  validateUsername,
  isStrongPassword,
} from "@/lib/validations";
import { useAuth } from "@/hooks/use-auth";

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
  const { handleAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    secondName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const isValidEmail = (email: string): string | null => {
    if (!email) return "Email is required";
    if (!validateEmail(email)) return "Please enter a valid email address";
    return null;
  };

  const isValidPassword = (password: string, mode: string): string | null => {
    if (!password) return "Password is required";
    if (mode === "register" && !isStrongPassword(password))
      return "Password must be at least 8 characters long, include letters, numbers, and a special character";
    if (!validatePassword(password))
      return "Password must be at least 8 characters";
    return null;
  };

  const isValidName = (name: string): string | null => {
    if (!name || !validateUsername(name)) {
      return "Name must be 3-30 characters and can contain letters, numbers, underscores, and hyphens";
    }
    return null;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate email
    const emailError = isValidEmail(formData.email);
    if (emailError) {
      newErrors.email = emailError;
    }

    // Validate password
    const passwordError = isValidPassword(formData.password, mode);
    if (passwordError) {
      newErrors.password = passwordError;
    }

    // Additional checks for registration mode
    if (mode === "register") {
      // Validate first name
      const firstNameError = isValidName(formData.firstName);
      if (firstNameError) {
        newErrors.firstName = firstNameError;
      }

      // Validate second name
      const secondNameError = isValidName(formData.secondName);
      if (secondNameError) {
        newErrors.secondName = secondNameError;
      }

      // Validate confirm password
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    // Update errors state
    setErrors(newErrors);

    // Return true if no errors exist
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
    await handleAuth(mode, formData, validateForm, setErrors, setIsLoading);
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
              placeholder="Enter Password"
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
                placeholder="Confirm Password"
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
