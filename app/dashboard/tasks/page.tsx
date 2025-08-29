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
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import CreateTaskForm from "@/components/CreateTaskForm"

interface Task {
  id: string
  title: string
  description: string
  priority: "basse" | "normale" | "haute" | "critique"
  status: "a_faire" | "en_cours" | "en_attente_validation" | "validee" | "rejetee" | "terminee" | "annulee"
  category: string
  estimatedHours: number
  actualHours: number
  deadline: string
  assignedTo: {
    name: string
    avatar?: string
  }
  eventTitle: string
  progressPercentage: number
  isStarred: boolean
}

const mockTasks: Task[] = [
  {
    id: "1",
    title: "Confirmer le lieu de la conférence",
    description: "Contacter l'hôtel Marriott pour confirmer la réservation de la salle principale",
    priority: "critique",
    status: "en_cours",
    category: "Logistique",
    estimatedHours: 2,
    actualHours: 1.5,
    deadline: "2024-03-10",
    assignedTo: {
      name: "Marie Lukaku",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    eventTitle: "Conférence Tech Kivu 2024",
    progressPercentage: 75,
    isStarred: true,
  },
  {
    id: "2",
    title: "Préparer les supports de présentation",
    description: "Créer les slides pour la présentation d'ouverture",
    priority: "haute",
    status: "a_faire",
    category: "Contenu",
    estimatedHours: 8,
    actualHours: 0,
    deadline: "2024-03-12",
    assignedTo: {
      name: "Jean Kabongo",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    eventTitle: "Workshop Développement Web",
    progressPercentage: 0,
    isStarred: false,
  },
  {
    id: "3",
    title: "Envoyer les invitations",
    description: "Envoyer les invitations par email à tous les participants confirmés",
    priority: "normale",
    status: "terminee",
    category: "Communication",
    estimatedHours: 3,
    actualHours: 2.5,
    deadline: "2024-03-08",
    assignedTo: {
      name: "Paul Mbuyi",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    eventTitle: "Networking Business",
    progressPercentage: 100,
    isStarred: true,
  },
]

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
  const [filter, setFilter] = useState<string>("all")
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const [visibleTasks, setVisibleTasks] = useState<Task[]>(mockTasks)
  const [eventId, setEventId] = useState("")
  const [events, setEvents] = useState([])

  useEffect(() => {
    // Récupère les événements de l'utilisateur
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events/my-events`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => setEvents(data.data || []))
  }, [])

  const filterTasks = (filterType: string, query: string) => {
    let filtered = [...mockTasks]

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
          task.eventTitle.toLowerCase().includes(lowercaseQuery),
      )
    }

    setVisibleTasks(filtered)
  }

  const handleFilterChange = (filterType: string) => {
    setFilter(filterType)
    filterTasks(filterType, searchQuery)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    filterTasks(filter, query)
  }

  const toggleStar = (id: string, event: React.MouseEvent) => {
    event.stopPropagation()
    const updatedTasks = mockTasks.map((task) => (task.id === id ? { ...task, isStarred: !task.isStarred } : task))
    mockTasks.splice(0, mockTasks.length, ...updatedTasks)
    filterTasks(filter, searchQuery)
  }

  const isOverdue = (deadline: string) => {
    return new Date(deadline) < new Date() && selectedTask?.status !== "terminee"
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
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

          <Button className="rounded-full">
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle tâche
          </Button>
        </div>
      </div>

      {/* Filter chips */}
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

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Tasks list */}
        <div className={cn("w-full md:w-2/5 overflow-y-auto p-6", selectedTask ? "hidden md:block" : "block")}>
          <AnimatePresence>
            {visibleTasks.length > 0 ? (
              visibleTasks.map((task) => {
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
                          <AvatarImage src={task.assignedTo.avatar || "/placeholder.svg"} alt={task.assignedTo.name} />
                          <AvatarFallback>{task.assignedTo.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">{task.assignedTo.name}</div>
                          <div className="text-xs text-muted-foreground">{task.category}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={cn("text-xs", priorityColors[task.priority])}>
                          {priorityLabels[task.priority]}
                        </Badge>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => toggleStar(task.id, e)}>
                          <Star className={cn("h-4 w-4", task.isStarred ? "fill-amber-400 text-amber-400" : "")} />
                        </Button>
                      </div>
                    </div>

                    <h3 className="font-medium mb-2">{task.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{task.description}</p>

                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between text-xs">
                        <span>Progression</span>
                        <span>{task.progressPercentage}%</span>
                      </div>
                      <Progress value={task.progressPercentage} className="h-1" />
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
                          {task.actualHours}h/{task.estimatedHours}h
                        </div>
                      </div>
                      <Badge className={cn("text-xs flex items-center gap-1", statusColors[task.status])}>
                        <StatusIcon className="h-3 w-3" />
                        {statusLabels[task.status]}
                      </Badge>
                    </div>
                  </motion.div>
                )
              })
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

        {/* Task detail */}
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
                      <Star className={cn("h-4 w-4", selectedTask.isStarred ? "fill-amber-400 text-amber-400" : "")} />
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
                        <DropdownMenuItem>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Marquer terminée
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
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
                      src={selectedTask.assignedTo.avatar || "/placeholder.svg"}
                      alt={selectedTask.assignedTo.name}
                    />
                    <AvatarFallback>{selectedTask.assignedTo.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{selectedTask.assignedTo.name}</div>
                    <div className="text-sm text-muted-foreground">Assigné • {selectedTask.category}</div>
                  </div>
                </div>

                <h2 className="text-2xl font-medium mb-2">{selectedTask.title}</h2>
                <div className="flex items-center space-x-2 mb-4">
                  <Badge className={cn(statusColors[selectedTask.status])}>
                    {React.createElement(statusIcons[selectedTask.status], { className: "h-3 w-3 mr-1" })}
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
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span>Avancement</span>
                        <span className="font-medium">{selectedTask.progressPercentage}%</span>
                      </div>
                      <Progress value={selectedTask.progressPercentage} className="h-2" />
                    </div>

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
                          <div className="text-sm text-muted-foreground">{selectedTask.estimatedHours}h</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Temps passé</div>
                          <div className="text-sm text-muted-foreground">{selectedTask.actualHours}h</div>
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
                    <h3 className="font-medium">{selectedTask.eventTitle}</h3>
                  </CardContent>
                </Card>

                <div className="flex space-x-2">
                  <Button>
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier la tâche
                  </Button>
                  <Button variant="outline">
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
                
                  <CreateTaskForm onTaskCreated={() => {/* refresh tasks if needed */}} />
                
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Create Task Form - Ajouté ici */}
      
    </div>
  )
}
