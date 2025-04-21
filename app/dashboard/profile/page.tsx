"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Calendar, MapPin, Edit, Eye, AlertTriangle } from "lucide-react"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import axios from "@/lib/axios"
import Link from "next/link"

interface UserProfile {
  id: string
  first_name: string
  last_name: string
  email: string
  phone_number?: string
  profile_image?: string
  role: string
  created_at: string
}

interface Event {
  id: string
  title: string
  description: string
  type: string
  start_date: string
  end_date: string
  status: string
  venue?: {
    name: string
    address: string
  }
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    pastEvents: 0,
    totalParticipants: 0,
  })
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    current_password: "",
    new_password: "",
    confirm_password: "",
  })

  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Test API connection first
    axios
        .get("/api/debug")
        .then((response) => {
          console.log("Debug endpoint response:", response.data)
          fetchUserData()
        })
        .catch((err) => {
          console.error("Debug endpoint error:", err)
          setError("Impossible de se connecter à l'API. Veuillez réessayer plus tard.")
          setIsLoading(false)
        })
  }, [])

  const fetchUserData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log("Fetching user data...")

      // Récupérer les données du profil utilisateur
      const profileResponse = await axios.get("/api/users/me")
      console.log("Profile response:", profileResponse.data)

      if (profileResponse.data.success) {
        const userData = profileResponse.data.data
        setProfile(userData)

        setFormData({
          first_name: userData.first_name || "",
          last_name: userData.last_name || "",
          email: userData.email || "",
          phone_number: userData.phone_number || "",
          current_password: "",
          new_password: "",
          confirm_password: "",
        })

        try {
          // Récupérer les événements créés par l'utilisateur
          const eventsResponse = await axios.get(`/api/events?organizer_id=${userData.id}`)
          console.log("Events response:", eventsResponse.data)

          if (eventsResponse.data.success) {
            setEvents(eventsResponse.data.data)
          }
        } catch (eventsError) {
          console.error("Error fetching events:", eventsError)
          // Ne pas échouer complètement si les événements ne peuvent pas être récupérés
        }

        try {
          // Récupérer les statistiques
          const statsResponse = await axios.get("/api/dashboard/stats")
          console.log("Stats response:", statsResponse.data)

          if (statsResponse.data.success) {
            setStats({
              totalEvents: statsResponse.data.data.totalEvents || 0,
              upcomingEvents: statsResponse.data.data.upcomingEvents || 0,
              pastEvents: statsResponse.data.data.pastEvents || 0,
              totalParticipants: statsResponse.data.data.totalParticipants || 0,
            })
          }
        } catch (statsError) {
          console.error("Error fetching stats:", statsError)
          // Ne pas échouer complètement si les statistiques ne peuvent pas être récupérées
        }
      }
    } catch (error: any) {
      console.error("Erreur lors de la récupération des données:", error)
      setError(error.response?.data?.error || "Impossible de charger les données du profil")

      // Si l'erreur est une 401, rediriger vers la page de connexion
      if (error.response?.status === 401) {
        toast({
          title: "Session expirée",
          description: "Veuillez vous reconnecter pour accéder à votre profil.",
          variant: "destructive",
        })

        setTimeout(() => {
          router.push("/login")
        }, 2000)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await axios.put("/api/users/me", {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone_number: formData.phone_number,
      })

      if (response.data.success) {
        toast({
          title: "Profil mis à jour",
          description: "Vos informations ont été mises à jour avec succès.",
        })

        // Mettre à jour les données du profil
        setProfile(response.data.data)
      }
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour du profil:", error)
      toast({
        title: "Erreur",
        description: error.response?.data?.error || "Impossible de mettre à jour le profil",
        variant: "destructive",
      })
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.new_password !== formData.confirm_password) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await axios.put("/api/users/me/password", {
        current_password: formData.current_password,
        new_password: formData.new_password,
      })

      if (response.data.success) {
        toast({
          title: "Mot de passe mis à jour",
          description: "Votre mot de passe a été changé avec succès.",
        })

        setFormData((prev) => ({
          ...prev,
          current_password: "",
          new_password: "",
          confirm_password: "",
        }))
      }
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour du mot de passe:", error)
      toast({
        title: "Erreur",
        description: error.response?.data?.error || "Impossible de mettre à jour le mot de passe",
        variant: "destructive",
      })
    }
  }

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append("profile_image", file)

    try {
      const response = await axios.post("/api/users/me/profile-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      if (response.data.success) {
        toast({
          title: "Image mise à jour",
          description: "Votre photo de profil a été mise à jour avec succès.",
        })

        // Mettre à jour l'image du profil
        setProfile((prev) => (prev ? { ...prev, profile_image: response.data.data.profile_image } : null))
      }
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour de l'image:", error)
      toast({
        title: "Erreur",
        description: error.response?.data?.error || "Impossible de mettre à jour la photo de profil",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
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

  if (isLoading) {
    return (
        <div className="container mx-auto p-6 flex justify-center items-center min-h-[60vh]">
          <LoadingSpinner size="lg" />
        </div>
    )
  }

  if (error) {
    return (
        <div className="container mx-auto p-6">
          <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <h2 className="text-xl font-semibold text-red-600 dark:text-red-400">Erreur de chargement</h2>
              </div>
              <p className="mb-4">{error}</p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => router.push("/dashboard")}>
                  Retour au tableau de bord
                </Button>
                <Button onClick={() => fetchUserData()}>Réessayer</Button>
              </div>
            </CardContent>
          </Card>
        </div>
    )
  }

  return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Mon Profil</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardContent className="pt-6 flex flex-col items-center">
                <Avatar className="h-32 w-32 mb-4">
                  <AvatarImage
                      src={profile?.profile_image || "/placeholder.svg?height=128&width=128"}
                      alt={`${profile?.first_name} ${profile?.last_name}`}
                  />
                  <AvatarFallback>
                    {profile?.first_name?.charAt(0)}
                    {profile?.last_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <h2 className="text-xl font-semibold">
                  {profile?.first_name} {profile?.last_name}
                </h2>
                <p className="text-muted-foreground capitalize">{profile?.role || "Utilisateur"}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Membre depuis {profile?.created_at ? formatDate(profile.created_at) : ""}
                </p>

                <div className="mt-4 w-full">
                  <Label htmlFor="profile-image" className="w-full">
                    <Button className="w-full" asChild>
                      <span>Changer la photo</span>
                    </Button>
                  </Label>
                  <Input
                      id="profile-image"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleProfileImageUpload}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Statistiques</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold">{stats.totalEvents}</p>
                    <p className="text-sm text-muted-foreground">Événements</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold">{stats.totalParticipants}</p>
                    <p className="text-sm text-muted-foreground">Participants</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold">{stats.upcomingEvents}</p>
                    <p className="text-sm text-muted-foreground">À venir</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold">{stats.pastEvents}</p>
                    <p className="text-sm text-muted-foreground">Passés</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations du profil</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="info">
                  <TabsList className="mb-4">
                    <TabsTrigger value="info">Informations personnelles</TabsTrigger>
                    <TabsTrigger value="password">Mot de passe</TabsTrigger>
                  </TabsList>

                  <TabsContent value="info">
                    <form onSubmit={handleProfileUpdate}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <Label htmlFor="first_name">Prénom</Label>
                          <Input
                              id="first_name"
                              name="first_name"
                              value={formData.first_name}
                              onChange={handleChange}
                              required
                          />
                        </div>

                        <div>
                          <Label htmlFor="last_name">Nom</Label>
                          <Input
                              id="last_name"
                              name="last_name"
                              value={formData.last_name}
                              onChange={handleChange}
                              required
                          />
                        </div>
                      </div>

                      <div className="mb-4">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                      </div>

                      <div className="mb-6">
                        <Label htmlFor="phone_number">Numéro de téléphone</Label>
                        <Input
                            id="phone_number"
                            name="phone_number"
                            value={formData.phone_number}
                            onChange={handleChange}
                        />
                      </div>

                      <Button type="submit">Mettre à jour le profil</Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="password">
                    <form onSubmit={handlePasswordUpdate}>
                      <div className="mb-4">
                        <Label htmlFor="current_password">Mot de passe actuel</Label>
                        <Input
                            id="current_password"
                            name="current_password"
                            type="password"
                            value={formData.current_password}
                            onChange={handleChange}
                            required
                        />
                      </div>

                      <div className="mb-4">
                        <Label htmlFor="new_password">Nouveau mot de passe</Label>
                        <Input
                            id="new_password"
                            name="new_password"
                            type="password"
                            value={formData.new_password}
                            onChange={handleChange}
                            required
                        />
                      </div>

                      <div className="mb-6">
                        <Label htmlFor="confirm_password">Confirmer le mot de passe</Label>
                        <Input
                            id="confirm_password"
                            name="confirm_password"
                            type="password"
                            value={formData.confirm_password}
                            onChange={handleChange}
                            required
                        />
                      </div>

                      <Button type="submit">Changer le mot de passe</Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mes événements</CardTitle>
                <CardDescription>Liste des événements que vous avez créés</CardDescription>
              </CardHeader>
              <CardContent>
                {events.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">Vous n'avez pas encore créé d'événements</p>
                      <Button asChild>
                        <Link href="/events/create">Créer un événement</Link>
                      </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                      {events.slice(0, 5).map((event) => (
                          <div
                              key={event.id}
                              className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium">{event.title}</h3>
                                <div className="flex items-center mt-1 text-sm text-muted-foreground">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  <span>{formatDate(event.start_date)}</span>
                                </div>
                                {event.venue && (
                                    <div className="flex items-center mt-1 text-sm text-muted-foreground">
                                      <MapPin className="h-4 w-4 mr-1" />
                                      <span>{event.venue.name}</span>
                                    </div>
                                )}
                              </div>
                              <div className="flex items-center">
                                {getStatusBadge(event.status)}
                                <div className="flex ml-2">
                                  <Button variant="ghost" size="icon" asChild>
                                    <Link href={`/events/details/${event.id}`}>
                                      <Eye className="h-4 w-4" />
                                    </Link>
                                  </Button>
                                  <Button variant="ghost" size="icon" asChild>
                                    <Link href={`/events/edit/${event.id}`}>
                                      <Edit className="h-4 w-4" />
                                    </Link>
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                      ))}

                      {events.length > 5 && (
                          <Button variant="outline" className="w-full" asChild>
                            <Link href="/events">Voir tous mes événements</Link>
                          </Button>
                      )}
                    </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  )
}
