"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Construction } from "lucide-react"

export default function ProfilePage() {
  return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Mon Profil</h1>

        <Card className="w-full">
          <CardHeader className="bg-amber-50 dark:bg-amber-950/20 border-b border-amber-100 dark:border-amber-900">
            <div className="flex items-center gap-3">
              <Construction className="h-6 w-6 text-amber-600 dark:text-amber-500" />
              <CardTitle>Page en cours de développement</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <p>
                Cette section est actuellement en cours de développement. Notre équipe travaille activement pour
                implémenter toutes les fonctionnalités de gestion de profil.
              </p>

              <p>Vous pourrez bientôt :</p>

              <ul className="list-disc pl-6 space-y-1">
                <li>Mettre à jour vos informations personnelles</li>
                <li>Changer votre mot de passe</li>
                <li>Télécharger une photo de profil</li>
                <li>Consulter vos statistiques d'événements</li>
                <li>Voir la liste de vos événements</li>
              </ul>

              <p className="text-muted-foreground italic">
                Merci de votre patience pendant que nous améliorons votre expérience.
              </p>

              <div className="pt-4">
                <Button variant="outline" onClick={() => window.history.back()}>
                  Retour
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
  )
}
