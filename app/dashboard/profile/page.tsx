"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Mail,
  Phone,
  Calendar,
  Users,
  Edit,
  Save,
  X,
  MapPin,
  Clock,
  Database,
  Plus,
  Trash2,
  RefreshCw,
  Settings,
  AlertTriangle,
  Loader2,
  Eye,
  Download,
} from "lucide-react"

interface UserProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  jobTitle?: string
  profileImage?: string
  role: string
  totalEvents: number
  publishedEvents: number
  draftEvents: number
  completedEvents: number
}

interface Event {
  id: string
  title: string
  description: string
  type: string
  startDate: string
  endDate: string
  capacity?: number
  status: string
  participantCount: number
  price: number
  venue?: {
    name: string
    address: string
    city: string
  }
  createdAt: string
}

interface DatabaseInfo {
  tables: Array<{
    name: string
    recordCount: number
    structure: Array<{
      Field: string
      Type: string
      Null: string
      Key: string
      Default: any
      Extra: string
    }>
  }>
  totalRecords: number
}

interface TableData {
  table: string
  records: any[]
  structure: Array<{
    Field: string
    Type: string
    Null: string
    Key: string
    Default: any
    Extra: string
  }>
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface Participant {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  jobTitle?: string
  status: string
  registrationDate: string
  hasAccount: boolean
}

interface ParticipantsData {
  event: {
    title: string
    capacity?: number
    startDate: string
  }
  participants: Participant[]
  statistics: {
    total: number
    registered: number
    attended: number
    cancelled: number
    noShow: number
  }
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [editData, setEditData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    jobTitle: "",
  })

  // États pour la gestion de base de données
  const [databaseInfo, setDatabaseInfo] = useState<DatabaseInfo | null>(null)
  const [selectedTable, setSelectedTable] = useState<string>("")
  const [tableData, setTableData] = useState<TableData | null>(null)
  const [databaseLoading, setDatabaseLoading] = useState(false)
  const [showAddRecord, setShowAddRecord] = useState(false)
  const [newRecord, setNewRecord] = useState<Record<string, any>>({})
  const [editingRecord, setEditingRecord] = useState<any>(null)

  // États pour la gestion des événements
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [showEditEvent, setShowEditEvent] = useState(false)
  const [eventEditData, setEventEditData] = useState({
    title: "",
    description: "",
    type: "",
    startDate: "",
    endDate: "",
    capacity: "",
    status: "",
    price: "",
  })

  // États pour les participants
  const [participantsData, setParticipantsData] = useState<ParticipantsData | null>(null)
  const [participantsLoading, setParticipantsLoading] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)

  const { toast } = useToast()

  // Récupérer les données du profil
  const fetchProfileData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")

      if (!token) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour accéder à cette page",
          variant: "destructive",
        })
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (data.success) {
        setUser(data.data.user)
        setEvents(data.data.events)
        setEditData({
          firstName: data.data.user.firstName,
          lastName: data.data.user.lastName,
          email: data.data.user.email,
          phone: data.data.user.phone || "",
          company: data.data.user.company || "",
          jobTitle: data.data.user.jobTitle || "",
        })
      } else {
        toast({
          title: "Erreur",
          description: data.error || "Erreur lors du chargement du profil",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erreur fetch:", error)
      toast({
        title: "Erreur",
        description: "Erreur de connexion au serveur",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Récupérer les informations de base de données
  const fetchDatabaseInfo = async () => {
    try {
      setDatabaseLoading(true)
      const token = localStorage.getItem("token")

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/database`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (data.success) {
        setDatabaseInfo(data.data)
      } else {
        toast({
          title: "Erreur",
          description: data.error || "Erreur lors du chargement des informations de base de données",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erreur:", error)
      toast({
        title: "Erreur",
        description: "Erreur de connexion au serveur",
        variant: "destructive",
      })
    } finally {
      setDatabaseLoading(false)
    }
  }

  // Récupérer les données d'une table
  const fetchTableData = async (tableName: string, page = 1) => {
    try {
      setDatabaseLoading(true)
      const token = localStorage.getItem("token")

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/database/${tableName}?page=${page}&limit=50`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      const data = await response.json()

      if (data.success) {
        setTableData(data.data)
        setSelectedTable(tableName)
      } else {
        toast({
          title: "Erreur",
          description: data.error || "Erreur lors du chargement des données de la table",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erreur:", error)
      toast({
        title: "Erreur",
        description: "Erreur de connexion au serveur",
        variant: "destructive",
      })
    } finally {
      setDatabaseLoading(false)
    }
  }

  // Créer les tables manquantes
  const createTables = async () => {
    try {
      setDatabaseLoading(true)
      const token = localStorage.getItem("token")

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/database`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "create_tables" }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Succès",
          description: "Tables créées avec succès",
        })
        fetchDatabaseInfo()
      } else {
        toast({
          title: "Erreur",
          description: data.error || "Erreur lors de la création des tables",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erreur:", error)
      toast({
        title: "Erreur",
        description: "Erreur de connexion au serveur",
        variant: "destructive",
      })
    } finally {
      setDatabaseLoading(false)
    }
  }

  // Ajouter un enregistrement
  const addRecord = async () => {
    try {
      setDatabaseLoading(true)
      const token = localStorage.getItem("token")

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/database`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "add_record",
          tableName: selectedTable,
          data: newRecord,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Succès",
          description: "Enregistrement ajouté avec succès",
        })
        setShowAddRecord(false)
        setNewRecord({})
        fetchTableData(selectedTable)
        fetchDatabaseInfo()
      } else {
        toast({
          title: "Erreur",
          description: data.error || "Erreur lors de l'ajout",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erreur:", error)
      toast({
        title: "Erreur",
        description: "Erreur de connexion au serveur",
        variant: "destructive",
      })
    } finally {
      setDatabaseLoading(false)
    }
  }

  // Supprimer un enregistrement
  const deleteRecord = async (id: any) => {
    try {
      setDatabaseLoading(true)
      const token = localStorage.getItem("token")

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/database`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "delete_record",
          tableName: selectedTable,
          data: { id },
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Succès",
          description: "Enregistrement supprimé avec succès",
        })
        fetchTableData(selectedTable)
        fetchDatabaseInfo()
      } else {
        toast({
          title: "Erreur",
          description: data.error || "Erreur lors de la suppression",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erreur:", error)
      toast({
        title: "Erreur",
        description: "Erreur de connexion au serveur",
        variant: "destructive",
      })
    } finally {
      setDatabaseLoading(false)
    }
  }

  // Supprimer un événement
  const deleteEvent = async (eventId: string) => {
    try {
      const token = localStorage.getItem("token")

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/database`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "delete_record",
          tableName: "events",
          data: { id: eventId },
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Succès",
          description: "Événement supprimé avec succès",
        })
        // Mettre à jour la liste des événements
        setEvents(events.filter((event) => event.id !== eventId))
        // Recharger les données du profil pour mettre à jour les statistiques
        fetchProfileData()
      } else {
        toast({
          title: "Erreur",
          description: data.error || "Erreur lors de la suppression de l'événement",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erreur:", error)
      toast({
        title: "Erreur",
        description: "Erreur de connexion au serveur",
        variant: "destructive",
      })
    }
  }

  // Modifier un événement
  const updateEvent = async () => {
    try {
      if (!editingEvent) return

      const token = localStorage.getItem("token")

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/database`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "update_record",
          tableName: "events",
          data: {
            id: editingEvent.id,
            title: eventEditData.title,
            description: eventEditData.description,
            type: eventEditData.type,
            start_date: eventEditData.startDate,
            end_date: eventEditData.endDate,
            capacity: Number.parseInt(eventEditData.capacity) || null,
            status: eventEditData.status,
            price: Number.parseInt(eventEditData.price) || 0,
          },
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Succès",
          description: "Événement modifié avec succès",
        })
        setShowEditEvent(false)
        setEditingEvent(null)
        // Recharger les données du profil
        fetchProfileData()
      } else {
        toast({
          title: "Erreur",
          description: data.error || "Erreur lors de la modification de l'événement",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erreur:", error)
      toast({
        title: "Erreur",
        description: "Erreur de connexion au serveur",
        variant: "destructive",
      })
    }
  }

  // Ouvrir le modal de modification d'événement
  const openEditEvent = (event: Event) => {
    setEditingEvent(event)
    setEventEditData({
      title: event.title,
      description: event.description,
      type: event.type,
      startDate: new Date(event.startDate).toISOString().slice(0, 16),
      endDate: new Date(event.endDate).toISOString().slice(0, 16),
      capacity: event.capacity?.toString() || "",
      status: event.status,
      price: event.price?.toString() || "0",
    })
    setShowEditEvent(true)
  }

  // Récupérer les participants d'un événement
  const fetchParticipants = async (eventId: string) => {
    try {
      setParticipantsLoading(true)
      const token = localStorage.getItem("token")

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events/${eventId}/participants`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (data.success) {
        setParticipantsData(data.data)
        setSelectedEventId(eventId)
      } else {
        toast({
          title: "Erreur",
          description: data.error || "Erreur lors du chargement des participants",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erreur:", error)
      toast({
        title: "Erreur",
        description: "Erreur de connexion au serveur",
        variant: "destructive",
      })
    } finally {
      setParticipantsLoading(false)
    }
  }

  // Mettre à jour le profil
  const updateProfile = async () => {
    try {
      const token = localStorage.getItem("token")

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editData),
      })

      const data = await response.json()

      if (data.success) {
        setUser((prev) => (prev ? { ...prev, ...data.data } : null))
        setEditMode(false)
        toast({
          title: "Succès",
          description: "Profil mis à jour avec succès",
        })
      } else {
        toast({
          title: "Erreur",
          description: data.error || "Erreur lors de la mise à jour",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erreur:", error)
      toast({
        title: "Erreur",
        description: "Erreur de connexion au serveur",
        variant: "destructive",
      })
    }
  }

  // Exporter les participants en CSV
  const exportParticipants = () => {
    if (!participantsData) return

    const csvContent = [
      ["Prénom", "Nom", "Email", "Téléphone", "Entreprise", "Poste", "Statut", "Date d'inscription"],
      ...participantsData.participants.map((p) => [
        p.firstName,
        p.lastName,
        p.email,
        p.phone || "",
        p.company || "",
        p.jobTitle || "",
        p.status,
        new Date(p.registrationDate).toLocaleDateString("fr-FR"),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute(
      "download",
      `participants-${participantsData.event.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.csv`,
    )
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Formater la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Obtenir la couleur du badge selon le statut
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      published: { label: "Publié", variant: "default" as const },
      draft: { label: "Brouillon", variant: "secondary" as const },
      completed: { label: "Terminé", variant: "outline" as const },
      cancelled: { label: "Annulé", variant: "destructive" as const },
    }

    return statusConfig[status as keyof typeof statusConfig] || { label: status, variant: "secondary" as const }
  }

  const getParticipantStatusBadge = (status: string) => {
    const statusConfig = {
      registered: { label: "Inscrit", variant: "default" as const },
      attended: { label: "Présent", variant: "default" as const },
      cancelled: { label: "Annulé", variant: "destructive" as const },
      "no-show": { label: "Absent", variant: "secondary" as const },
    }

    return statusConfig[status as keyof typeof statusConfig] || { label: status, variant: "secondary" as const }
  }

  // Générer les champs du formulaire pour un nouvel enregistrement
  const renderFormFields = () => {
    if (!tableData) return null

    return tableData.structure
      .filter((field) => field.Field !== "id" && field.Extra !== "auto_increment")
      .map((field) => (
        <div key={field.Field} className="space-y-2">
          <Label htmlFor={field.Field}>
            {field.Field}
            {field.Null === "NO" && <span className="text-red-500">*</span>}
          </Label>
          {field.Type.includes("text") || field.Type.includes("longtext") ? (
            <Textarea
              id={field.Field}
              value={newRecord[field.Field] || ""}
              onChange={(e) => setNewRecord((prev) => ({ ...prev, [field.Field]: e.target.value }))}
              placeholder={`Entrez ${field.Field}`}
            />
          ) : field.Type.includes("enum") ? (
            <Select
              value={newRecord[field.Field] || ""}
              onValueChange={(value) => setNewRecord((prev) => ({ ...prev, [field.Field]: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Sélectionnez ${field.Field}`} />
              </SelectTrigger>
              <SelectContent>
                {field.Type.match(/enum$$(.*)$$/)?.[1]
                  ?.split(",")
                  .map((option) => option.replace(/'/g, "").trim())
                  .map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id={field.Field}
              type={
                field.Type.includes("int")
                  ? "number"
                  : field.Type.includes("decimal")
                    ? "number"
                    : field.Type.includes("date")
                      ? "datetime-local"
                      : field.Type.includes("email")
                        ? "email"
                        : "text"
              }
              value={newRecord[field.Field] || ""}
              onChange={(e) => setNewRecord((prev) => ({ ...prev, [field.Field]: e.target.value }))}
              placeholder={`Entrez ${field.Field}`}
              step={field.Type.includes("decimal") ? "0.01" : undefined}
            />
          )}
          <p className="text-xs text-muted-foreground">
            Type: {field.Type} | {field.Null === "YES" ? "Optionnel" : "Requis"}
          </p>
        </div>
      ))
  }

  useEffect(() => {
    fetchProfileData()
  }, [])

  useEffect(() => {
    if (user?.role === "admin") {
      fetchDatabaseInfo()
    }
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Erreur lors du chargement du profil</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="events">Événements</TabsTrigger>
          {user.role === "admin" && <TabsTrigger value="database">Base de données</TabsTrigger>}
        </TabsList>

        <TabsContent value="profile" className="space-y-8">
          {/* En-tête du profil */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src={user.profileImage || "/placeholder.svg"}
                    alt={`${user.firstName} ${user.lastName}`}
                  />
                  <AvatarFallback className="text-lg">
                    {user.firstName.charAt(0)}
                    {user.lastName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-2xl">
                    {user.firstName} {user.lastName}
                  </CardTitle>
                  <CardDescription className="text-lg">Organisateur d'événements</CardDescription>
                  <Badge variant="outline" className="mt-2">
                    {user.role === "admin"
                      ? "Administrateur"
                      : user.role === "organizer"
                        ? "Organisateur"
                        : "Participant"}
                  </Badge>
                </div>
                <Button variant={editMode ? "outline" : "default"} onClick={() => setEditMode(!editMode)}>
                  {editMode ? <X className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
                  {editMode ? "Annuler" : "Modifier"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {editMode ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      value={editData.firstName}
                      onChange={(e) => setEditData((prev) => ({ ...prev, firstName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      value={editData.lastName}
                      onChange={(e) => setEditData((prev) => ({ ...prev, lastName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData((prev) => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      value={editData.phone}
                      onChange={(e) => setEditData((prev) => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Button onClick={updateProfile} className="w-full">
                      <Save className="h-4 w-4 mr-2" />
                      Sauvegarder les modifications
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <span>{user.email}</span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center space-x-3">
                        <Phone className="h-5 w-5 text-muted-foreground" />
                        <span>{user.phone}</span>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{user.totalEvents}</div>
                        <p className="text-xs text-muted-foreground">Total événements</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-green-600">{user.publishedEvents}</div>
                        <p className="text-xs text-muted-foreground">Publiés</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-yellow-600">{user.draftEvents}</div>
                        <p className="text-xs text-muted-foreground">Brouillons</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-blue-600">{user.completedEvents}</div>
                        <p className="text-xs text-muted-foreground">Terminés</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-8">
          {/* Liste des événements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Mes événements ({events.length})
              </CardTitle>
              <CardDescription>Liste de tous les événements que vous avez créés</CardDescription>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Vous n'avez pas encore créé d'événement</p>
                  <Button className="mt-4" onClick={() => (window.location.href = "/events/create")}>
                    Créer mon premier événement
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Titre</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Lieu</TableHead>
                        <TableHead>Participants</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {events.map((event) => (
                        <TableRow key={event.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{event.title}</div>
                              <div className="text-sm text-muted-foreground line-clamp-1">{event.description}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{event.type}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{formatDate(event.startDate)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {event.venue ? (
                              <div className="flex items-center space-x-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{event.venue.name}</span>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">Non défini</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {event.participantCount}
                                {event.capacity && `/${event.capacity}`}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadge(event.status).variant}>
                              {getStatusBadge(event.status).label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm" onClick={() => fetchParticipants(event.id)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Participants
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[80vh]">
                                  <DialogHeader>
                                    <DialogTitle>Participants - {participantsData?.event.title}</DialogTitle>
                                    <DialogDescription>
                                      Liste des participants inscrits à cet événement
                                    </DialogDescription>
                                  </DialogHeader>

                                  {participantsLoading ? (
                                    <div className="flex items-center justify-center py-8">
                                      <Loader2 className="h-8 w-8 animate-spin" />
                                    </div>
                                  ) : participantsData ? (
                                    <div className="space-y-4">
                                      {/* Statistiques */}
                                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                        <Card>
                                          <CardContent className="pt-4">
                                            <div className="text-2xl font-bold">
                                              {participantsData.statistics.total}
                                            </div>
                                            <p className="text-xs text-muted-foreground">Total</p>
                                          </CardContent>
                                        </Card>
                                        <Card>
                                          <CardContent className="pt-4">
                                            <div className="text-2xl font-bold text-green-600">
                                              {participantsData.statistics.registered}
                                            </div>
                                            <p className="text-xs text-muted-foreground">Inscrits</p>
                                          </CardContent>
                                        </Card>
                                        <Card>
                                          <CardContent className="pt-4">
                                            <div className="text-2xl font-bold text-blue-600">
                                              {participantsData.statistics.attended}
                                            </div>
                                            <p className="text-xs text-muted-foreground">Présents</p>
                                          </CardContent>
                                        </Card>
                                        <Card>
                                          <CardContent className="pt-4">
                                            <div className="text-2xl font-bold text-red-600">
                                              {participantsData.statistics.cancelled}
                                            </div>
                                            <p className="text-xs text-muted-foreground">Annulés</p>
                                          </CardContent>
                                        </Card>
                                        <Card>
                                          <CardContent className="pt-4">
                                            <div className="text-2xl font-bold text-gray-600">
                                              {participantsData.statistics.noShow}
                                            </div>
                                            <p className="text-xs text-muted-foreground">Absents</p>
                                          </CardContent>
                                        </Card>
                                      </div>

                                      {/* Actions */}
                                      <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-semibold">
                                          Liste des participants ({participantsData.participants.length})
                                        </h3>
                                        <Button onClick={exportParticipants} variant="outline" size="sm">
                                          <Download className="h-4 w-4 mr-2" />
                                          Exporter CSV
                                        </Button>
                                      </div>

                                      {/* Liste des participants */}
                                      <ScrollArea className="h-96">
                                        <Table>
                                          <TableHeader>
                                            <TableRow>
                                              <TableHead>Nom</TableHead>
                                              <TableHead>Email</TableHead>
                                              <TableHead>Entreprise</TableHead>
                                              <TableHead>Statut</TableHead>
                                              <TableHead>Inscription</TableHead>
                                            </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                            {participantsData.participants.map((participant) => (
                                              <TableRow key={participant.id}>
                                                <TableCell>
                                                  <div>
                                                    <div className="font-medium">
                                                      {participant.firstName} {participant.lastName}
                                                      {participant.hasAccount && (
                                                        <Badge variant="secondary" className="ml-2 text-xs">
                                                          Compte
                                                        </Badge>
                                                      )}
                                                    </div>
                                                    {participant.jobTitle && (
                                                      <div className="text-sm text-muted-foreground">
                                                        {participant.jobTitle}
                                                      </div>
                                                    )}
                                                  </div>
                                                </TableCell>
                                                <TableCell>{participant.email}</TableCell>
                                                <TableCell>{participant.company || "Non renseigné"}</TableCell>
                                                <TableCell>
                                                  <Badge
                                                    variant={getParticipantStatusBadge(participant.status).variant}
                                                  >
                                                    {getParticipantStatusBadge(participant.status).label}
                                                  </Badge>
                                                </TableCell>
                                                <TableCell>{formatDate(participant.registrationDate)}</TableCell>
                                              </TableRow>
                                            ))}
                                          </TableBody>
                                        </Table>
                                      </ScrollArea>
                                    </div>
                                  ) : (
                                    <div className="text-center py-8">
                                      <p className="text-muted-foreground">Aucune donnée disponible</p>
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>

                              {/* Boutons d'administration (visibles seulement pour les admins) */}
                              {user.role === "admin" && (
                                <>
                                  <Button variant="outline" size="sm" onClick={() => openEditEvent(event)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Modifier
                                  </Button>

                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="destructive" size="sm">
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Supprimer
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Êtes-vous sûr de vouloir supprimer l'événement "{event.title}" ? Cette action
                                          est irréversible et supprimera également tous les participants associés.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => deleteEvent(event.id)}
                                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                          Supprimer
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {user.role === "admin" && (
          <TabsContent value="database" className="space-y-8">
            {/* Gestion de base de données */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <Database className="h-5 w-5 mr-2" />
                      Gestion de la base de données
                    </CardTitle>
                    <CardDescription>Administration et gestion des tables de la base de données</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={fetchDatabaseInfo} variant="outline" size="sm" disabled={databaseLoading}>
                      {databaseLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4 mr-2" />
                      )}
                      Actualiser
                    </Button>
                    <Button onClick={createTables} variant="default" size="sm" disabled={databaseLoading}>
                      <Settings className="h-4 w-4 mr-2" />
                      Créer les tables
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {databaseLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : databaseInfo ? (
                  <div className="space-y-6">
                    {/* Vue d'ensemble */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-2xl font-bold">{databaseInfo.tables.length}</div>
                          <p className="text-xs text-muted-foreground">Tables</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-2xl font-bold">{databaseInfo.totalRecords}</div>
                          <p className="text-xs text-muted-foreground">Total enregistrements</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-2xl font-bold text-green-600">Actif</div>
                          <p className="text-xs text-muted-foreground">État de la base</p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Sélection de table */}
                    <div className="flex items-center space-x-4">
                      <Label htmlFor="table-select">Sélectionner une table :</Label>
                      <Select value={selectedTable} onValueChange={fetchTableData}>
                        <SelectTrigger className="w-64">
                          <SelectValue placeholder="Choisir une table" />
                        </SelectTrigger>
                        <SelectContent>
                          {databaseInfo.tables.map((table) => (
                            <SelectItem key={table.name} value={table.name}>
                              {table.name} ({table.recordCount} enregistrements)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Données de la table sélectionnée */}
                    {tableData && (
                      <Card>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle>Table: {tableData.table}</CardTitle>
                            <Button onClick={() => setShowAddRecord(true)} size="sm">
                              <Plus className="h-4 w-4 mr-2" />
                              Ajouter
                            </Button>
                          </div>
                          <CardDescription>{tableData.pagination.total} enregistrements au total</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ScrollArea className="h-96">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  {tableData.structure.map((field) => (
                                    <TableHead key={field.Field}>{field.Field}</TableHead>
                                  ))}
                                  <TableHead>Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {tableData.records.map((record, index) => (
                                  <TableRow key={record.id || index}>
                                    {tableData.structure.map((field) => (
                                      <TableCell key={field.Field}>
                                        {record[field.Field] !== null && record[field.Field] !== undefined
                                          ? String(record[field.Field]).length > 50
                                            ? String(record[field.Field]).substring(0, 50) + "..."
                                            : String(record[field.Field])
                                          : "NULL"}
                                      </TableCell>
                                    ))}
                                    <TableCell>
                                      <div className="flex space-x-2">
                                        <Button variant="outline" size="sm" onClick={() => setEditingRecord(record)}>
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                        <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                            <Button variant="destructive" size="sm">
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent>
                                            <AlertDialogHeader>
                                              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                                              <AlertDialogDescription>
                                                Êtes-vous sûr de vouloir supprimer cet enregistrement ? Cette action est
                                                irréversible.
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                                              <AlertDialogAction
                                                onClick={() => deleteRecord(record.id)}
                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                              >
                                                Supprimer
                                              </AlertDialogAction>
                                            </AlertDialogFooter>
                                          </AlertDialogContent>
                                        </AlertDialog>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </ScrollArea>

                          {/* Pagination */}
                          {tableData.pagination.totalPages > 1 && (
                            <div className="flex items-center justify-between mt-4">
                              <p className="text-sm text-muted-foreground">
                                Page {tableData.pagination.page} sur {tableData.pagination.totalPages}
                              </p>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={tableData.pagination.page === 1}
                                  onClick={() => fetchTableData(selectedTable, tableData.pagination.page - 1)}
                                >
                                  Précédent
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={tableData.pagination.page === tableData.pagination.totalPages}
                                  onClick={() => fetchTableData(selectedTable, tableData.pagination.page + 1)}
                                >
                                  Suivant
                                </Button>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {/* Liste des tables */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Tables disponibles</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {databaseInfo.tables.map((table) => (
                            <Card
                              key={table.name}
                              className="cursor-pointer hover:bg-muted/50"
                              onClick={() => fetchTableData(table.name)}
                            >
                              <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h3 className="font-semibold">{table.name}</h3>
                                    <p className="text-sm text-muted-foreground">{table.recordCount} enregistrements</p>
                                  </div>
                                  <Database className="h-8 w-8 text-muted-foreground" />
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Impossible de charger les informations de base de données</p>
                    <Button className="mt-4" onClick={fetchDatabaseInfo}>
                      Réessayer
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Dialog pour ajouter un enregistrement */}
            <Dialog open={showAddRecord} onOpenChange={setShowAddRecord}>
              <DialogContent className="max-w-2xl max-h-[80vh]">
                <DialogHeader>
                  <DialogTitle>Ajouter un enregistrement - {selectedTable}</DialogTitle>
                  <DialogDescription>
                    Remplissez les champs pour ajouter un nouvel enregistrement à la table {selectedTable}
                  </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-96">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">{renderFormFields()}</div>
                </ScrollArea>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowAddRecord(false)}>
                    Annuler
                  </Button>
                  <Button onClick={addRecord} disabled={databaseLoading}>
                    {databaseLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    Ajouter
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Dialog pour modifier un enregistrement */}
            <Dialog open={!!editingRecord} onOpenChange={() => setEditingRecord(null)}>
              <DialogContent className="max-w-2xl max-h-[80vh]">
                <DialogHeader>
                  <DialogTitle>Modifier l'enregistrement</DialogTitle>
                  <DialogDescription>Modifiez les champs de cet enregistrement</DialogDescription>
                </DialogHeader>
                {editingRecord && (
                  <ScrollArea className="max-h-96">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                      {tableData?.structure
                        .filter((field) => field.Field !== "id")
                        .map((field) => (
                          <div key={field.Field} className="space-y-2">
                            <Label htmlFor={`edit-${field.Field}`}>
                              {field.Field}
                              {field.Null === "NO" && <span className="text-red-500">*</span>}
                            </Label>
                            <Input
                              id={`edit-${field.Field}`}
                              type={
                                field.Type.includes("int")
                                  ? "number"
                                  : field.Type.includes("decimal")
                                    ? "number"
                                    : field.Type.includes("date")
                                      ? "datetime-local"
                                      : field.Type.includes("email")
                                        ? "email"
                                        : "text"
                              }
                              value={editingRecord[field.Field] || ""}
                              onChange={(e) => setEditingRecord((prev) => ({ ...prev, [field.Field]: e.target.value }))}
                            />
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                )}
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setEditingRecord(null)}>
                    Annuler
                  </Button>
                  <Button
                    onClick={() => {
                      
                      setEditingRecord(null)
                    }}
                    disabled={databaseLoading}
                  >
                    {databaseLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Sauvegarder
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>
        )}
      </Tabs>

      {/* Dialog pour modifier un événement */}
      <Dialog open={showEditEvent} onOpenChange={setShowEditEvent}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Modifier l'événement</DialogTitle>
            <DialogDescription>Modifiez les informations de l'événement</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-96">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
              <div className="space-y-2">
                <Label htmlFor="event-title">Titre *</Label>
                <Input
                  id="event-title"
                  value={eventEditData.title}
                  onChange={(e) => setEventEditData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Titre de l'événement"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-type">Type *</Label>
                <Select
                  value={eventEditData.type}
                  onValueChange={(value) => setEventEditData((prev) => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez le type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conference">Conférence</SelectItem>
                    <SelectItem value="seminar">Séminaire</SelectItem>
                    <SelectItem value="workshop">Atelier</SelectItem>
                    <SelectItem value="meeting">Réunion</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-start-date">Date de début *</Label>
                <Input
                  id="event-start-date"
                  type="datetime-local"
                  value={eventEditData.startDate}
                  onChange={(e) => setEventEditData((prev) => ({ ...prev, startDate: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-end-date">Date de fin *</Label>
                <Input
                  id="event-end-date"
                  type="datetime-local"
                  value={eventEditData.endDate}
                  onChange={(e) => setEventEditData((prev) => ({ ...prev, endDate: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-capacity">Capacité</Label>
                <Input
                  id="event-capacity"
                  type="number"
                  value={eventEditData.capacity}
                  onChange={(e) => setEventEditData((prev) => ({ ...prev, capacity: e.target.value }))}
                  placeholder="Nombre maximum de participants"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-price">Prix (€)</Label>
                <Input
                  id="event-price"
                  type="number"
                  value={eventEditData.price}
                  onChange={(e) => setEventEditData((prev) => ({ ...prev, price: e.target.value }))}
                  placeholder="Prix en euros"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-status">Statut</Label>
                <Select
                  value={eventEditData.status}
                  onValueChange={(value) => setEventEditData((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez le statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Brouillon</SelectItem>
                    <SelectItem value="published">Publié</SelectItem>
                    <SelectItem value="cancelled">Annulé</SelectItem>
                    <SelectItem value="completed">Terminé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="event-description">Description *</Label>
                <Textarea
                  id="event-description"
                  value={eventEditData.description}
                  onChange={(e) => setEventEditData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Description de l'événement"
                  rows={3}
                />
              </div>
            </div>
          </ScrollArea>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowEditEvent(false)}>
              Annuler
            </Button>
            <Button onClick={updateEvent}>
              <Save className="h-4 w-4 mr-2" />
              Sauvegarder
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
