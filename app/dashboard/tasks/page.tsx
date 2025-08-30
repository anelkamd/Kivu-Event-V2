"use client"

import React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  CheckSquare,
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Star,
  X,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import CreateTaskForm from "@/components/CreateTaskForm"
import { useAuth } from "@/context/AuthContext"

interface Task {
  id: string
  event_id: string
  title: string
  description: string
  priority: "basse" | "normale" | "haute" | "critique"
  deadline: string
  category: string
  estimated_hours: number
  budget_allocated?: number
  validation_required: boolean
  status: "a_faire" | "en_cours" | "en_attente_validation" | "validee" | "rejetee" | "terminee" | "annulee"
  created_by: string
  assigned_to?: string
  required_resources?: string[]
  tags?: string[]
  progress_percentage?: number
  actual_hours?: number
  is_starred?: boolean
  creator?: {
    first_name: string
    last_name: string
    avatar?: string
  }
  assignedUser?: {
    name: string
    avatar?: string
  }
  event?: {
    title: string
  }
}

interface GroupedTasks {
  [eventId: string]: {
    eventTitle: string
    tasks: Task[]
  }
}

const priorityColors = {
  basse: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  normale: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  haute: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  critique: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

const priorityLabels = {
  basse: "Basse",
  normale: "Normale",
  haute: "Haute",
  critique: "Critique",
}

const statusColors = {
  a_faire: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  en_cours: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  en_attente_validation: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
  validee: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  rejetee: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  terminee: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  annulee: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
}

const statusLabels = {
  a_faire: "À faire",
  en_cours: "En cours",
  en_attente_validation: "En attente",
  validee: "Validée",
  rejetee: "Rejetée",
  terminee: "Terminée",
  annulee: "Annulée",
}

const statusIcons = {
  a_faire: Clock,
  en_cours: Clock,
  en_attente_validation: AlertTriangle,
  validee: CheckCircle,
  rejetee: XCircle,
  terminee: CheckCircle,
  annulee: XCircle,
}

export default function TasksPage() {
  const { user, token } = useAuth()
  const [filter, setFilter] = useState<string>("all")
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([])
  const [visibleTasks, setVisibleTasks] = useState<Task[]>([])
  const [groupedTasks, setGroupedTasks] = useState<GroupedTasks>({})
  const [loading, setLoading] = useState(true)
  const [eventId, setEventId] = useState("")
  const [events, setEvents] = useState([])
  const [updatingProgress, setUpdatingProgress] = useState<string | null>(null)
  const { toast } = useToast()

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

  const getAuthHeaders = () => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    return headers
  }

  const fetchTasks = async () => {
    if (!token) {
      console.log("[v0] No token available, skipping fetch")
      return
    }

    try {
      setLoading(true)
      console.log("[v0] Fetching all tasks from Express API...")

      // Single API call to get all user tasks
      const response = await fetch(`${API_BASE_URL}/api/tasks/user`, {
        headers: getAuthHeaders(),
      })

      if (response.ok) {
        let data = null
        const responseText = await response.text()

        if (responseText?.trim()) {
          try {
            data = JSON.parse(responseText)
          } catch (parseError) {
            console.error("[v0] Error parsing tasks response:", parseError)
            throw new Error("Invalid JSON response from tasks API")
          }
        } else {
          console.warn("[v0] Empty response from tasks API")
          setTasks([])
          setVisibleTasks([])
          setGroupedTasks({})
          return
        }

        if (data?.success && data?.data) {
          const allTasks = data.data.map((task: any) => ({
            ...task,
            required_resources: task.required_resources
              ? typeof task.required_resources === "string"
                ? JSON.parse(task.required_resources)
                : task.required_resources
              : [],
            tags: task.tags ? (typeof task.tags === "string" ? JSON.parse(task.tags) : task.tags) : [],
            progress_percentage: task.progress_percentage || 0,
            actual_hours: task.actual_hours || 0,
            is_starred: task.is_starred || false,
            event: task.event || { title: "Événement sans nom" },
            creator: task.creator
              ? {
                  first_name: task.creator.first_name || "",
                  last_name: task.creator.last_name || "",
                  avatar: task.creator.avatar,
                }
              : null,
          }))

          console.log("[v0] Tasks fetched successfully:", allTasks.length, "tasks")
          setTasks(allTasks)
          setVisibleTasks(allTasks)

          // Group tasks by event
          const grouped = allTasks.reduce((acc: GroupedTasks, task: Task) => {
            const eventId = task.event_id || "no-event"
            const eventTitle = task.event?.title || "Événement sans nom"

            if (!acc[eventId]) {
              acc[eventId] = {
                eventTitle,
                tasks: [],
              }
            }

            acc[eventId].tasks.push(task)
            return acc
          }, {})

          setGroupedTasks(grouped)
        } else {
          console.log("[v0] No tasks data in response")
          setTasks([])
          setVisibleTasks([])
          setGroupedTasks({})
        }
      } else {
        console.log(`[v0] Tasks fetch failed: ${response.status}`)
        toast({
          title: "Erreur",
          description: `Erreur ${response.status}: Impossible de charger les tâches`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Network error fetching tasks:", error)
      toast({
        title: "Erreur",
        description: "Erreur de connexion lors du chargement des tâches",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateTaskStatus = async (taskId: string, status: string) => {
    if (!token) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour effectuer cette action",
        variant: "destructive",
      })
      return
    }

    try {
      console.log("[v0] Updating task status:", taskId, "to", status)

      const updateData: any = { status }
      if (status === "terminee") {
        updateData.progress_percentage = 100
      }

      const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        let data
        try {
          const responseText = await response.text()
          if (responseText) {
            data = JSON.parse(responseText)
          }
        } catch (parseError) {
          console.error("[v0] Error parsing update response:", parseError)
          throw new Error("Invalid JSON response from update API")
        }

        if (data?.success) {
          const updatedTasks = tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  status: status as Task["status"],
                  progress_percentage: status === "terminee" ? 100 : task.progress_percentage,
                }
              : task,
          )
          setTasks(updatedTasks)
          filterTasks(filter, searchQuery)

          if (selectedTask?.id === taskId) {
            setSelectedTask({
              ...selectedTask,
              status: status as Task["status"],
              progress_percentage: status === "terminee" ? 100 : selectedTask.progress_percentage,
            })
          }

          toast({
            title: "Succès",
            description:
              status === "terminee"
                ? "Tâche marquée comme terminée avec progression à 100%"
                : "Statut de la tâche mis à jour",
          })
        } else {
          toast({
            title: "Erreur",
            description: data?.error || "Impossible de mettre à jour la tâche",
            variant: "destructive",
          })
        }
      } else {
        toast({
          title: "Erreur",
          description: `Erreur ${response.status}: ${response.statusText}`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Error updating task:", error)
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour",
        variant: "destructive",
      })
    }
  }

  const updateTaskProgress = async (taskId: string, progress: number) => {
    if (!token) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour effectuer cette action",
        variant: "destructive",
      })
      return
    }

    try {
      setUpdatingProgress(taskId)
      console.log("[v0] Updating task progress:", taskId, "to", progress + "%")

      const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ progress_percentage: progress }),
      })

      if (response.ok) {
        let data
        try {
          const responseText = await response.text()
          if (responseText) {
            data = JSON.parse(responseText)
          }
        } catch (parseError) {
          console.error("[v0] Error parsing progress update response:", parseError)
          throw new Error("Invalid JSON response from progress update API")
        }

        if (data?.success) {
          const updatedTasks = tasks.map((task) =>
            task.id === taskId ? { ...task, progress_percentage: progress } : task,
          )
          setTasks(updatedTasks)
          filterTasks(filter, searchQuery)

          if (selectedTask?.id === taskId) {
            setSelectedTask({ ...selectedTask, progress_percentage: progress })
          }

          toast({
            title: "Succès",
            description: `Progression mise à jour à ${progress}%`,
          })
        } else {
          toast({
            title: "Erreur",
            description: data?.error || "Impossible de mettre à jour la progression",
            variant: "destructive",
          })
        }
      } else {
        toast({
          title: "Erreur",
          description: `Erreur ${response.status}: ${response.statusText}`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Error updating task progress:", error)
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour de la progression",
        variant: "destructive",
      })
    } finally {
      setUpdatingProgress(null)
    }
  }

  const deleteTask = async (taskId: string) => {
    if (!token) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour effectuer cette action",
        variant: "destructive",
      })
      return
    }

    try {
      console.log("[v0] Deleting task:", taskId)

      const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      })

      if (response.ok) {
        let data
        try {
          const responseText = await response.text()
          if (responseText) {
            data = JSON.parse(responseText)
          }
        } catch (parseError) {
          console.error("[v0] Error parsing delete response:", parseError)
          throw new Error("Invalid JSON response from delete API")
        }

        if (data?.success) {
          toast({
            title: "Succès",
            description: "Tâche supprimée avec succès",
          })
          setSelectedTask(null)
          fetchTasks()
        } else {
          toast({
            title: "Erreur",
            description: data?.error || "Impossible de supprimer la tâche",
            variant: "destructive",
          })
        }
      } else {
        toast({
          title: "Erreur",
          description: `Erreur ${response.status}: ${response.statusText}`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Error deleting task:", error)
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    if (token) {
      fetchTasks()
    }
  }, [token])

  const filterTasks = (filterType: string, query: string) => {
    let filtered = [...tasks]

    if (filterType !== "all") {
      filtered = filtered.filter((task) => task.status === filterType)
    }

    if (query) {
      const lowercaseQuery = query.toLowerCase()
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(lowercaseQuery) ||
          task.description.toLowerCase().includes(lowercaseQuery) ||
          task.category.toLowerCase().includes(lowercaseQuery) ||
          task.event?.title?.toLowerCase().includes(lowercaseQuery),
      )
    }

    setVisibleTasks(filtered)

    const grouped = filtered.reduce((acc: GroupedTasks, task: Task) => {
      const eventId = task.event_id || "no-event"
      const eventTitle = task.event?.title || "Événement sans nom"

      if (!acc[eventId]) {
        acc[eventId] = {
          eventTitle,
          tasks: [],
        }
      }

      acc[eventId].tasks.push(task)
      return acc
    }, {})

    setGroupedTasks(grouped)
  }

  const handleFilterChange = (filterType: string) => {
    setFilter(filterType)
    filterTasks(filterType, searchQuery)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    filterTasks(filter, query)
  }

  const toggleStar = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation()
    const task = tasks.find((t) => t.id === id)
    if (task) {
      await updateTaskStatus(id, task.status)
      const updatedTasks = tasks.map((task) => (task.id === id ? { ...task, is_starred: !task.is_starred } : task))
      setTasks(updatedTasks)
      filterTasks(filter, searchQuery)
    }
  }

  const isOverdue = (deadline: string) => {
    return new Date(deadline) < new Date() && selectedTask?.status !== "terminee"
  }

  const InteractiveProgress = ({
    value,
    taskId,
    size = "default",
    showPercentage = true,
  }: {
    value: number
    taskId: string
    size?: "small" | "default"
    showPercentage?: boolean
  }) => {
    const [isEditing, setIsEditing] = useState(false)
    const [tempValue, setTempValue] = useState([value])

    const handleProgressClick = (e: React.MouseEvent) => {
      e.stopPropagation()
      setIsEditing(true)
      setTempValue([value])
    }

    const handleProgressSave = () => {
      updateTaskProgress(taskId, tempValue[0])
      setIsEditing(false)
    }

    const handleProgressCancel = () => {
      setTempValue([value])
      setIsEditing(false)
    }

    if (isEditing) {
      return (
        <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between text-xs">
            <span>Ajuster la progression</span>
            <span className="font-medium">{tempValue[0]}%</span>
          </div>
          <Slider value={tempValue} onValueChange={setTempValue} max={100} step={5} className="w-full" />
          <div className="flex items-center space-x-2">
            <Button size="sm" onClick={handleProgressSave} disabled={updatingProgress === taskId}>
              {updatingProgress === taskId ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <CheckCircle className="h-3 w-3 mr-1" />
              )}
              Sauvegarder
            </Button>
            <Button size="sm" variant="outline" onClick={handleProgressCancel}>
              <X className="h-3 w-3 mr-1" />
              Annuler
            </Button>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-2">
        {showPercentage && (
          <div className="flex items-center justify-between text-xs">
            <span>Progression</span>
            <span>{value}%</span>
          </div>
        )}
        <div
          className="relative cursor-pointer group"
          onClick={handleProgressClick}
          title="Cliquez pour modifier la progression"
        >
          <Progress
            value={value}
            className={cn("transition-all duration-200 group-hover:shadow-sm", size === "small" ? "h-1" : "h-2")}
          />
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-background">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Chargement des tâches...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-6 flex items-center justify-between border-b">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-medium">Tâches</h1>
          <Badge variant="outline" className="rounded-full px-3 py-0.5 text-xs font-normal">
            {visibleTasks.length} tâche{visibleTasks.length > 1 ? "s" : ""}
          </Badge>
        </div>

        <div className="flex items-center space-x-2">
          {showSearch ? (
            <div className="relative">
              <Input
                placeholder="Rechercher..."
                className="w-64 pr-8"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                autoFocus
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() => {
                  setShowSearch(false)
                  setSearchQuery("")
                  filterTasks(filter, "")
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="icon" onClick={() => setShowSearch(true)}>
              <Search className="h-5 w-5" />
            </Button>
          )}

          <Button className="rounded-full" onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle tâche
          </Button>
        </div>
      </div>

      <div className="px-6 py-4 flex items-center space-x-2 border-b">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          className="rounded-full"
          onClick={() => handleFilterChange("all")}
        >
          Toutes
        </Button>
        <Button
          variant={filter === "en_cours" ? "default" : "outline"}
          size="sm"
          className="rounded-full"
          onClick={() => handleFilterChange("en_cours")}
        >
          En cours
        </Button>
        <Button
          variant={filter === "a_faire" ? "default" : "outline"}
          size="sm"
          className="rounded-full"
          onClick={() => handleFilterChange("a_faire")}
        >
          À faire
        </Button>
        <Button
          variant={filter === "terminee" ? "default" : "outline"}
          size="sm"
          className="rounded-full"
          onClick={() => handleFilterChange("terminee")}
        >
          Terminées
        </Button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className={cn("w-full md:w-2/5 overflow-y-auto p-6", selectedTask ? "hidden md:block" : "block")}>
          <AnimatePresence>
            {Object.keys(groupedTasks).length > 0 ? (
              Object.entries(groupedTasks).map(([eventId, eventGroup]) => (
                <div key={eventId} className="mb-8">
                  <div className="flex items-center mb-4 pb-2 border-b">
                    <h3 className="text-lg font-semibold text-primary">{eventGroup.eventTitle}</h3>
                    <Badge variant="outline" className="ml-2 rounded-full">
                      {eventGroup.tasks.length} tâche{eventGroup.tasks.length > 1 ? "s" : ""}
                    </Badge>
                  </div>

                  {eventGroup.tasks.map((task) => {
                    const StatusIcon = statusIcons[task.status]
                    const isTaskOverdue = isOverdue(task.deadline)

                    return (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                          "mb-4 p-4 rounded-xl cursor-pointer transition-all bg-card hover:bg-muted/50",
                          selectedTask?.id === task.id ? "ring-2 ring-primary/20" : "hover:shadow-sm",
                          isTaskOverdue && "border-l-4 border-red-500",
                        )}
                        onClick={() => setSelectedTask(task)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={task.creator?.avatar || "/placeholder.svg"}
                                alt={`${task.creator?.first_name} ${task.creator?.last_name}` || "User"}
                              />
                              <AvatarFallback>
                                {task.creator
                                  ? `${task.creator.first_name.charAt(0)}${task.creator.last_name.charAt(0)}`
                                  : "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-sm">
                                {task.creator
                                  ? `${task.creator.first_name} ${task.creator.last_name}`
                                  : "Créateur inconnu"}
                              </div>
                              <div className="text-xs text-muted-foreground">{task.category}</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={cn("text-xs", priorityColors[task.priority])}>
                              {priorityLabels[task.priority]}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={(e) => toggleStar(task.id, e)}
                            >
                              <Star className={cn("h-4 w-4", task.is_starred ? "fill-amber-400 text-amber-400" : "")} />
                            </Button>
                          </div>
                        </div>

                        <h3 className="font-medium mb-2">{task.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{task.description}</p>

                        <div className="mb-3">
                          <InteractiveProgress value={task.progress_percentage || 0} taskId={task.id} size="small" />
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              <span className={isTaskOverdue ? "text-red-500 font-medium" : ""}>
                                {new Date(task.deadline).toLocaleDateString("fr-FR")}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {task.actual_hours}h/{task.estimated_hours}h
                            </div>
                          </div>
                          <Badge className={cn("text-xs flex items-center gap-1", statusColors[task.status])}>
                            {StatusIcon && React.createElement(StatusIcon, { className: "h-3 w-3" })}
                            {statusLabels[task.status]}
                          </Badge>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-64 p-4 text-center"
              >
                <div className="bg-muted/50 p-4 rounded-full mb-4">
                  <CheckSquare className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-1">Aucune tâche</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? "Aucune tâche ne correspond à votre recherche" : "Créez votre première tâche"}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {selectedTask ? (
            <motion.div
              className="flex-1 bg-background md:border-l overflow-y-auto"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="sticky top-0 bg-background z-10 p-6 border-b">
                <div className="flex items-center justify-between mb-4">
                  <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedTask(null)}>
                    <X className="h-5 w-5" />
                  </Button>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon" onClick={(e) => toggleStar(selectedTask.id, e)}>
                      <Star className={cn("h-4 w-4", selectedTask.is_starred ? "fill-amber-400 text-amber-400" : "")} />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateTaskStatus(selectedTask.id, "terminee")}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Marquer terminée
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => deleteTask(selectedTask.id)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="flex items-center space-x-3 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={selectedTask.creator?.avatar || "/placeholder.svg"}
                      alt={`${selectedTask.creator?.first_name} ${selectedTask.creator?.last_name}` || "User"}
                    />
                    <AvatarFallback>
                      {selectedTask.creator
                        ? `${selectedTask.creator.first_name.charAt(0)}${selectedTask.creator.last_name.charAt(0)}`
                        : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {selectedTask.creator
                        ? `${selectedTask.creator.first_name} ${selectedTask.creator.last_name}`
                        : "Créateur inconnu"}
                    </div>
                    <div className="text-sm text-muted-foreground">Créateur • {selectedTask.category}</div>
                  </div>
                </div>

                <h2 className="text-2xl font-medium mb-2">{selectedTask.title}</h2>
                <div className="flex items-center space-x-2 mb-4">
                  <Badge className={cn(statusColors[selectedTask.status])}>
                    {statusIcons[selectedTask.status] &&
                      React.createElement(statusIcons[selectedTask.status], { className: "h-3 w-3 mr-1" })}
                    {statusLabels[selectedTask.status]}
                  </Badge>
                  <Badge className={cn(priorityColors[selectedTask.priority])}>
                    {priorityLabels[selectedTask.priority]}
                  </Badge>
                  {isOverdue(selectedTask.deadline) && <Badge variant="destructive">En retard</Badge>}
                </div>
              </div>

              <div className="p-6 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{selectedTask.description}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Progression</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <InteractiveProgress
                      value={selectedTask.progress_percentage || 0}
                      taskId={selectedTask.id}
                      size="default"
                      showPercentage={true}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Échéance</div>
                          <div
                            className={cn(
                              "text-sm",
                              isOverdue(selectedTask.deadline) ? "text-red-500 font-medium" : "text-muted-foreground",
                            )}
                          >
                            {new Date(selectedTask.deadline).toLocaleDateString("fr-FR")}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Temps estimé</div>
                          <div className="text-sm text-muted-foreground">{selectedTask.estimated_hours}h</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Temps passé</div>
                          <div className="text-sm text-muted-foreground">{selectedTask.actual_hours}h</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Événement associé</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <h3 className="font-medium">{selectedTask.event?.title || "Événement sans nom"}</h3>
                  </CardContent>
                </Card>

                <div className="flex space-x-2">
                  <Button>
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier la tâche
                  </Button>
                  <Button variant="outline" onClick={() => updateTaskStatus(selectedTask.id, "terminee")}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Marquer terminée
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="hidden md:flex flex-1 items-center justify-center bg-muted/5">
              <div className="text-center max-w-md p-8">
                <div className="bg-primary/5 p-6 rounded-full inline-block mb-4">
                  <CheckSquare className="h-10 w-10 text-primary/80" />
                </div>
                <h3 className="text-xl font-medium mb-2">Gestion des tâches</h3>
                <p className="text-muted-foreground mb-6">
                  Sélectionnez une tâche dans la liste pour voir ses détails et suivre sa progression.
                </p>

                {showCreateForm ? (
                  <CreateTaskForm
                    onTaskCreated={() => {
                      fetchTasks()
                      setShowCreateForm(false)
                    }}
                  />
                ) : (
                  <Button onClick={() => setShowCreateForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Créer une tâche
                  </Button>
                )}
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
