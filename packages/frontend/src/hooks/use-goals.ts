"use client"

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Goal } from '@/types'

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadGoals()
  }, [])

  const loadGoals = async () => {
    try {
      // TODO: Replace with actual API call
      const mockGoals: Goal[] = [
        {
          id: '1',
          title: 'Learn Next.js',
          description: 'Complete the Next.js documentation and build a project',
          targetDate: new Date('2024-12-31'),
          progress: 60,
          status: 'active',
          createdAt: new Date('2024-01-01')
        },
        {
          id: '2',
          title: 'Exercise Regularly',
          description: 'Work out at least 3 times a week',
          targetDate: new Date('2024-12-31'),
          progress: 30,
          status: 'active',
          createdAt: new Date('2024-01-15')
        }
      ]
      setGoals(mockGoals)
    } catch (error) {
      toast.error('Failed to load goals')
    } finally {
      setLoading(false)
    }
  }

  const addGoal = async (goal: Omit<Goal, 'id' | 'createdAt'>) => {
    try {
      // TODO: Replace with actual API call
      const newGoal: Goal = {
        ...goal,
        id: Math.random().toString(),
        createdAt: new Date()
      }
      setGoals(prev => [...prev, newGoal])
      toast.success('Goal added successfully')
    } catch (error) {
      toast.error('Failed to add goal')
    }
  }

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    try {
      // TODO: Replace with actual API call
      setGoals(prev => 
        prev.map(goal => 
          goal.id === id ? { ...goal, ...updates } : goal
        )
      )
      toast.success('Goal updated successfully')
    } catch (error) {
      toast.error('Failed to update goal')
    }
  }

  const deleteGoal = async (id: string) => {
    try {
      // TODO: Replace with actual API call
      setGoals(prev => prev.filter(goal => goal.id !== id))
      toast.success('Goal deleted successfully')
    } catch (error) {
      toast.error('Failed to delete goal')
    }
  }

  return {
    goals,
    loading,
    addGoal,
    updateGoal,
    deleteGoal
  }
} 