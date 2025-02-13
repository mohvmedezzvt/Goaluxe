"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { SlidersHorizontal, Search, ChevronDown } from "lucide-react"
import { Goal } from "@/types"

interface GoalsFiltersProps {
  onFilterChange: (goals: Goal[]) => void
  onSortChange: (goals: Goal[]) => void
  goals: Goal[]
}

export function GoalsFilters({ onFilterChange, onSortChange, goals }: GoalsFiltersProps) {
  const handleSearch = (term: string) => {
    const filtered = goals.filter(goal => 
      goal.title.toLowerCase().includes(term.toLowerCase()) ||
      goal.description.toLowerCase().includes(term.toLowerCase())
    )
    onFilterChange(filtered)
  }

  const handleSort = (key: keyof Goal) => {
    const sorted = [...goals].sort((a, b) => {
      if (key === 'targetDate') {
        return new Date(a[key]).getTime() - new Date(b[key]).getTime()
      }
      if (key === 'progress') {
        return (b[key] as number) - (a[key] as number)
      }
      return String(a[key]).localeCompare(String(b[key]))
    })
    onSortChange(sorted)
  }

  const handleStatusFilter = (status: Goal['status'] | 'all') => {
    const filtered = status === 'all' 
      ? goals
      : goals.filter(goal => goal.status === status)
    onFilterChange(filtered)
  }

  return (
    <div className="flex gap-2 items-center">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search goals..."
          className="pl-8"
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Filter
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleStatusFilter('all')}>
            All Goals
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleStatusFilter('active')}>
            Active
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleStatusFilter('completed')}>
            Completed
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleStatusFilter('archived')}>
            Archived
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Sort by</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleSort('targetDate')}>
            Due Date
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSort('progress')}>
            Progress
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSort('title')}>
            Title
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
} 