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

interface EventDetails {
  id: string
  title: string
  description: string
  type: string
  startDate: string
  endDate: string
  capacity: number
  registrationDeadline: string
  status: string
  image: string
  tags: string[]
  price: number
  venue: {
    id: string
    name: string
    street: string
    city: string
    state?: string
    country: string
    postalCode?: string
  }
  organizer: {
    id: string
    firstName: string
    lastName: string
    profileImage?: string
  }
  speakers: Array<{
    id: string
    name: string
    bio: string
    expertise: string[]
    profileImage?: string
    company?: string
    jobTitle?: string
  }>
  agenda: Array<{
    id: string
    title: string
    description?: string
    startTime: string
    endTime: string
    speakerId?: string
    location?: string
    type: string
  }>
}

export default function EventDetailsPage() {
  const { id } = useParams() as { id: string }
  const [event, setEvent] = useState<EventDetails | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isRegistered, setIsRegistered] = useState<boolean>(false)

  useEffect(() => {

    setTimeout(() => {
      setEvent({
        id: id,
        title: "Conférence sur l'Innovation Technologique",
        description:
            "Rejoignez-nous pour une journée d'exploration des dernières innovations technologiques et des tendances émergentes. Cette conférence réunira des experts de l'industrie, des entrepreneurs et des passionnés de technologie pour discuter de l'avenir du numérique.",
        type: "conference",
        startDate: "2023-12-15T09:00:00",
        endDate: "2023-12-15T17:00:00",
        capacity: 200,
        registrationDeadline: "2023-12-10T23:59:59",
        status: "published",
        image: "/placeholder.svg?height=400&width=800",
        tags: ["technologie", "innovation", "numérique", "IA"],
        price: 50,
        venue: {
          id: "v1",
          name: "Centre de Conférences Kivu",
          street: "123 Avenue Principale",
          city: "Kinshasa",
          country: "République Démocratique du Congo",
        },
        organizer: {
          id: "o1",
          firstName: "Marie",
          lastName: "Dubois",
          profileImage: "/placeholder.svg?height=100&width=100",
        },
        speakers: [
          {
            id: "s1",
            name: "Jean Dupont",
            bio: "Expert en intelligence artificielle avec plus de 15 ans d'expérience.",
            expertise: ["IA", "Machine Learning", "Big Data"],
            profileImage: "/placeholder.svg?height=100&width=100",
            company: "Tech Innovations",
            jobTitle: "Directeur de la Recherche",
          },
          {
            id: "s2",
            name: "Sophie Martin",
            bio: "Entrepreneure et consultante en transformation numérique.",
            expertise: ["Transformation Numérique", "Stratégie Digitale"],
            profileImage: "/placeholder.svg?height=100&width=100",
            company: "Digital Solutions",
            jobTitle: "CEO",
          },
        ],
        agenda: [
          {
            id: "a1",
            title: "Accueil et enregistrement",
            startTime: "2023-12-15T08:30:00",
            endTime: "2023-12-15T09:00:00",
            type: "other",
          },
          {
            id: "a2",
            title: "Discours d'ouverture",
            description: "Présentation des objectifs de la conférence et des thèmes abordés.",
            startTime: "2023-12-15T09:00:00",
            endTime: "2023-12-15T09:30:00",
            speakerId: "s1",
            location: "Salle Principale",
            type: "presentation",
          },
          {
            id: "a3",
            title: "L'avenir de l'IA dans les entreprises",
            description: "Discussion sur l'impact de l'intelligence artificielle sur les modèles d'affaires.",
            startTime: "2023-12-15T09:45:00",
            endTime: "2023-12-15T11:00:00",
            speakerId: "s1",
            location: "Salle Principale",
            type: "presentation",
          },
          {
            id: "a4",
            title: "Pause café",
            startTime: "2023-12-15T11:00:00",
            endTime: "2023-12-15T11:30:00",
            location: "Espace Café",
            type: "break",
          },
          {
            id: "a5",
            title: "Transformation numérique : études de cas",
            description: "Présentation de cas concrets de transformation numérique réussie.",
            startTime: "2023-12-15T11:30:00",
            endTime: "2023-12-15T12:45:00",
            speakerId: "s2",
            location: "Salle Principale",
            type: "presentation",
          },
        ],
      })
      setIsLoading(false)
    }, 1000)
  }, [id])

  const handleRegister = () => {

    setIsRegistered(true)
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

  const isDeadlinePassed = new Date(event.registrationDeadline) < new Date()
  const isEventFull = false

  return (
      <div className="container mx-auto p-6">
        <div className="relative w-full h-64 md:h-96 mb-6 rounded-lg overflow-hidden">
          <Image src={event.image || "/placeholder.svg"} alt={event.title} fill style={{ objectFit: "cover" }} priority />
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
                <TabsTrigger value="agenda">Programme</TabsTrigger>
                <TabsTrigger value="speakers">Intervenants</TabsTrigger>
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
                          <p className="text-muted-foreground">{formatDate(event.startDate)}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">Horaires</p>
                          <p className="text-muted-foreground">
                            {formatTime(event.startDate)} - {formatTime(event.endDate)}
                          </p>
                        </div>
                      </div>

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

                      <div className="flex items-start gap-2">
                        <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">Capacité</p>
                          <p className="text-muted-foreground">{event.capacity} participants</p>
                        </div>
                      </div>

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

              <TabsContent value="agenda">
                <Card>
                  <CardHeader>
                    <CardTitle>Programme de l'événement</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {event.agenda.map((item) => (
                          <div key={item.id} className="border-l-2 border-primary pl-4 pb-4">
                            <div className="flex justify-between items-start mb-1">
                              <h3 className="font-semibold">{item.title}</h3>
                              <Badge
                                  variant={
                                    item.type === "presentation"
                                        ? "default"
                                        : item.type === "workshop"
                                            ? "secondary"
                                            : item.type === "break"
                                                ? "outline"
                                                : "default"
                                  }
                              >
                                {item.type}
                              </Badge>
                            </div>

                            <p className="text-sm text-muted-foreground mb-1">
                              {formatTime(item.startTime)} - {formatTime(item.endTime)}
                            </p>

                            {item.location && (
                                <p className="text-sm text-muted-foreground mb-2">
                                  <MapPin className="h-3 w-3 inline mr-1" />
                                  {item.location}
                                </p>
                            )}

                            {item.description && <p className="text-sm mt-1">{item.description}</p>}
                          </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="speakers">
                <Card>
                  <CardHeader>
                    <CardTitle>Intervenants</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {event.speakers.map((speaker) => (
                          <div key={speaker.id} className="flex gap-4">
                            <Avatar className="h-16 w-16">
                              <AvatarImage src={speaker.profileImage} alt={speaker.name} />
                              <AvatarFallback>{speaker.name.charAt(0)}</AvatarFallback>
                            </Avatar>

                            <div>
                              <h3 className="font-semibold">{speaker.name}</h3>
                              {speaker.jobTitle && speaker.company && (
                                  <p className="text-sm text-muted-foreground">
                                    {speaker.jobTitle}, {speaker.company}
                                  </p>
                              )}
                              <p className="text-sm mt-1">{speaker.bio}</p>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {speaker.expertise.map((exp) => (
                                    <Badge key={exp} variant="outline">
                                      {exp}
                                    </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
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
                  <p className="text-muted-foreground">{formatDate(event.registrationDeadline)}</p>
                </div>

                <div className="mb-6">
                  <p className="font-medium">Organisateur</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                          src={event.organizer.profileImage}
                          alt={`${event.organizer.firstName} ${event.organizer.lastName}`}
                      />
                      <AvatarFallback>
                        {event.organizer.firstName.charAt(0)}
                        {event.organizer.lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {event.organizer.firstName} {event.organizer.lastName}
                      </p>
                    </div>
                  </div>
                </div>

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

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Partager</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center gap-4">
                  <Button variant="outline" size="icon">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-facebook"
                    >
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                  </Button>
                  <Button variant="outline" size="icon">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-twitter"
                    >
                      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                    </svg>
                  </Button>
                  <Button variant="outline" size="icon">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-linkedin"
                    >
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                      <rect width="4" height="12" x="2" y="9" />
                      <circle cx="4" cy="4" r="2" />
                    </svg>
                  </Button>
                  <Button variant="outline" size="icon">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-mail"
                    >
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  )
}

