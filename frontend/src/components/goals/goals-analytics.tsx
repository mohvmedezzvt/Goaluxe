"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Goal } from "@/types"
import { BarChart3 } from "lucide-react"

interface GoalsAnalyticsProps {
  goals: Goal[]
}

export function GoalsAnalytics({ goals }: GoalsAnalyticsProps) {
  // Calculate completion rate by month
  const monthlyCompletion = goals.reduce((acc, goal) => {
    if (goal.status === 'completed') {
      const month = new Date(goal.targetDate).toLocaleString('default', { month: 'short' })
      acc[month] = (acc[month] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  // Calculate progress distribution
  const progressRanges = {
    'Not Started (0%)': goals.filter(g => g.progress === 0).length,
    'Early Progress (1-25%)': goals.filter(g => g.progress > 0 && g.progress <= 25).length,
    'In Progress (26-75%)': goals.filter(g => g.progress > 25 && g.progress <= 75).length,
    'Nearly Complete (76-99%)': goals.filter(g => g.progress > 75 && g.progress < 100).length,
    'Completed (100%)': goals.filter(g => g.progress === 100).length,
  }

  const totalGoals = goals.length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Detailed Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Distribution */}
        <div>
          <h4 className="text-sm font-medium mb-4">Progress Distribution</h4>
          <div className="space-y-3">
            {Object.entries(progressRanges).map(([range, count]) => (
              <div key={range} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{range}</span>
                  <span className="font-medium">{count}</span>
                </div>
                <Progress 
                  value={totalGoals ? (count / totalGoals) * 100 : 0} 
                  className="h-1.5"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Completion */}
        <div>
          <h4 className="text-sm font-medium mb-4">Monthly Completion</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            {Object.entries(monthlyCompletion).map(([month, count]) => (
              <div key={month} className="space-y-1">
                <span className="text-2xl font-bold">{count}</span>
                <p className="text-xs text-muted-foreground">{month}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 