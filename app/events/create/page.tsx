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
import {
  Calendar,
  MapPin,
  Users,
  Info,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Copy,
  Check,
  Eye,
  Settings,
} from "lucide-react"
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
        street: eventData.location.street.trim() || "Adresse à définir",
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
      const eventLink = `${window.location.origin}/events/${createdEvent.id}/register`
      navigator.clipboard.writeText(eventLink)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    }
  }

  // Fonction utilitaire pour lire un cookie
  const getCookie = (name: string) => {
    if (typeof document === "undefined") return null
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
      const token = getCookie("token")

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
            Authorization: `Bearer ${token}`,
          },
        })

        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json()
          imageUrl = uploadResult.url
        } else {
          const errorText = await uploadResponse.text()
          console.error("Erreur d'upload d'image:", uploadResponse.status, errorText)
          throw new Error(`Échec de l'upload d'image: ${uploadResponse.statusText || errorText}`)
        }
      }

      const dataToSubmit = prepareDataForSubmission(publish)
      dataToSubmit.image = imageUrl

      console.log("🔼 Données envoyées :", dataToSubmit)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
    <div className="flex-1 overflow-auto">
      <div className="max-w-4xl mx-auto p-6">
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
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Paramètres</span>
                  <span className="sm:hidden">Config</span>
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
                        <SelectItem value="other">Autre</SelectItem>
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
            <Button variant="outline" onClick={() => router.push("/events")}>
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
                      description: "Veuillez remplir les champs obligatoires marqués d'un *.",
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
                        Votre événement sera visible par tous les utilisateurs de la plateforme.
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
                  </div>
                </div>
              ) : (
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
                        Votre événement sera accessible uniquement aux personnes qui possèdent le lien.
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
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  setShowSuccessDialog(false)
                  router.push("/dashboard")
                }}
                className="w-full sm:w-auto"
              >
                Retour à la liste
              </Button>
              <Button
                onClick={() => {
                  setShowSuccessDialog(false)
                  router.push(`/events/detail/${createdEvent?.id}`)
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
    </div>
  )
}
