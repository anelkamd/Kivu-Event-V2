"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Calendar,
  Users,
  ClipboardList,
  TrendingUp,
  MessageSquare,
  Settings,
} from "lucide-react"
import axios from "@/lib/axios"

interface ModeratorDashboardData {
  events: Array<{
    id: string
    event: {
      id: string
      title: string
      description: string
      start_date: string
      end_date: string
      organizer: {
        id: string
        first_name: string
        last_name: string
        email: string
      }
    }
    role: string
    permissions: {
      canValidateTasks: boolean
      canAssignTasks: boolean
      canManageResources: boolean
      canViewReports: boolean
      canModerateComments: boolean
    }
  }>
  pendingTasks: Array<{
    id: string
    title: string
    description: string
    priority: string
    deadline: string
    progress_percentage: number
    event: {
      id: string
      title: string
    }
    assignedUser: {
      id: string
      first_name: string
      last_name: string
      email: string
    }
  }>
  statistics: {
    totalEvents: number
    totalPendingTasks: number
    tasksValidatedToday: number
  }
}

export default function ModeratorDashboard() {
  const [dashboardData, setDashboardData] = useState<ModeratorDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [validatingTask, setValidatingTask] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    // Récupérer le token depuis l'URL si présent
    const token = searchParams.get("token")
    if (token) {
      localStorage.setItem("moderator_token", token)
      // Nettoyer l'URL
      router.replace("/moderator/dashboard")
    }

    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("moderator_token")
      if (!token) {
        router.push("/moderator/login")
        return
      }

      const response = await axios.get("/api/moderator/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setDashboardData(response.data.data)
    } catch (error) {
      console.error("Erreur lors du chargement du dashboard:", error)
      if (error.response?.status === 401) {
        localStorage.removeItem("moderator_token")
        router.push("/moderator/login")
      }
    } finally {
      setLoading(false)
    }
  }

  const validateTask = async (taskId: string, action: "approve" | "reject", notes?: string) => {
    try {
      setValidatingTask(taskId)
      const token = localStorage.getItem("moderator_token")

      await axios.post(
        `/api/moderator/tasks/${taskId}/validate`,
        {
          action,
          notes,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      // Recharger les données
      await fetchDashboardData()
    } catch (error) {
      console.error("Erreur lors de la validation:", error)
    } finally {
      setValidatingTask(null)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critique":
        return "destructive"
      case "haute":
        return "destructive"
      case "normale":
        return "default"
      case "basse":
        return "secondary"
      default:
        return "default"
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "critique":
        return <AlertTriangle className="h-4 w-4" />
      case "haute":
        return <AlertTriangle className="h-4 w-4" />
      case "normale":
        return <Clock className="h-4 w-4" />
      case "basse":
        return <Clock className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Erreur de chargement</h3>
              <p className="text-gray-600 mb-4">Impossible de charger le dashboard</p>
              <Button onClick={fetchDashboardData}>Réessayer</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Modérateur</h1>
              <p className="text-gray-600">Gérez vos validations et supervisions</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Paramètres
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  localStorage.removeItem("moderator_token")
                  router.push("/moderator/login")
                }}
              >
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Événements assignés</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.statistics.totalEvents}</div>
              <p className="text-xs text-muted-foreground">Événements sous votre supervision</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tâches en attente</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{dashboardData.statistics.totalPendingTasks}</div>
              <p className="text-xs text-muted-foreground">Nécessitent votre validation</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Validées aujourd'hui</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{dashboardData.statistics.tasksValidatedToday}</div>
              <p className="text-xs text-muted-foreground">Tâches validées ce jour</p>
            </CardContent>
          </Card>
        </div>

        {/* Contenu principal */}
        <Tabs defaultValue="tasks" className="space-y-6">
          <TabsList>
            <TabsTrigger value="tasks">Tâches à valider</TabsTrigger>
            <TabsTrigger value="events">Mes événements</TabsTrigger>
            <TabsTrigger value="activity">Activité récente</TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tâches en attente de validation</CardTitle>
                <CardDescription>Validez ou rejetez les tâches soumises par les équipes</CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardData.pendingTasks.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucune tâche en attente</h3>
                    <p className="text-gray-600">Toutes les tâches ont été traitées !</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dashboardData.pendingTasks.map((task) => (
                      <div key={task.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-semibold">{task.title}</h4>
                              <Badge variant={getPriorityColor(task.priority)}>
                                {getPriorityIcon(task.priority)}
                                <span className="ml-1 capitalize">{task.priority}</span>
                              </Badge>
                            </div>
                            <p className="text-gray-600 text-sm mb-2">{task.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>📅 {new Date(task.deadline).toLocaleDateString("fr-FR")}</span>
                              <span>🎯 {task.event.title}</span>
                              <span>
                                👤 {task.assignedUser.first_name} {task.assignedUser.last_name}
                              </span>
                            </div>
                            <div className="mt-2">
                              <div className="flex items-center space-x-2">
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{ width: `${task.progress_percentage}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm text-gray-600">{task.progress_percentage}%</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 border-green-600 hover:bg-green-50 bg-transparent"
                              onClick={() => validateTask(task.id, "approve")}
                              disabled={validatingTask === task.id}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Valider
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-600 hover:bg-red-50 bg-transparent"
                              onClick={() => validateTask(task.id, "reject", "Nécessite des corrections")}
                              disabled={validatingTask === task.id}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Rejeter
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dashboardData.events.map((assignment) => (
                <Card key={assignment.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{assignment.event.title}</CardTitle>
                      <Badge variant="secondary">{assignment.role}</Badge>
                    </div>
                    <CardDescription className="line-clamp-2">{assignment.event.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>{new Date(assignment.event.start_date).toLocaleDateString("fr-FR")}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span>
                          Organisé par {assignment.event.organizer.first_name} {assignment.event.organizer.last_name}
                        </span>
                      </div>
                      <div className="pt-2">
                        <h5 className="text-sm font-medium mb-2">Permissions :</h5>
                        <div className="flex flex-wrap gap-1">
                          {assignment.permissions.canValidateTasks && (
                            <Badge variant="outline" className="text-xs">
                              Validation
                            </Badge>
                          )}
                          {assignment.permissions.canAssignTasks && (
                            <Badge variant="outline" className="text-xs">
                              Assignation
                            </Badge>
                          )}
                          {assignment.permissions.canManageResources && (
                            <Badge variant="outline" className="text-xs">
                              Ressources
                            </Badge>
                          )}
                          {assignment.permissions.canViewReports && (
                            <Badge variant="outline" className="text-xs">
                              Rapports
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="pt-4">
                      <Button
                        className="w-full bg-transparent"
                        variant="outline"
                        onClick={() => router.push(`/moderator/events/${assignment.event.id}`)}
                      >
                        Gérer l'événement
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Activité récente</CardTitle>
                <CardDescription>Vos dernières actions et validations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Fonctionnalité en développement</h3>
                  <p className="text-gray-600">L'historique d'activité sera bientôt disponible</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
