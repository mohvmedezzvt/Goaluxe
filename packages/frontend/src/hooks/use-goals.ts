"use client";

import { api } from "@/lib/api";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    let response;
    try {
      response = await api.get("/goals");
      setGoals(response.data as Goal[]);
    } catch (error) {
      toast.error("Failed to load goals");
    } finally {
      setLoading(false);
    }
  };

  const addGoal = async (goal: Omit<Goal, "id" | "createdAt">) => {
    try {
      // TODO: Replace with actual API call
      const newGoal: Goal = {
        ...goal,
        _id: Math.random().toString(),
        createdAt: new Date(),
      };
      setGoals((prev) => [...prev, newGoal]);
      toast.success("Goal added successfully");
    } catch (error) {
      toast.error("Failed to add goal");
    }
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    try {
      // TODO: Replace with actual API call
      setGoals((prev) =>
        prev.map((goal) => (goal._id === id ? { ...goal, ...updates } : goal))
      );
      toast.success("Goal updated successfully");
    } catch (error) {
      toast.error("Failed to update goal");
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      // TODO: Replace with actual API call
      setGoals((prev) => prev.filter((goal) => goal._id !== id));
      toast.success("Goal deleted successfully");
    } catch (error) {
      toast.error("Failed to delete goal");
    }
  };

  return {
    goals,
    loading,
    addGoal,
    updateGoal,
    deleteGoal,
  };
}
