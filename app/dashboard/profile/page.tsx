"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

interface UserProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber?: string
  profileImage?: string
  role: string
  createdAt: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Simuler le chargement des données du profil
    // Dans une application réelle, vous feriez un appel API ici
    setTimeout(() => {
      setProfile({
        id: "1",
        firstName: "Jean",
        lastName: "Dupont",
        email: "jean.dupont@example.com",
        phoneNumber: "+243 123 456 789",
        profileImage: "/placeholder.svg?height=100&width=100",
        role: "organizer",
        createdAt: "2023-01-15",
      })

      setFormData({
        firstName: "Jean",
        lastName: "Dupont",
        email: "jean.dupont@example.com",
        phoneNumber: "+243 123 456 789",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })

      setIsLoading(false)
    }, 1000)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    // Simuler la mise à jour du profil
    toast({
      title: "Profil mis à jour",
      description: "Vos informations ont été mises à jour avec succès.",
    })
  }

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive",
      })
      return
    }

    // Simuler la mise à jour du mot de passe
    toast({
      title: "Mot de passe mis à jour",
      description: "Votre mot de passe a été changé avec succès.",
    })

    setFormData((prev) => ({
      ...prev,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }))
  }

  if (isLoading) {
    return (
        <div className="container mx-auto p-6 flex justify-center items-center min-h-[60vh]">
          <p>Chargement du profil...</p>
        </div>
    )
  }

  return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Mon Profil</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardContent className="pt-6 flex flex-col items-center">
              <Avatar className="h-32 w-32 mb-4">
                <AvatarImage src={profile?.profileImage} alt={`${profile?.firstName} ${profile?.lastName}`} />
                <AvatarFallback>
                  {profile?.firstName?.charAt(0)}
                  {profile?.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <h2 className="text-xl font-semibold">
                {profile?.firstName} {profile?.lastName}
              </h2>
              <p className="text-muted-foreground capitalize">{profile?.role}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Membre depuis {new Date(profile?.createdAt || "").toLocaleDateString()}
              </p>

              <Button className="mt-4 w-full">Changer la photo</Button>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
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
                        <Label htmlFor="firstName">Prénom</Label>
                        <Input
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                        />
                      </div>

                      <div>
                        <Label htmlFor="lastName">Nom</Label>
                        <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required />
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
                      <Label htmlFor="phoneNumber">Numéro de téléphone</Label>
                      <Input id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} />
                    </div>

                    <Button type="submit">Mettre à jour le profil</Button>
                  </form>
                </TabsContent>

                <TabsContent value="password">
                  <form onSubmit={handlePasswordUpdate}>
                    <div className="mb-4">
                      <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                      <Input
                          id="currentPassword"
                          name="currentPassword"
                          type="password"
                          value={formData.currentPassword}
                          onChange={handleChange}
                          required
                      />
                    </div>

                    <div className="mb-4">
                      <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                      <Input
                          id="newPassword"
                          name="newPassword"
                          type="password"
                          value={formData.newPassword}
                          onChange={handleChange}
                          required
                      />
                    </div>

                    <div className="mb-6">
                      <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                      <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          value={formData.confirmPassword}
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
        </div>
      </div>
  )
}

