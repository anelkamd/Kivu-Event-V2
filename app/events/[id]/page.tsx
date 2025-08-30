"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Users, Tag, DollarSign } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/hooks/use-toast"

interface EventDetails {
  id: string
  title: string
  description: string
  type: string
  start_date: string
  end_date: string
  capacity: number
  registration_deadline: string
  status: string
  price: number
  tags: string[]
  image: string
  venue_id: string
  organizer_id: string
  created_at: string
  updated_at: string
  venue?: {
    id: string
    name: string
    street: string
    city: string
    state?: string
    country: string
    postal_code?: string
  }
  organizer?: {
    id: string
    first_name: string
    last_name: string
    profile_image?: string
  }
  speakers?: Array<{
    id: string
    name: string
    bio: string
    expertise: string[]
    profile_image?: string
    company?: string
    job_title?: string
  }>
  agenda?: Array<{
    id: string
    title: string
    description?: string
    start_time: string
    end_time: string
    speaker_id?: string
    location?: string
    type: string
  }>
}

export default function EventDetailsPage() {
  const { id } = useParams() as { id: string }
  const { token } = useAuth()
  const { toast } = useToast()
  const [event, setEvent] = useState<EventDetails | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isRegistered, setIsRegistered] = useState<boolean>(false)

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!token || !id) {
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/events/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`)
        }

        const responseText = await response.text()
        if (!responseText?.trim()) {
          throw new Error("Réponse vide du serveur")
        }

        const data = JSON.parse(responseText)

        if (data.success && data.data) {
          const eventData = data.data
          setEvent({
            ...eventData,
            start_date: eventData.start_date,
            end_date: eventData.end_date,
            tags: Array.isArray(eventData.tags)
              ? eventData.tags
              : typeof eventData.tags === "string"
                ? eventData.tags.split(",").map((t: string) => t.trim())
                : [],
          })
        } else {
          throw new Error(data.message || "Erreur lors de la récupération de l'événement")
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de l'événement:", error)
        toast({
          title: "Erreur",
          description: "Impossible de charger les détails de l'événement",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchEventDetails()
  }, [id, token, API_BASE_URL])

  const handleRegister = async () => {
    if (!token) {
      toast({
        title: "Authentification requise",
        description: "Vous devez être connecté pour vous inscrire",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/events/${id}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setIsRegistered(true)
        toast({
          title: "Inscription réussie",
          description: "Vous êtes maintenant inscrit à cet événement",
        })
      } else {
        throw new Error(data.message || "Erreur lors de l'inscription")
      }
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error)
      toast({
        title: "Erreur",
        description: "Impossible de s'inscrire à l'événement",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center min-h-[60vh]">
        <p>Chargement des détails de l'événement...</p>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Événement non trouvé</h1>
        <p>L'événement que vous recherchez n'existe pas ou a été supprimé.</p>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const isDeadlinePassed = new Date(event.registration_deadline) < new Date()
  const isEventFull = false // This would need to be calculated based on registrations

  return (
    <div className="container mx-auto p-6">
      <div className="relative w-full h-64 md:h-96 mb-6 rounded-lg overflow-hidden">
        <Image
          src={event.image || "/placeholder.svg?height=400&width=800&query=event"}
          alt={event.title}
          fill
          style={{ objectFit: "cover" }}
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
          <div className="p-6">
            <Badge className="mb-2">{event.type}</Badge>
            <h1 className="text-2xl md:text-4xl font-bold text-white">{event.title}</h1>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="details">
            <TabsList className="mb-4">
              <TabsTrigger value="details">Détails</TabsTrigger>
              {event.agenda && event.agenda.length > 0 && <TabsTrigger value="agenda">Programme</TabsTrigger>}
              {event.speakers && event.speakers.length > 0 && <TabsTrigger value="speakers">Intervenants</TabsTrigger>}
            </TabsList>

            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle>À propos de cet événement</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-line mb-6">{event.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-2">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Date</p>
                        <p className="text-muted-foreground">{formatDate(event.start_date)}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Horaires</p>
                        <p className="text-muted-foreground">
                          {formatTime(event.start_date)} - {formatTime(event.end_date)}
                        </p>
                      </div>
                    </div>

                    {event.venue && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">Lieu</p>
                          <p className="text-muted-foreground">{event.venue.name}</p>
                          <p className="text-muted-foreground">
                            {event.venue.street}, {event.venue.city}, {event.venue.country}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-2">
                      <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Capacité</p>
                        <p className="text-muted-foreground">{event.capacity} participants</p>
                      </div>
                    </div>

                    {event.tags && event.tags.length > 0 && (
                      <div className="flex items-start gap-2">
                        <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">Tags</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {event.tags.map((tag) => (
                              <Badge key={tag} variant="secondary">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-2">
                      <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Prix</p>
                        <p className="text-muted-foreground">{event.price === 0 ? "Gratuit" : `${event.price} USD`}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ... existing agenda and speakers tabs ... */}
          </Tabs>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Inscription</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p className="font-medium">Date limite d'inscription</p>
                <p className="text-muted-foreground">{formatDate(event.registration_deadline)}</p>
              </div>

              {event.organizer && (
                <div className="mb-6">
                  <p className="font-medium">Organisateur</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={event.organizer.profile_image || "/placeholder.svg"}
                        alt={`${event.organizer.first_name} ${event.organizer.last_name}`}
                      />
                      <AvatarFallback>
                        {event.organizer.first_name.charAt(0)}
                        {event.organizer.last_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {event.organizer.first_name} {event.organizer.last_name}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <Button
                className="w-full"
                disabled={isRegistered || isDeadlinePassed || isEventFull}
                onClick={handleRegister}
              >
                {isRegistered
                  ? "Déjà inscrit"
                  : isDeadlinePassed
                    ? "Inscriptions fermées"
                    : isEventFull
                      ? "Événement complet"
                      : "S'inscrire maintenant"}
              </Button>

              {isDeadlinePassed && (
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  La date limite d'inscription est passée.
                </p>
              )}

              {isEventFull && !isDeadlinePassed && (
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  Cet événement a atteint sa capacité maximale.
                </p>
              )}
            </CardContent>
          </Card>

          {/* ... existing sharing card ... */}
        </div>
      </div>
    </div>
  )
}
