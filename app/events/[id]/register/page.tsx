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
import { Calendar, MapPin, Users, Clock, Euro, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react"
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

interface FormErrors {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  company?: string
  position?: string
  dietaryRestrictions?: string
  specialNeeds?: string
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
  const [formErrors, setFormErrors] = useState<FormErrors>({})

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
      setError(null)

      console.log("🔍 Récupération de l'événement:", eventId)
      const response = await axios.get(`/api/events/${eventId}`)

      if (response.data.success) {
        setEvent(response.data.data)
        console.log("✅ Événement récupéré:", response.data.data.title)
      } else {
        setError("Événement non trouvé")
      }
    } catch (error: any) {
      console.error("❌ Erreur lors de la récupération de l'événement:", error)
      setError(error.response?.data?.message || "Erreur lors du chargement de l'événement")
    } finally {
      setLoading(false)
    }
  }

  const validateForm = (): boolean => {
    const errors: FormErrors = {}

    // Validation prénom
    if (!formData.firstName.trim()) {
      errors.firstName = "Le prénom est obligatoire"
    } else if (formData.firstName.trim().length < 2) {
      errors.firstName = "Le prénom doit contenir au moins 2 caractères"
    }

    // Validation nom
    if (!formData.lastName.trim()) {
      errors.lastName = "Le nom est obligatoire"
    } else if (formData.lastName.trim().length < 2) {
      errors.lastName = "Le nom doit contenir au moins 2 caractères"
    }

    // Validation email
    if (!formData.email.trim()) {
      errors.email = "L'email est obligatoire"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Format d'email invalide"
    }

    // Validation téléphone (optionnel mais format si rempli)
    if (formData.phone && !/^[+]?[0-9\s\-$$$$]{10,}$/.test(formData.phone)) {
      errors.phone = "Format de téléphone invalide"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Effacer l'erreur pour ce champ
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }))
    }

    // Effacer l'erreur générale
    if (error) {
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      setError("Veuillez corriger les erreurs dans le formulaire")
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      console.log("📝 Soumission du formulaire d'inscription")
      console.log("📝 Données:", formData)
      console.log("📝 Event ID:", eventId)

      const response = await axios.post(`/api/participants/${eventId}/register`, {
        ...formData,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.toLowerCase().trim(),
        phone: formData.phone.trim() || null,
        company: formData.company.trim() || null,
        position: formData.position.trim() || null,
        dietaryRestrictions: formData.dietaryRestrictions.trim() || null,
        specialNeeds: formData.specialNeeds.trim() || null,
      })

      if (response.data.success) {
        console.log("✅ Inscription réussie")
        setSuccess(true)

        // Redirection automatique après 5 secondes
        setTimeout(() => {
          router.push("/events")
        }, 5000)
      }
    } catch (error: any) {
      console.error("❌ Erreur lors de l'inscription:", error)

      if (error.response?.status === 400) {
        setError(error.response.data.message || "Données invalides")
      } else if (error.response?.status === 404) {
        setError("Événement non trouvé")
      } else if (error.response?.status === 500) {
        setError("Erreur serveur. Veuillez réessayer plus tard.")
      } else {
        setError("Erreur lors de l'inscription. Veuillez réessayer.")
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner className="mx-auto mb-4" />
          <p className="text-gray-600">Chargement de l'événement...</p>
        </div>
      </div>
    )
  }

  if (error && !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Erreur</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <div className="space-y-2">
                <Button onClick={() => fetchEvent()} className="w-full">
                  Réessayer
                </Button>
                <Button variant="outline" onClick={() => router.push("/events")} className="w-full">
                  Retour aux événements
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Événement non trouvé</h2>
              <p className="text-gray-600 mb-4">L'événement que vous recherchez n'existe pas ou a été supprimé.</p>
              <Button onClick={() => router.push("/events")} className="w-full">
                Retour aux événements
              </Button>
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
                Votre inscription à l'événement <strong>"{event.title}"</strong> a été confirmée. Vous recevrez un email
                de confirmation sous peu.
              </p>
              <div className="space-y-2">
                <Button onClick={() => router.push("/events")} className="w-full">
                  Voir d'autres événements
                </Button>
                <Button variant="outline" onClick={() => router.push("/")} className="w-full">
                  Retour à l'accueil
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-4">Redirection automatique dans 5 secondes...</p>
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
    if (!imagePath) return "/placeholder.svg?height=300&width=600&text=Image+événement"
    if (imagePath.startsWith("http")) return imagePath

    // Construire l'URL avec le bon domaine
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
    return `${baseUrl}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`
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
                      target.src = "/placeholder.svg?height=300&width=600&text=Image+non+disponible"
                    }}
                  />
                </div>
                <CardTitle className="text-2xl">{event.title}</CardTitle>
                <CardDescription className="text-base">{event.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="capitalize">
                    {event.type}
                  </Badge>
                  <Badge variant={event.status === "published" ? "default" : "secondary"} className="capitalize">
                    {event.status}
                  </Badge>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Calendar className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Date de début</p>
                      <p className="text-sm text-gray-600">{formatDate(event.startDate)}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Clock className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Date de fin</p>
                      <p className="text-sm text-gray-600">{formatDate(event.endDate)}</p>
                    </div>
                  </div>

                  {event.venue && (
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">{event.venue.name}</p>
                        <p className="text-sm text-gray-600">
                          {event.venue.address}, {event.venue.city}
                          {event.venue.country && `, ${event.venue.country}`}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Capacité</p>
                      <p className="text-sm text-gray-600">{event.capacity} participants</p>
                    </div>
                  </div>

                  {event.price > 0 && (
                    <div className="flex items-center space-x-3">
                      <Euro className="h-5 w-5 text-gray-500 flex-shrink-0" />
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
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                      <p className="text-red-800 text-sm">{error}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        className={formErrors.firstName ? "border-red-500" : ""}
                        disabled={submitting}
                      />
                      {formErrors.firstName && <p className="text-sm text-red-500 mt-1">{formErrors.firstName}</p>}
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
                        className={formErrors.lastName ? "border-red-500" : ""}
                        disabled={submitting}
                      />
                      {formErrors.lastName && <p className="text-sm text-red-500 mt-1">{formErrors.lastName}</p>}
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
                      className={formErrors.email ? "border-red-500" : ""}
                      disabled={submitting}
                    />
                    {formErrors.email && <p className="text-sm text-red-500 mt-1">{formErrors.email}</p>}
                  </div>

                  <div>
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+243 123 456 789"
                      className={formErrors.phone ? "border-red-500" : ""}
                      disabled={submitting}
                    />
                    {formErrors.phone && <p className="text-sm text-red-500 mt-1">{formErrors.phone}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="company">Entreprise</Label>
                      <Input
                        id="company"
                        name="company"
                        type="text"
                        value={formData.company}
                        onChange={handleInputChange}
                        placeholder="Nom de votre entreprise"
                        disabled={submitting}
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
                        disabled={submitting}
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
                      disabled={submitting}
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
                      disabled={submitting}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? (
                      <>
                        <LoadingSpinner className="w-4 h-4 mr-2" />
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
