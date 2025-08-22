"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Edit,
  Trash,
  Copy,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Share2,
  Download,
  Loader2,
} from "lucide-react"
import axios from "@/lib/axios"
import type { Event, Participant } from "@/types/event"

export default function EventDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [event, setEvent] = useState<Event | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  // Utilise directement params.id au lieu de use(params)
  const eventId = params.id

  useEffect(() => {
    if (eventId) {
      fetchEventData()
    }
  }, [eventId])

  const fetchEventData = async () => {
    try {
      setLoading(true)

      // Récupérer les détails de l'événement
      const eventResponse = await axios.get(`/api/events/${eventId}`)
      console.log("Event response:", eventResponse.data)

      if (eventResponse.data.success) {
        setEvent(eventResponse.data.data)

        // Récupérer les participants
        try {
          const participantsResponse = await axios.get(`/api/events/${eventId}/participants`)
          console.log("Participants response:", participantsResponse.data)

          if (participantsResponse.data.success) {
            setParticipants(participantsResponse.data.data || [])
          }
        } catch (participantsError) {
          console.log("No participants found or error fetching participants:", participantsError)
          setParticipants([])
        }
      }
    } catch (error) {
      console.error("Error fetching event data:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les données de l'événement",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteEvent = async () => {
    if (!event) return

    if (!confirm("Êtes-vous sûr de vouloir supprimer cet événement ?")) {
      return
    }

    try {
      const response = await axios.delete(`/api/events/${event.id}`)

      if (response.data.success) {
        toast({
          title: "Événement supprimé",
          description: "L'événement a été supprimé avec succès",
        })

        router.push("/events")
      }
    } catch (error) {
      console.error("Error deleting event:", error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'événement",
        variant: "destructive",
      })
    }
  }

  const handleDuplicateEvent = async () => {
    if (!event) return

    try {
      // Préparer les données pour la duplication
      const duplicatedEventData = {
        title: `Copie de ${event.title}`,
        description: event.description,
        type: event.type,
        startDate: event.startDate || event.start_date,
        endDate: event.endDate || event.end_date,
        capacity: event.capacity,
        registrationDeadline: event.registrationDeadline || event.registration_deadline,
        status: "draft",
        price: event.price || 0,
        tags: event.tags,
        image: event.image,
        venue: {
          name: event.venue?.name || "Lieu à définir",
          street: event.venue?.street || event.venue?.address || "Adresse à définir",
          city: event.venue?.city || "Ville à définir",
          country: event.venue?.country || "Pays à définir",
          capacity: event.venue?.capacity || event.capacity,
        },
      }

      console.log("Duplicating event with data:", duplicatedEventData)

      const response = await axios.post("/api/events/create", duplicatedEventData)

      if (response.data.success) {
        toast({
          title: "Événement dupliqué",
          description: "L'événement a été dupliqué avec succès",
        })

        router.push(`/events/detail/${response.data.data.id}`)
      }
    } catch (error) {
      console.error("Error duplicating event:", error)
      toast({
        title: "Erreur",
        description: "Impossible de dupliquer l'événement",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Publié</Badge>
      case "draft":
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100">Brouillon</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">Annulé</Badge>
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">Terminé</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return "N/A"

    try {
      // Gérer différents formats de date
      let date: Date

      if (typeof dateString === "string") {
        // Si la date contient 'T', c'est probablement un format ISO
        if (dateString.includes("T")) {
          date = new Date(dateString)
        } else {
          // Sinon, essayer de parser comme une date normale
          date = new Date(dateString)
        }
      } else {
        date = new Date(dateString)
      }

      // Vérifier si la date est valide
      if (isNaN(date.getTime())) {
        console.warn("Invalid date:", dateString)
        return "Date invalide"
      }

      return date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      console.error("Error formatting date:", error, dateString)
      return "Date invalide"
    }
  }

  const formatDateShort = (dateString: string | undefined | null) => {
    if (!dateString) return "N/A"

    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return "Date invalide"
      }

      return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    } catch (error) {
      console.error("Error formatting short date:", error, dateString)
      return "Date invalide"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex justify-center py-12">
        <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Événement non trouvé</h2>
            <p className="text-muted-foreground mb-6">
              L'événement que vous recherchez n'existe pas ou a été supprimé.
            </p>
            <Button onClick={() => router.push("/events")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Retour aux événements
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header Navigation */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push("/events")}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour aux événements
              </Button>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => router.push("/login")}>
                Se connecter
              </Button>
              <Button onClick={() => router.push("/register")}>S'inscrire</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex items-center">
            <div>
              <h1 className="text-2xl font-bold">{event.title}</h1>
              <div className="flex items-center mt-1">
                {getStatusBadge(event.status)}
                <span className="text-muted-foreground ml-2 text-sm">
                  Créé le {formatDateShort(event.createdAt || event.created_at)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-4 sm:mt-0">
            <Button variant="outline" size="sm" onClick={handleDuplicateEvent}>
              <Copy className="mr-2 h-4 w-4" /> Dupliquer
            </Button>
            <Button variant="outline" size="sm" onClick={() => router.push(`/events/edit/${event.id}`)}>
              <Edit className="mr-2 h-4 w-4" /> Modifier
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDeleteEvent}>
              <Trash className="mr-2 h-4 w-4" /> Supprimer
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="participants">Participants</TabsTrigger>
            <TabsTrigger value="check-in">Check-in</TabsTrigger>
            <TabsTrigger value="stats">Statistiques</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Détails de l'événement</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose dark:prose-invert max-w-none">
                      <p>{event.description}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                      <div className="flex items-start">
                        <Calendar className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
                        <div>
                          <h3 className="font-medium">Date et heure</h3>
                          <p className="text-sm text-muted-foreground">
                            Du {formatDate(event.startDate || event.start_date)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Au {formatDate(event.endDate || event.end_date)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <MapPin className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
                        <div>
                          <h3 className="font-medium">Lieu</h3>
                          <p className="text-sm text-muted-foreground">{event.venue?.name || "Non spécifié"}</p>
                          <p className="text-sm text-muted-foreground">
                            {event.venue?.address || event.venue?.street || "Adresse non spécifiée"}
                          </p>
                          {event.venue?.city && (
                            <p className="text-sm text-muted-foreground">
                              {event.venue.city}
                              {event.venue.country && `, ${event.venue.country}`}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start">
                        <Users className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
                        <div>
                          <h3 className="font-medium">Capacité</h3>
                          <p className="text-sm text-muted-foreground">{event.capacity} participants maximum</p>
                          <p className="text-sm text-muted-foreground">{participants.length} inscrits actuellement</p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <Clock className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
                        <div>
                          <h3 className="font-medium">Date limite d'inscription</h3>
                          <p className="text-sm text-muted-foreground">
                            {event.registrationDeadline || event.registration_deadline
                              ? formatDate(event.registrationDeadline || event.registration_deadline)
                              : "Aucune date limite spécifiée"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Button className="w-full">
                        <Share2 className="mr-2 h-4 w-4" /> Partager l'événement
                      </Button>
                      <Button variant="outline" className="w-full bg-transparent">
                        <Download className="mr-2 h-4 w-4" /> Exporter les données
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Résumé</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Type</h3>
                        <p className="capitalize">{event.type}</p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Organisateur</h3>
                        <p>
                          {event.organizer?.firstName && event.organizer?.lastName
                            ? `${event.organizer.firstName} ${event.organizer.lastName}`
                            : "Non spécifié"}
                        </p>
                        {event.organizer?.email && (
                          <p className="text-sm text-muted-foreground">{event.organizer.email}</p>
                        )}
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Prix</h3>
                        <p>{event.price > 0 ? `${event.price} €` : "Gratuit"}</p>
                      </div>

                      {event.tags && (
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Tags</h3>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {event.tags.split(",").map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag.trim()}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Dernière mise à jour</h3>
                        <p>{formatDateShort(event.updatedAt || event.updated_at)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Participants récents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {participants.length === 0 ? (
                      <p className="text-muted-foreground text-sm">Aucun participant inscrit pour le moment.</p>
                    ) : (
                      <div className="space-y-4">
                        {participants.slice(0, 5).map((participant) => (
                          <div key={participant.id} className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center mr-3">
                              <span className="text-xs font-medium">
                                {(participant.user?.firstName || participant.first_name)?.charAt(0) || "?"}
                                {(participant.user?.lastName || participant.last_name)?.charAt(0) || ""}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">
                                {participant.user?.firstName || participant.first_name || "Prénom"}{" "}
                                {participant.user?.lastName || participant.last_name || "Nom"}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {participant.user?.email || participant.email || "Email non disponible"}
                              </p>
                            </div>
                            {participant.status === "attended" ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        ))}

                        {participants.length > 5 && (
                          <Button
                            variant="ghost"
                            className="w-full text-sm"
                            onClick={() => setActiveTab("participants")}
                          >
                            Voir tous les participants
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="participants">
            <Card>
              <CardHeader>
                <CardTitle>Tous les participants ({participants.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {participants.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Aucun participant inscrit pour le moment.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nom
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date d'inscription
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Statut
                          </th>
                          <th className="px-4 py-2"></th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                        {participants.map((participant) => (
                          <tr key={participant.id}>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                              {participant.user?.firstName || participant.first_name || "Prénom"}{" "}
                              {participant.user?.lastName || participant.last_name || "Nom"}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {participant.user?.email || participant.email || "Email non disponible"}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {formatDateShort(participant.registration_date || participant.registrationDate)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              <Badge
                                className={
                                  participant.status === "attended"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                                    : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100"
                                }
                              >
                                {participant.status === "registered" && "Inscrit"}
                                {participant.status === "attended" && "Présent"}
                                {participant.status === "cancelled" && "Annulé"}
                                {participant.status === "no-show" && "Absent"}
                                {!["registered", "attended", "cancelled", "no-show"].includes(participant.status) &&
                                  participant.status}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                              <Button variant="ghost" size="sm">
                                Détails
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="check-in">
            <Card>
              <CardHeader>
                <CardTitle>Check-in des participants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Fonctionnalité de check-in
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Cette section permettra de gérer le check-in des participants le jour de l'événement.
                  </p>
                  <Button variant="outline" disabled>
                    Bientôt disponible
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats">
            <Card>
              <CardHeader>
                <CardTitle>Statistiques de l'événement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">Total inscriptions</h3>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{participants.length}</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-green-800 dark:text-green-200">Taux de remplissage</h3>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                      {event.capacity > 0 ? Math.round((participants.length / event.capacity) * 100) : 0}%
                    </p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-purple-800 dark:text-purple-200">Places restantes</h3>
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                      {Math.max(0, event.capacity - participants.length)}
                    </p>
                  </div>
                </div>
                <div className="text-center py-4">
                  <p className="text-muted-foreground">Des statistiques plus détaillées seront bientôt disponibles.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
