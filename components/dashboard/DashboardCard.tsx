import type React from "react"
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/solid"
import { cn } from "@/lib/utils"

interface DashboardCardProps {
  title: string
  value: number
  description: string
  icon: React.ReactNode
  trend?: number
  color?: "blue" | "green" | "red" | "yellow" | "purple"
}

export default function DashboardCard({
  title,
  value,
  description,
  icon,
  trend = 0,
  color = "blue",
}: DashboardCardProps) {
  const colorClasses = {
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300",
    green: "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300",
    red: "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300",
    yellow: "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300",
    purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300",
  }

  const trendColor = trend > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"

  return (
    <div className="dashboard-card rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
      <div className="flex items-center">
        <div className={cn("p-3 rounded-full", colorClasses[color])}>{icon}</div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</dt>
            <dd>
              <div className="text-3xl font-semibold text-gray-900 dark:text-white">{value}</div>
            </dd>
          </dl>
        </div>
      </div>
      <div className="mt-5 flex items-center justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-400">{description}</span>
        {trend !== 0 && (
          <span className={cn("flex items-center text-sm font-medium", trendColor)}>
            {trend > 0 ? (
              <ArrowUpIcon className="mr-1 h-4 w-4 flex-shrink-0" aria-hidden="true" />
            ) : (
              <ArrowDownIcon className="mr-1 h-4 w-4 flex-shrink-0" aria-hidden="true" />
            )}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
    </div>
  )
}

