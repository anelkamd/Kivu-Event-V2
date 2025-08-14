"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import  LoadingSpinner  from "@/components/ui/LoadingSpinner"
import { Calendar, MapPin, Users, Clock, Euro, ArrowLeft, CheckCircle } from "lucide-react"
import axios from "@/lib/axios"

interface Event {
  id: string
  title: string
  description: string
  type: string
  startDate: string
  endDate: string
  capacity: number
  registrationDeadline: string
  status: string
  price: number
  tags: string[]
  image: string
  venue: {
    id: string
    name: string
    address: string
    city: string
    country: string
  }
}

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  company: string
  position: string
  dietaryRestrictions: string
  specialNeeds: string
}

export default function EventRegistrationPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string

  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    position: "",
    dietaryRestrictions: "",
    specialNeeds: "",
  })

  useEffect(() => {
    if (eventId) {
      fetchEvent()
    }
  }, [eventId])

  const fetchEvent = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/events/${eventId}`)
      setEvent(response.data.data)
    } catch (error) {
      console.error("Error fetching event:", error)
      setError("Erreur lors du chargement de l'événement")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.firstName || !formData.lastName || !formData.email) {
      setError("Veuillez remplir tous les champs obligatoires")
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      const response = await axios.post(`/api/participants/${eventId}/register`, formData)

      if (response.data.success) {
        setSuccess(true)
      }
    } catch (error: any) {
      console.error("Registration error:", error)
      setError(error.response?.data?.message || "Erreur lors de l'inscription")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Événement non trouvé</h2>
              <p className="text-gray-600 mb-4">L'événement que vous recherchez n'existe pas ou a été supprimé.</p>
              <Button onClick={() => router.push("/events")}>Retour aux événements</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-700 mb-2">Inscription réussie !</h2>
              <p className="text-gray-600 mb-6">
                Votre inscription à l'événement "{event.title}" a été confirmée. Vous recevrez un email de confirmation
                sous peu.
              </p>
              <div className="space-y-2">
                <Button onClick={() => router.push("/events")} className="w-full">
                  Voir d'autres événements
                </Button>
                <Button variant="outline" onClick={() => router.push("/")} className="w-full">
                  Retour à l'accueil
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return "/placeholder.svg?height=300&width=600"
    if (imagePath.startsWith("http")) return imagePath
    return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/${imagePath}`
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Inscription à l'événement</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Event Details */}
          <div>
            <Card>
              <CardHeader>
                <div className="aspect-video relative overflow-hidden rounded-lg mb-4">
                  <img
                    src={getImageUrl(event.image) || "/placeholder.svg"}
                    alt={event.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = "/placeholder.svg?height=300&width=600"
                    }}
                  />
                </div>
                <CardTitle className="text-2xl">{event.title}</CardTitle>
                <CardDescription>{event.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{event.type}</Badge>
                  <Badge variant={event.status === "active" ? "default" : "secondary"}>{event.status}</Badge>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Date de début</p>
                      <p className="text-sm text-gray-600">{formatDate(event.startDate)}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Date de fin</p>
                      <p className="text-sm text-gray-600">{formatDate(event.endDate)}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium">{event.venue.name}</p>
                      <p className="text-sm text-gray-600">
                        {event.venue.address}, {event.venue.city}, {event.venue.country}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Capacité</p>
                      <p className="text-sm text-gray-600">{event.capacity} participants</p>
                    </div>
                  </div>

                  {event.price > 0 && (
                    <div className="flex items-center space-x-3">
                      <Euro className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium">Prix</p>
                        <p className="text-sm text-gray-600">{event.price}€</p>
                      </div>
                    </div>
                  )}
                </div>

                {event.tags && event.tags.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="font-medium mb-2">Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {event.tags.map((tag, index) => (
                          <Badge key={index} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Registration Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Formulaire d'inscription</CardTitle>
                <CardDescription>Remplissez ce formulaire pour vous inscrire à l'événement</CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Prénom *</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="Votre prénom"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Nom *</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Votre nom"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="votre.email@exemple.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+33 1 23 45 67 89"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="company">Entreprise</Label>
                      <Input
                        id="company"
                        name="company"
                        type="text"
                        value={formData.company}
                        onChange={handleInputChange}
                        placeholder="Nom de votre entreprise"
                      />
                    </div>
                    <div>
                      <Label htmlFor="position">Poste</Label>
                      <Input
                        id="position"
                        name="position"
                        type="text"
                        value={formData.position}
                        onChange={handleInputChange}
                        placeholder="Votre poste"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="dietaryRestrictions">Restrictions alimentaires</Label>
                    <Textarea
                      id="dietaryRestrictions"
                      name="dietaryRestrictions"
                      value={formData.dietaryRestrictions}
                      onChange={handleInputChange}
                      placeholder="Indiquez vos restrictions alimentaires..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="specialNeeds">Besoins spéciaux</Label>
                    <Textarea
                      id="specialNeeds"
                      name="specialNeeds"
                      value={formData.specialNeeds}
                      onChange={handleInputChange}
                      placeholder="Indiquez vos besoins spéciaux (accessibilité, etc.)..."
                      rows={3}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? (
                      <>
                        <LoadingSpinner />
                        Inscription en cours...
                      </>
                    ) : (
                      "S'inscrire à l'événement"
                    )}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">* Champs obligatoires</p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
