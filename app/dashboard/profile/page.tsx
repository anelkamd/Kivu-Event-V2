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
import { useToast } from "@/hooks/use-toast"
import  LoadingSpinner  from "@/components/ui/LoadingSpinner"
import {
  Mail,
  Phone,
  Building,
  Briefcase,
  Calendar,
  Users,
  Eye,
  Edit,
  Save,
  X,
  Download,
  MapPin,
  Clock,
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

      const text = await response.text()
      console.log(text)
      try {
        const data = JSON.parse(text)

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
      } catch (err) {
        console.error("Erreur JSON.parse:", err)
        console.log("Réponse brute:", text)
        toast({
          title: "Erreur",
          description: "Réponse invalide du serveur. Contactez le support.",
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

  useEffect(() => {
    fetchProfileData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
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
      {/* En-tête du profil */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.profileImage || "/placeholder.svg"} alt={`${user.firstName} ${user.lastName}`} />
              <AvatarFallback className="text-lg">
                {user.firstName.charAt(0)}
                {user.lastName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-2xl">
                {user.firstName} {user.lastName}
              </CardTitle>
              <CardDescription className="text-lg">
                {user.jobTitle && user.company
                  ? `${user.jobTitle} chez ${user.company}`
                  : user.jobTitle || user.company || "Organisateur d'événements"}
              </CardDescription>
              <Badge variant="outline" className="mt-2">
                {user.role === "admin" ? "Administrateur" : "Utilisateur"}
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
              <div className="space-y-2">
                <Label htmlFor="company">Entreprise</Label>
                <Input
                  id="company"
                  value={editData.company}
                  onChange={(e) => setEditData((prev) => ({ ...prev, company: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Poste</Label>
                <Input
                  id="jobTitle"
                  value={editData.jobTitle}
                  onChange={(e) => setEditData((prev) => ({ ...prev, jobTitle: e.target.value }))}
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
                {user.company && (
                  <div className="flex items-center space-x-3">
                    <Building className="h-5 w-5 text-muted-foreground" />
                    <span>{user.company}</span>
                  </div>
                )}
                {user.jobTitle && (
                  <div className="flex items-center space-x-3">
                    <Briefcase className="h-5 w-5 text-muted-foreground" />
                    <span>{user.jobTitle}</span>
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
                              <DialogDescription>Liste des participants inscrits à cet événement</DialogDescription>
                            </DialogHeader>

                            {participantsLoading ? (
                              <div className="flex items-center justify-center py-8">
                                <LoadingSpinner />
                              </div>
                            ) : participantsData ? (
                              <div className="space-y-4">
                                {/* Statistiques */}
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                  <Card>
                                    <CardContent className="pt-4">
                                      <div className="text-2xl font-bold">{participantsData.statistics.total}</div>
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
                                            <Badge variant={getParticipantStatusBadge(participant.status).variant}>
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
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
