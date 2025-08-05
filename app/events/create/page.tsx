"use client"

import { useState, type DragEvent } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Calendar, MapPin, Users, Info, ChevronRight, ChevronLeft, Loader2, Copy, Check, Eye } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type EventData = {
  title: string
  description: string
  category: string
  startDate: string
  endDate: string
  location: {
    name: string
    street: string
    city: string
    country: string
    capacity: number
  }
  capacity: number
  isPublic: boolean
  status: string
  registrationDeadline: string
  price: number
  tags: string
  image: string
}

type CreatedEvent = {
  id: string
  title: string
  status: string
}

export default function CreateEventPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("basic")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [eventData, setEventData] = useState<EventData>({
    title: "",
    description: "",
    category: "",
    startDate: "",
    endDate: "",
    location: {
      name: "",
      street: "",
      city: "",
      country: "",
      capacity: 0,
    },
    capacity: 0,
    isPublic: true,
    status: "draft",
    registrationDeadline: "",
    price: 0,
    tags: "",
    image: "",
  })

  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [createdEvent, setCreatedEvent] = useState<CreatedEvent | null>(null)
  const [linkCopied, setLinkCopied] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState("")
  const [dragActive, setDragActive] = useState(false)

  const handleChange = (field: keyof EventData, value: any) => {
    setEventData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleLocationChange = (field: keyof EventData["location"], value: any) => {
    setEventData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value,
      },
    }))
  }

  const validateForm = () => {
    const requiredFields = [
      { field: "title", message: "Le titre est obligatoire" },
      { field: "description", message: "La description est obligatoire" },
      { field: "category", message: "La catégorie est obligatoire" },
      { field: "startDate", message: "La date de début est obligatoire" },
      { field: "endDate", message: "La date de fin est obligatoire" },
    ]

    for (const { field, message } of requiredFields) {
      if (!eventData[field as keyof EventData]) {
        toast({
          title: "Champ manquant",
          description: message,
          variant: "destructive",
        })
        return false
      }
    }

    // Validation des dates
    const startDate = new Date(eventData.startDate)
    const endDate = new Date(eventData.endDate)
    const registrationDeadline = eventData.registrationDeadline ? new Date(eventData.registrationDeadline) : null

    if (startDate >= endDate) {
      toast({
        title: "Erreur de dates",
        description: "La date de fin doit être postérieure à la date de début",
        variant: "destructive",
      })
      return false
    }

    if (registrationDeadline && registrationDeadline >= startDate) {
      toast({
        title: "Erreur de dates",
        description: "La date limite d'inscription doit être antérieure à la date de début",
        variant: "destructive",
      })
      return false
    }

    // Validation de la capacité
    if (eventData.capacity <= 0) {
      toast({
        title: "Capacité invalide",
        description: "La capacité doit être supérieure à 0",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const prepareDataForSubmission = (publish = false) => {
    return {
      title: eventData.title.trim(),
      description: eventData.description.trim(),
      type: eventData.category,
      startDate: eventData.startDate,
      endDate: eventData.endDate,
      capacity: Number(eventData.capacity) || 100,
      registrationDeadline: eventData.registrationDeadline || null,
      status: publish ? "published" : eventData.status,
      price: Number(eventData.price) || 0,
      tags: eventData.tags.trim() || null,
      image: eventData.image.trim() || null,
      venue: {
        name: eventData.location.name.trim() || "Lieu à définir",
        street: eventData.location.street.trim() || "Adresse à définir", // ✅ corrigé ici
        city: eventData.location.city.trim() || "Ville à définir",
        country: eventData.location.country.trim() || "Pays à définir",
        capacity: Number(eventData.location.capacity) || Number(eventData.capacity) || 100,
      },
    }
  }

  const handleImageDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(false)
    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleImageFile(files[0])
    }
  }

  const handleImageFile = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target && typeof e.target.result === "string") {
          setImagePreview(e.target.result)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const copyEventLink = () => {
    if (createdEvent) {
      const eventLink = `${window.location.origin}/events/${createdEvent.id}`
      navigator.clipboard.writeText(eventLink)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    }
  }

  // Fonction utilitaire pour lire un cookie
  const getCookie = (name: string) => {
    if (typeof document === "undefined") return null // S'assurer que nous sommes côté client
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop()?.split(";").shift()
    return null
  }

  const handleSubmit = async (publish = false) => {
    try {
      setIsSubmitting(true)

      let imageUrl = ""

      // Récupérer le token JWT depuis les cookies
      const token = getCookie("token") // Assurez-vous que 'token' est le nom de votre cookie JWT

      if (!token) {
        toast({
          title: "Erreur d'authentification",
          description: "Vous devez être connecté pour créer un événement.",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      if (imageFile) {
        const formData = new FormData()
        formData.append("image", imageFile)

        const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, {
          method: "POST",
          body: formData,
          headers: {
            // Ajoutez le token pour l'upload d'image si cette route est aussi protégée
            Authorization: `Bearer ${token}`,
          },
        })

        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json()
          imageUrl = uploadResult.url
        } else {
          const errorText = await uploadResponse.text()
          console.error("Erreur d'upload d'image:", uploadResponse.status, errorText)
          throw new Error(`Échec de l’upload d’image: ${uploadResponse.statusText || errorText}`)
        }
      }

      const dataToSubmit = prepareDataForSubmission(publish)
      dataToSubmit.image = imageUrl

      console.log("🔼 Données envoyées :", dataToSubmit)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Ajoutez le token JWT à l'en-tête Authorization
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSubmit),
      })

      const contentType = response.headers.get("content-type")
      let result
      if (contentType && contentType.includes("application/json")) {
        result = await response.json()
      } else {
        const text = await response.text()
        throw new Error(text || "Réponse du serveur non valide")
      }

      console.log("🟢 Réponse API :", result)

      if (!response.ok) {
        throw new Error(result.error || "Erreur lors de la création de l'événement")
      }

      if (result.success || result.data) {
        setCreatedEvent(result.data)
        setShowSuccessDialog(true)
        toast({
          title: "Succès",
          description: "Événement créé avec succès.",
        })
      } else {
        throw new Error(result.error || "Erreur inconnue")
      }
    } catch (error: any) {
      console.error("❌ Erreur création événement:", error)
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const goToNextTab = () => {
    if (activeTab === "basic") setActiveTab("details")
    else if (activeTab === "details") setActiveTab("location")
    else if (activeTab === "location") setActiveTab("settings")
  }

  const goToPreviousTab = () => {
    if (activeTab === "settings") setActiveTab("location")
    else if (activeTab === "location") setActiveTab("details")
    else if (activeTab === "details") setActiveTab("basic")
  }

  const getEventLink = () => {
    if (!createdEvent) return ""
    return `${window.location.origin}/events/${createdEvent.id}/register`
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Créer un nouvel événement</h1>
        <p className="text-muted-foreground">Remplissez les informations pour créer votre événement</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de l'événement</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-8">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                <span className="hidden sm:inline">Informations de base</span>
                <span className="sm:hidden">Base</span>
              </TabsTrigger>
              <TabsTrigger value="details" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Dates et détails</span>
                <span className="sm:hidden">Détails</span>
              </TabsTrigger>
              <TabsTrigger value="location" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline">Lieu et capacité</span>
                <span className="sm:hidden">Lieu</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Titre de l'événement *</Label>
                  <Input
                    id="title"
                    placeholder="Ex: Conférence annuelle de technologie"
                    value={eventData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Décrivez votre événement..."
                    rows={5}
                    value={eventData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Catégorie *</Label>
                  <Select value={eventData.category} onValueChange={(value) => handleChange("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conference">Conférence</SelectItem>
                      <SelectItem value="seminar">Séminaire</SelectItem>
                      <SelectItem value="workshop">Atelier</SelectItem>
                      <SelectItem value="meeting">Réunion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={goToNextTab} className="flex items-center">
                  Suivant <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Date de début *</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={eventData.startDate}
                    onChange={(e) => handleChange("startDate", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="endDate">Date de fin *</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={eventData.endDate}
                    onChange={(e) => handleChange("endDate", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="registrationDeadline">Date limite d'inscription</Label>
                  <Input
                    id="registrationDeadline"
                    type="datetime-local"
                    value={eventData.registrationDeadline}
                    onChange={(e) => handleChange("registrationDeadline", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="price">Prix (optionnel)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={eventData.price || ""}
                    onChange={(e) => handleChange("price", Number.parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
                <Input
                  id="tags"
                  placeholder="Ex: technologie, innovation, formation"
                  value={eventData.tags}
                  onChange={(e) => handleChange("tags", e.target.value)}
                />
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={goToPreviousTab} className="flex items-center bg-transparent">
                  <ChevronLeft className="mr-2 h-4 w-4" /> Précédent
                </Button>
                <Button onClick={goToNextTab} className="flex items-center">
                  Suivant <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="location" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="locationName">Nom du lieu</Label>
                  <Input
                    id="locationName"
                    placeholder="Ex: Centre de conférences Kivu"
                    value={eventData.location.name}
                    onChange={(e) => handleLocationChange("name", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="locationAddress">Adresse</Label>
                  <Input
                    id="locationAddress"
                    placeholder="Adresse complète"
                    value={eventData.location.street}
                    onChange={(e) => handleLocationChange("street", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="locationCity">Ville</Label>
                    <Input
                      id="locationCity"
                      placeholder="Ex: Goma"
                      value={eventData.location.city}
                      onChange={(e) => handleLocationChange("city", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="locationCountry">Pays</Label>
                    <Input
                      id="locationCountry"
                      placeholder="Ex: République Démocratique du Congo"
                      value={eventData.location.country}
                      onChange={(e) => handleLocationChange("country", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="capacity">Capacité maximale *</Label>
                  <div className="flex items-center">
                    <Input
                      id="capacity"
                      type="number"
                      min="1"
                      placeholder="Nombre de participants"
                      value={eventData.capacity || ""}
                      onChange={(e) => handleChange("capacity", Number.parseInt(e.target.value) || 0)}
                      required
                    />
                    <Users className="ml-2 h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={goToPreviousTab} className="flex items-center bg-transparent">
                  <ChevronLeft className="mr-2 h-4 w-4" /> Précédent
                </Button>
                <Button onClick={goToNextTab} className="flex items-center">
                  Suivant <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="isPublic" className="text-base">
                      Événement public
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Les événements publics sont visibles par tous les utilisateurs
                    </p>
                  </div>
                  <Switch
                    id="isPublic"
                    checked={eventData.isPublic}
                    onCheckedChange={(checked) => handleChange("isPublic", checked)}
                  />
                </div>

                <div>
                  <Label htmlFor="image">Image de l'événement</Label>
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
                    }`}
                    onDragEnter={(e) => {
                      e.preventDefault()
                      setDragActive(true)
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault()
                      setDragActive(false)
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleImageDrop}
                  >
                    {imagePreview ? (
                      <div className="space-y-4">
                        <img
                          src={imagePreview || "/placeholder.svg"}
                          alt="Aperçu"
                          className="max-h-48 mx-auto rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setImageFile(null)
                            setImagePreview("")
                          }}
                        >
                          Supprimer l'image
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="text-gray-500">
                          <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path
                              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Glissez-déposez une image ici, ou</p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => e.target.files && handleImageFile(e.target.files[0])}
                            className="hidden"
                            id="image-upload"
                          />
                          <label htmlFor="image-upload" className="cursor-pointer text-blue-600 hover:text-blue-500">
                            cliquez pour sélectionner
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={goToPreviousTab} className="flex items-center bg-transparent">
                  <ChevronLeft className="mr-2 h-4 w-4" /> Précédent
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push("/dashboard/events")}>
            Annuler
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
              className="flex items-center"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enregistrer comme brouillon
            </Button>
            <Button
              onClick={() => {
                if (!validateForm()) {
                  toast({
                    title: "Formulaire incomplet",
                    description: "Veuillez remplir les champs obligatoires marqués d’un *.",
                    variant: "destructive",
                  })
                  return
                }
                handleSubmit(true)
              }}
              disabled={isSubmitting}
              className="bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 flex items-center"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Créer l'événement
            </Button>
          </div>
        </CardFooter>
      </Card>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md md:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              Événement créé avec succès !
            </DialogTitle>
            <DialogDescription>
              Votre événement "{createdEvent?.title}" a été créé et{" "}
              {createdEvent?.status === "published" ? "publié" : "enregistré comme brouillon"}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Message pour événement public */}
            {eventData.isPublic ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-green-800">Événement public</h4>
                    <p className="text-sm text-green-700 mt-1">
                      Votre événement sera visible par tous les utilisateurs de la plateforme. Les participants pourront
                      le découvrir et s'inscrire directement.
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <Label className="text-sm font-medium text-green-800">Lien de partage</Label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-2">
                    <div className="w-full overflow-hidden">
                      <Input readOnly value={getEventLink()} className="text-sm bg-white border-green-300 truncate" />
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={copyEventLink}
                      className="flex items-center gap-1 bg-green-600 hover:bg-green-700 whitespace-nowrap"
                    >
                      {linkCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {linkCopied ? "Copié" : "Copier"}
                    </Button>
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    Partagez ce lien pour permettre aux participants de rejoindre votre événement.
                  </p>
                </div>
              </div>
            ) : (
              /* Message pour événement privé */
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-blue-800">Événement privé</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Votre événement sera accessible uniquement aux personnes qui possèdent le lien. Il ne sera pas
                      visible publiquement sur la plateforme.
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <Label className="text-sm font-medium text-blue-800">Lien de partage privé</Label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-2">
                    <div className="w-full overflow-hidden">
                      <Input readOnly value={getEventLink()} className="text-sm bg-white border-blue-300 truncate" />
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={copyEventLink}
                      className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
                    >
                      {linkCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {linkCopied ? "Copié" : "Copier"}
                    </Button>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    Partagez ce lien uniquement avec les personnes que vous souhaitez inviter.
                  </p>
                </div>

                {/* Options de partage sur les réseaux sociaux */}
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <Label className="text-sm font-medium text-blue-800 mb-3 block">
                    Partager sur les réseaux sociaux
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const url = getEventLink()
                        const text = `Rejoignez-moi pour "${createdEvent?.title}" !`
                        window.open(
                          `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
                          "_blank",
                        )
                      }}
                      className="flex items-center gap-2 border-blue-300 text-blue-700 hover:bg-blue-50"
                    >
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                      </svg>
                      Twitter
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const url = getEventLink()
                        const text = `Rejoignez-moi pour "${createdEvent?.title}" !`
                        window.open(
                          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
                          "_blank",
                        )
                      }}
                      className="flex items-center gap-2 border-blue-300 text-blue-700 hover:bg-blue-50"
                    >
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                      Facebook
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const url = getEventLink()
                        const text = `Rejoignez-moi pour "${createdEvent?.title}" !`
                        window.open(
                          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`,
                          "_blank",
                        )
                      }}
                      className="flex items-center gap-2 border-blue-300 text-blue-700 hover:bg-blue-50"
                    >
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                      LinkedIn
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const url = getEventLink()
                        const text = `Rejoignez-moi pour "${createdEvent?.title}" !`
                        window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`, "_blank")
                      }}
                      className="flex items-center gap-2 border-blue-300 text-blue-700 hover:bg-blue-50"
                    >
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.085" />
                      </svg>
                      WhatsApp
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between">
            <Button
              variant="outline"
              onClick={() => {
                setShowSuccessDialog(false)
                router.push("/dashboard/events")
              }}
              className="w-full sm:w-auto"
            >
              Retour à la liste
            </Button>
            <Button
              onClick={() => {
                setShowSuccessDialog(false)
                router.push(`/dashboard/events/${createdEvent?.id}`)
              }}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <Eye className="h-4 w-4" />
              Voir les détails
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
