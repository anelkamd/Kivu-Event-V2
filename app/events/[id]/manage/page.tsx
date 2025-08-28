"use client"

import { useState, useEffect, use } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button, Input } from "@/components/ui"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Plus, Mail, CheckCircle, Clock, Package, ClipboardList, BarChart3, Settings } from "lucide-react"
import axios from "@/lib/axios"

interface EventManageProps {
  params: Promise<{ id: string }>
}

export default function EventManage({ params }: EventManageProps) {
  const resolvedParams = use(params)
  const eventId = resolvedParams.id

  const [event, setEvent] = useState(null)
  const [moderators, setModerators] = useState([])
  const [tasks, setTasks] = useState([])
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [resourceModalOpen, setResourceModalOpen] = useState(false)

  // États pour les formulaires
  const [inviteForm, setInviteForm] = useState({
    email: "",
    role: "moderateur",
    message: "",
  })

  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    priority: "normale",
    deadline: "",
    assignedTo: "",
    moderatorId: "",
    validationRequired: true,
    category: "",
    estimatedHours: "",
    budgetAllocated: "",
  })

  const [resourceForm, setResourceForm] = useState({
    name: "",
    description: "",
    type: "materiel",
    quantity: 1,
    unit: "",
    costPerUnit: 0,
    supplier: "",
    contactInfo: "",
    notes: "",
  })

  useEffect(() => {
    fetchEventData()
  }, [eventId])

  const fetchEventData = async () => {
    try {
      const token = localStorage.getItem("token")

      // Récupérer les données de l'événement
      const [eventRes, moderatorsRes, tasksRes, resourcesRes] = await Promise.all([
        axios.get(`/api/events/${eventId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`/api/moderator/events/${eventId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`/api/tasks/event/${eventId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`/api/resources/event/${eventId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      setEvent(eventRes.data.data)
      setModerators(moderatorsRes.data.data)
      setTasks(tasksRes.data.data)
      setResources(resourcesRes.data.data)
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error)
    } finally {
      setLoading(false)
    }
  }

  const inviteModerator = async () => {
    try {
      const token = localStorage.getItem("token")

      await axios.post(`/api/moderator/events/${eventId}/invite`, inviteForm, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setInviteModalOpen(false)
      setInviteForm({ email: "", role: "moderateur", message: "" })
      fetchEventData()
    } catch (error) {
      console.error("Erreur lors de l'invitation:", error)
    }
  }

  const createTask = async () => {
    try {
      const token = localStorage.getItem("token")

      await axios.post(
        "/api/tasks",
        {
          ...taskForm,
          eventId,
          deadline: taskForm.deadline ? new Date(taskForm.deadline).toISOString() : null,
          estimatedHours: taskForm.estimatedHours ? Number.parseFloat(taskForm.estimatedHours) : null,
          budgetAllocated: taskForm.budgetAllocated ? Number.parseFloat(taskForm.budgetAllocated) : 0,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      setTaskModalOpen(false)
      setTaskForm({
        title: "",
        description: "",
        priority: "normale",
        deadline: "",
        assignedTo: "",
        moderatorId: "",
        validationRequired: true,
        category: "",
        estimatedHours: "",
        budgetAllocated: "",
      })
      fetchEventData()
    } catch (error) {
      console.error("Erreur lors de la création de la tâche:", error)
    }
  }

  const createResource = async () => {
    try {
      const token = localStorage.getItem("token")

      await axios.post(
        "/api/resources",
        {
          ...resourceForm,
          eventId,
          quantity: Number.parseInt(resourceForm.quantity),
          costPerUnit: Number.parseFloat(resourceForm.costPerUnit),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      setResourceModalOpen(false)
      setResourceForm({
        name: "",
        description: "",
        type: "materiel",
        quantity: 1,
        unit: "",
        costPerUnit: 0,
        supplier: "",
        contactInfo: "",
        notes: "",
      })
      fetchEventData()
    } catch (error) {
      console.error("Erreur lors de la création de la ressource:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "terminee":
        return "default"
      case "validee":
        return "default"
      case "en_cours":
        return "secondary"
      case "en_attente_validation":
        return "destructive"
      case "rejetee":
        return "destructive"
      case "a_faire":
        return "outline"
      default:
        return "outline"
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
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
              <h1 className="text-3xl font-bold text-gray-900">{event?.title}</h1>
              <p className="text-gray-600">Gestion complète de l'événement</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">{event?.status}</Badge>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Paramètres
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Modérateurs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{moderators.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tâches</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tasks.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ressources</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{resources.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Budget total</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {resources.reduce((sum, r) => sum + r.quantity * r.costPerUnit, 0).toFixed(2)}€
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contenu principal */}
        <Tabs defaultValue="moderators" className="space-y-6">
          <TabsList>
            <TabsTrigger value="moderators">Modérateurs</TabsTrigger>
            <TabsTrigger value="tasks">Tâches</TabsTrigger>
            <TabsTrigger value="resources">Ressources</TabsTrigger>
            <TabsTrigger value="analytics">Analytiques</TabsTrigger>
          </TabsList>

          <TabsContent value="moderators" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Modérateurs assignés</CardTitle>
                    <CardDescription>Gérez les modérateurs qui supervisent cet événement</CardDescription>
                  </div>
                  <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Inviter un modérateur
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Inviter un modérateur</DialogTitle>
                        <DialogDescription>Envoyez une invitation par email à un nouveau modérateur</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={inviteForm.email}
                            onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                            placeholder="moderateur@example.com"
                          />
                        </div>
                        <div>
                          <Label htmlFor="role">Rôle</Label>
                          <Select
                            value={inviteForm.role}
                            onValueChange={(value) => setInviteForm({ ...inviteForm, role: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="moderateur">Modérateur</SelectItem>
                              <SelectItem value="superviseur">Superviseur</SelectItem>
                              <SelectItem value="validateur">Validateur</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="message">Message personnalisé (optionnel)</Label>
                          <Textarea
                            id="message"
                            value={inviteForm.message}
                            onChange={(e) => setInviteForm({ ...inviteForm, message: e.target.value })}
                            placeholder="Message d'accompagnement pour l'invitation..."
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setInviteModalOpen(false)}>
                            Annuler
                          </Button>
                          <Button onClick={inviteModerator}>
                            <Mail className="h-4 w-4 mr-2" />
                            Envoyer l'invitation
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {moderators.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucun modérateur assigné</h3>
                    <p className="text-gray-600 mb-4">Invitez des modérateurs pour superviser cet événement</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {moderators.map((assignment) => (
                      <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold">
                              {assignment.moderator.firstName} {assignment.moderator.lastName}
                            </h4>
                            <p className="text-sm text-gray-600">{assignment.moderator.email}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="secondary">{assignment.role}</Badge>
                              {assignment.moderator.isActive ? (
                                <Badge variant="default" className="bg-green-100 text-green-800">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Actif
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-orange-600">
                                  <Clock className="h-3 w-3 mr-1" />
                                  En attente
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            Modifier
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 bg-transparent">
                            Révoquer
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Gestion des tâches</CardTitle>
                    <CardDescription>Créez et assignez des tâches pour votre événement</CardDescription>
                  </div>
                  <Dialog open={taskModalOpen} onOpenChange={setTaskModalOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Créer une tâche
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Créer une nouvelle tâche</DialogTitle>
                        <DialogDescription>
                          Définissez une tâche et assignez-la à un membre de l'équipe
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="title">Titre</Label>
                            <Input
                              id="title"
                              value={taskForm.title}
                              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                              placeholder="Titre de la tâche"
                            />
                          </div>
                          <div>
                            <Label htmlFor="category">Catégorie</Label>
                            <Input
                              id="category"
                              value={taskForm.category}
                              onChange={(e) => setTaskForm({ ...taskForm, category: e.target.value })}
                              placeholder="Ex: Logistique, Communication..."
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={taskForm.description}
                            onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                            placeholder="Description détaillée de la tâche"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="priority">Priorité</Label>
                            <Select
                              value={taskForm.priority}
                              onValueChange={(value) => setTaskForm({ ...taskForm, priority: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="basse">Basse</SelectItem>
                                <SelectItem value="normale">Normale</SelectItem>
                                <SelectItem value="haute">Haute</SelectItem>
                                <SelectItem value="critique">Critique</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="deadline">Date limite</Label>
                            <Input
                              id="deadline"
                              type="datetime-local"
                              value={taskForm.deadline}
                              onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="estimatedHours">Heures estimées</Label>
                            <Input
                              id="estimatedHours"
                              type="number"
                              step="0.5"
                              value={taskForm.estimatedHours}
                              onChange={(e) => setTaskForm({ ...taskForm, estimatedHours: e.target.value })}
                              placeholder="Ex: 2.5"
                            />
                          </div>
                          <div>
                            <Label htmlFor="budgetAllocated">Budget alloué (€)</Label>
                            <Input
                              id="budgetAllocated"
                              type="number"
                              step="0.01"
                              value={taskForm.budgetAllocated}
                              onChange={(e) => setTaskForm({ ...taskForm, budgetAllocated: e.target.value })}
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setTaskModalOpen(false)}>
                            Annuler
                          </Button>
                          <Button onClick={createTask}>
                            <Plus className="h-4 w-4 mr-2" />
                            Créer la tâche
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {tasks.length === 0 ? (
                  <div className="text-center py-8">
                    <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucune tâche créée</h3>
                    <p className="text-gray-600 mb-4">Créez des tâches pour organiser le travail de votre équipe</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tasks.map((task) => (
                      <div key={task.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-semibold">{task.title}</h4>
                              <Badge variant={getPriorityColor(task.priority)}>{task.priority}</Badge>
                              <Badge variant={getStatusColor(task.status)}>{task.status.replace("_", " ")}</Badge>
                            </div>
                            <p className="text-gray-600 text-sm mb-2">{task.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              {task.deadline && <span>📅 {new Date(task.deadline).toLocaleDateString("fr-FR")}</span>}
                              {task.category && <span>🏷️ {task.category}</span>}
                              {task.estimatedHours && <span>⏱️ {task.estimatedHours}h</span>}
                              {task.budgetAllocated > 0 && <span>💰 {task.budgetAllocated}€</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${task.progressPercentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{task.progressPercentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Gestion des ressources</CardTitle>
                    <CardDescription>Gérez les ressources nécessaires pour votre événement</CardDescription>
                  </div>
                  <Dialog open={resourceModalOpen} onOpenChange={setResourceModalOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter une ressource
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Ajouter une ressource</DialogTitle>
                        <DialogDescription>Définissez une nouvelle ressource pour votre événement</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="name">Nom</Label>
                            <Input
                              id="name"
                              value={resourceForm.name}
                              onChange={(e) => setResourceForm({ ...resourceForm, name: e.target.value })}
                              placeholder="Nom de la ressource"
                            />
                          </div>
                          <div>
                            <Label htmlFor="type">Type</Label>
                            <Select
                              value={resourceForm.type}
                              onValueChange={(value) => setResourceForm({ ...resourceForm, type: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="salle">Salle</SelectItem>
                                <SelectItem value="materiel">Matériel</SelectItem>
                                <SelectItem value="budget">Budget</SelectItem>
                                <SelectItem value="personnel">Personnel</SelectItem>
                                <SelectItem value="transport">Transport</SelectItem>
                                <SelectItem value="autre">Autre</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={resourceForm.description}
                            onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })}
                            placeholder="Description de la ressource"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="quantity">Quantité</Label>
                            <Input
                              id="quantity"
                              type="number"
                              value={resourceForm.quantity}
                              onChange={(e) => setResourceForm({ ...resourceForm, quantity: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="unit">Unité</Label>
                            <Input
                              id="unit"
                              value={resourceForm.unit}
                              onChange={(e) => setResourceForm({ ...resourceForm, unit: e.target.value })}
                              placeholder="Ex: pièce, heure, jour"
                            />
                          </div>
                          <div>
                            <Label htmlFor="costPerUnit">Coût unitaire (€)</Label>
                            <Input
                              id="costPerUnit"
                              type="number"
                              step="0.01"
                              value={resourceForm.costPerUnit}
                              onChange={(e) => setResourceForm({ ...resourceForm, costPerUnit: e.target.value })}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="supplier">Fournisseur</Label>
                          <Input
                            id="supplier"
                            value={resourceForm.supplier}
                            onChange={(e) => setResourceForm({ ...resourceForm, supplier: e.target.value })}
                            placeholder="Nom du fournisseur"
                          />
                        </div>
                        <div>
                          <Label htmlFor="contactInfo">Informations de contact</Label>
                          <Textarea
                            id="contactInfo"
                            value={resourceForm.contactInfo}
                            onChange={(e) => setResourceForm({ ...resourceForm, contactInfo: e.target.value })}
                            placeholder="Email, téléphone, adresse..."
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setResourceModalOpen(false)}>
                            Annuler
                          </Button>
                          <Button onClick={createResource}>
                            <Plus className="h-4 w-4 mr-2" />
                            Ajouter la ressource
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {resources.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucune ressource définie</h3>
                    <p className="text-gray-600 mb-4">Ajoutez des ressources pour planifier votre événement</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {resources.map((resource) => (
                      <Card key={resource.id}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{resource.name}</CardTitle>
                            <Badge variant="outline">{resource.type}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600">{resource.description}</p>
                            <div className="flex justify-between text-sm">
                              <span>Quantité:</span>
                              <span>
                                {resource.quantity} {resource.unit}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Coût unitaire:</span>
                              <span>{resource.costPerUnit}€</span>
                            </div>
                            <div className="flex justify-between text-sm font-semibold">
                              <span>Total:</span>
                              <span>{(resource.quantity * resource.costPerUnit).toFixed(2)}€</span>
                            </div>
                            {resource.supplier && (
                              <div className="text-sm text-gray-600">
                                <strong>Fournisseur:</strong> {resource.supplier}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytiques et rapports</CardTitle>
                <CardDescription>Suivez les performances et l'avancement de votre événement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Analytiques en développement</h3>
                  <p className="text-gray-600">Les rapports détaillés seront bientôt disponibles</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

import { useState } from "react"
import { Button, Input } from "@/components/ui"

export function InviteModeratorForm({ eventId }) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleInvite = async () => {
    setLoading(true)
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/moderator/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
      body: JSON.stringify({ email, eventId }),
    })
    const data = await res.json()
    setLoading(false)
    setSuccess(data.success)
  }

  return (
    <div>
      <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email du modérateur" />
      <Button onClick={handleInvite} disabled={loading || !email}>Inviter</Button>
      {success && <p className="text-green-600">Invitation envoyée !</p>}
    </div>
  )
}
