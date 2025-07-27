"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Footer } from "@/components/layout/Footer"
import { Navbar } from "@/components/layout/NavBar"

export default function TermsPage() {
  const sections = [
    {
      title: "1. Acceptation des conditions",
      content: `En accédant et en utilisant la plateforme Kivu Event, vous acceptez d'être lié par ces conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser nos services.`,
    },
    {
      title: "2. Description du service",
      content: `Kivu Event est une plateforme de gestion d'événements qui permet aux utilisateurs de créer, organiser et gérer des événements tels que des séminaires, conférences, et autres rassemblements professionnels ou personnels.`,
    },
    {
      title: "3. Inscription et compte utilisateur",
      content: `Pour utiliser certaines fonctionnalités de notre service, vous devez créer un compte. Vous êtes responsable de maintenir la confidentialité de vos informations de connexion et de toutes les activités qui se produisent sous votre compte.`,
    },
    {
      title: "4. Utilisation acceptable",
      content: `Vous vous engagez à utiliser notre service uniquement à des fins légales et conformément à ces conditions. Il est interdit d'utiliser le service pour :
      • Organiser des événements illégaux ou nuisant à autrui
      • Diffuser du contenu offensant, diffamatoire ou inapproprié
      • Violer les droits de propriété intellectuelle
      • Perturber le fonctionnement du service`,
    },
    {
      title: "5. Contenu utilisateur",
      content: `Vous conservez la propriété du contenu que vous publiez sur notre plateforme. Cependant, vous nous accordez une licence non exclusive pour utiliser, modifier et afficher ce contenu dans le cadre de la fourniture de nos services.`,
    },
    {
      title: "6. Paiements et remboursements",
      content: `Les frais de service sont clairement indiqués lors de la création d'événements payants. Les remboursements sont traités selon notre politique de remboursement, disponible sur demande.`,
    },
    {
      title: "7. Responsabilité",
      content: `Kivu Event agit en tant qu'intermédiaire technologique. Nous ne sommes pas responsables du contenu des événements, de leur déroulement, ou des interactions entre les utilisateurs. Notre responsabilité est limitée au montant des frais payés pour nos services.`,
    },
    {
      title: "8. Protection des données",
      content: `Nous nous engageons à protéger vos données personnelles conformément à notre Politique de confidentialité et aux réglementations applicables, notamment le RGPD.`,
    },
    {
      title: "9. Suspension et résiliation",
      content: `Nous nous réservons le droit de suspendre ou de résilier votre compte en cas de violation de ces conditions d'utilisation, avec ou sans préavis.`,
    },
    {
      title: "10. Modifications des conditions",
      content: `Nous pouvons modifier ces conditions à tout moment. Les modifications importantes vous seront notifiées par email ou via la plateforme. L'utilisation continue du service après modification constitue votre acceptation des nouvelles conditions.`,
    },
    {
      title: "11. Droit applicable",
      content: `Ces conditions sont régies par le droit de la République Démocratique du Congo. Tout litige sera soumis à la juridiction des tribunaux compétents de Kinshasa.`,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />  
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-foreground mb-4">Conditions d'utilisation</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Veuillez lire attentivement ces conditions d'utilisation avant d'utiliser la plateforme Kivu Event. Elles
            définissent vos droits et obligations.
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="shadow-lg border-border">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Conditions générales d'utilisation de Kivu Event</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-8">
                  <div className="bg-accent p-6 rounded-lg border-l-4 border-primary">
                    <h3 className="font-semibold text-accent-foreground mb-2">Important</h3>
                    <p className="text-accent-foreground">
                      En utilisant nos services, vous acceptez automatiquement ces conditions. Si vous n'êtes pas
                      d'accord avec l'une de ces conditions, veuillez ne pas utiliser notre plateforme.
                    </p>
                  </div>

                  {sections.map((section, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <h2 className="text-xl font-semibold text-foreground mb-3">{section.title}</h2>
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{section.content}</p>
                      {index < sections.length - 1 && <Separator className="mt-6" />}
                    </motion.div>
                  ))}

                  <div className="bg-muted p-6 rounded-lg mt-8">
                    <h3 className="font-semibold text-foreground mb-2">Contact</h3>
                    <p className="text-muted-foreground">
                      Pour toute question concernant ces conditions d'utilisation, veuillez nous contacter à :
                    </p>
                    <div className="mt-2 text-muted-foreground">
                      <p>Email: legal@kivu-event.com</p>
                      <p>Téléphone: +243 123 456 789</p>
                      <p>Adresse: 123 Avenue des Événements, Goma, RDC</p>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      <Footer />
    </div>
  )
}
