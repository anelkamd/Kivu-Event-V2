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

  useEffect(() => {
    fetchEventData()
  }, [params.id])

  const fetchEventData = async () => {
    try {
      setLoading(true)

      // Récupérer les détails de l'événement
      const eventResponse = await axios.get(`/api/events/${params.id}`)

      if (eventResponse.data.success) {
        setEvent(eventResponse.data.data)

        // Récupérer les participants
        const participantsResponse = await axios.get(`/api/events/${params.id}/participants`)

        if (participantsResponse.data.success) {
          setParticipants(participantsResponse.data.data)
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
      // Créer une copie de l'événement
      const duplicatedEvent = {
        ...event,
        title: `Copie de ${event.title}`,
        status: "draft",
      }

      // Supprimer l'ID pour en créer un nouveau
      delete (duplicatedEvent as any).id
      delete (duplicatedEvent as any).created_at
      delete (duplicatedEvent as any).updated_at
      delete (duplicatedEvent as any).venue // Ensure venue object is not sent directly
      delete (duplicatedEvent as any).organizer // Ensure organizer object is not sent directly

      // Créer le nouvel événement
      const response = await axios.post("/api/events/create", duplicatedEvent) // Ensure the correct endpoint for creation

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
    if (!dateString) return "N/A" // Handle null or undefined date strings
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return "Date invalide" // Handle invalid date strings
    }
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Événement non trouvé</h2>
          <p className="text-muted-foreground mb-6">L'événement que vous recherchez n'existe pas ou a été supprimé.</p>
          <Button onClick={() => router.push("/events")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour aux événements
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => router.push("/events")} className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{event.title}</h1>
            <div className="flex items-center mt-1">
              {getStatusBadge(event.status)}
              <span className="text-muted-foreground ml-2 text-sm">Créé le {formatDate(event.created_at)}</span>
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
                        <p className="text-sm text-muted-foreground">Du {formatDate(event.start_date)}</p>
                        <p className="text-sm text-muted-foreground">Au {formatDate(event.end_date)}</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium">Lieu</h3>
                        <p className="text-sm text-muted-foreground">{event.venue?.name || "Non spécifié"}</p>
                        <p className="text-sm text-muted-foreground">
                          {event.venue?.address || "Adresse non spécifiée"}
                        </p>
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
                          {event.registration_deadline
                            ? formatDate(event.registration_deadline)
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
                      <p>{event.type}</p>
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

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Dernière mise à jour</h3>
                      <p>{formatDate(event.updated_at)}</p>
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
                            {(participant.user?.firstName || participant.first_name)?.charAt(0)}
                            {(participant.user?.lastName || participant.last_name)?.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {participant.user?.firstName || participant.first_name}{" "}
                              {participant.user?.lastName || participant.last_name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {participant.user?.email || participant.email}
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
                        <Button variant="ghost" className="w-full text-sm" onClick={() => setActiveTab("participants")}>
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
                            {participant.user?.firstName || participant.first_name}{" "}
                            {participant.user?.lastName || participant.last_name}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {participant.user?.email || participant.email}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(participant.registration_date)}
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
              <CardTitle>Check-in des participants (à implémenter)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Cette section permettra de gérer le check-in des participants.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>Statistiques de l'événement (à implémenter)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Cette section affichera des statistiques détaillées sur l'événement.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
