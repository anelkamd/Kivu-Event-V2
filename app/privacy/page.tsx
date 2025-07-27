"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Shield, Eye, Lock, Users, Database, Mail } from "lucide-react"
import { Footer } from "@/components/layout/Footer"
import { Navbar } from "@/components/layout/NavBar"

export default function PrivacyPage() {
  const sections = [
    {
      icon: Database,
      title: "1. Informations que nous collectons",
      content: `Nous collectons les informations suivantes :

Informations personnelles :
• Nom, prénom, adresse email
• Numéro de téléphone (optionnel)
• Photo de profil (optionnelle)
• Informations de facturation pour les événements payants

Informations d'utilisation :
• Données de navigation et d'utilisation de la plateforme
• Adresse IP et informations sur l'appareil
• Cookies et technologies similaires
• Historique des événements créés et auxquels vous avez participé

Informations sur les événements :
• Détails des événements que vous créez
• Listes de participants
• Communications liées aux événements`,
    },
    {
      icon: Eye,
      title: "2. Comment nous utilisons vos informations",
      content: `Nous utilisons vos informations pour :

Fourniture du service :
• Créer et gérer votre compte utilisateur
• Organiser et gérer vos événements
• Faciliter la communication entre organisateurs et participants
• Traiter les paiements et facturation

Amélioration du service :
• Analyser l'utilisation de la plateforme
• Développer de nouvelles fonctionnalités
• Personnaliser votre expérience utilisateur

Communication :
• Vous envoyer des notifications importantes
• Répondre à vos demandes de support
• Vous informer des mises à jour du service (avec votre consentement)`,
    },
    {
      icon: Users,
      title: "3. Partage de vos informations",
      content: `Nous ne vendons jamais vos données personnelles. Nous pouvons partager vos informations dans les cas suivants :

Avec votre consentement :
• Informations de profil visibles par les autres utilisateurs
• Détails de participation aux événements publics

Prestataires de services :
• Processeurs de paiement (données chiffrées uniquement)
• Services d'hébergement et de stockage cloud
• Outils d'analyse (données anonymisées)

Obligations légales :
• Réponse aux demandes légales des autorités
• Protection de nos droits et de ceux de nos utilisateurs
• Prévention de la fraude et des activités illégales`,
    },
    {
      icon: Lock,
      title: "4. Sécurité de vos données",
      content: `Nous mettons en place des mesures de sécurité robustes :

Sécurité technique :
• Chiffrement SSL/TLS pour toutes les communications
• Hachage sécurisé des mots de passe
• Sauvegardes régulières et chiffrées
• Surveillance continue des accès

Sécurité organisationnelle :
• Accès limité aux données personnelles
• Formation du personnel sur la protection des données
• Audits de sécurité réguliers
• Politique de confidentialité stricte pour les employés`,
    },
    {
      icon: Shield,
      title: "5. Vos droits (RGPD)",
      content: `Conformément au RGPD, vous disposez des droits suivants :

Droit d'accès :
• Obtenir une copie de vos données personnelles
• Connaître l'utilisation qui en est faite

Droit de rectification :
• Corriger les données inexactes
• Compléter les données incomplètes

Droit à l'effacement :
• Supprimer vos données dans certaines conditions
• "Droit à l'oubli" numérique

Autres droits :
• Limitation du traitement
• Portabilité des données
• Opposition au traitement
• Retrait du consentement à tout moment`,
    },
    {
      icon: Mail,
      title: "6. Cookies et technologies similaires",
      content: `Nous utilisons des cookies pour améliorer votre expérience :

Cookies essentiels :
• Authentification et sécurité
• Préférences de langue et région
• Fonctionnement de base de la plateforme

Cookies d'analyse :
• Mesure d'audience (Google Analytics)
• Amélioration des performances
• Données anonymisées uniquement

Gestion des cookies :
• Vous pouvez configurer vos préférences
• Désactivation possible via votre navigateur
• Impact possible sur certaines fonctionnalités`,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
        <Navbar />
      <div className="container mx-auto px-2 py-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-6">
            <div className="bg-accent p-4 rounded-full">
              <Shield className="h-12 w-12 text-accent-foreground" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">Politique de confidentialité</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Nous nous engageons à protéger votre vie privée et vos données personnelles. Cette politique explique
            comment nous collectons, utilisons et protégeons vos informations.
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
              <CardTitle className="text-2xl text-center">Protection de vos données personnelles</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-8">
                  <div className="bg-accent p-6 rounded-lg border-l-4 border-primary">
                    <h3 className="font-semibold text-accent-foreground mb-2">Notre engagement</h3>
                    <p className="text-accent-foreground">
                      Kivu Event s'engage à respecter votre vie privée et à protéger vos données personnelles
                      conformément au Règlement Général sur la Protection des Données (RGPD) et aux lois locales
                      applicables.
                    </p>
                  </div>

                  {sections.map((section, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <div className="bg-accent p-2 rounded-lg">
                          <section.icon className="h-6 w-6 text-accent-foreground" />
                        </div>
                        <h2 className="text-xl font-semibold text-foreground">{section.title}</h2>
                      </div>
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-line ml-14">
                        {section.content}
                      </p>
                      {index < sections.length - 1 && <Separator className="mt-6" />}
                    </motion.div>
                  ))}

                  <div className="bg-accent p-6 rounded-lg mt-8">
                    <h3 className="font-semibold text-accent-foreground mb-4">7. Conservation des données</h3>
                    <p className="text-accent-foreground mb-4">
                      Nous conservons vos données personnelles uniquement pendant la durée nécessaire aux finalités pour
                      lesquelles elles ont été collectées :
                    </p>
                    <ul className="text-accent-foreground space-y-2">
                      <li>• Données de compte : Tant que votre compte est actif + 3 ans</li>
                      <li>• Données d'événements : 5 ans après la fin de l'événement</li>
                      <li>• Données de facturation : 10 ans (obligation légale)</li>
                      <li>• Logs de sécurité : 1 an maximum</li>
                    </ul>
                  </div>

                  <div className="bg-muted p-6 rounded-lg">
                    <h3 className="font-semibold text-foreground mb-2">8. Contact et exercice de vos droits</h3>
                    <p className="text-muted-foreground mb-4">
                      Pour exercer vos droits ou pour toute question concernant cette politique :
                    </p>
                    <div className="text-muted-foreground space-y-1">
                      <p>
                        <strong>Délégué à la Protection des Données :</strong>
                      </p>
                      <p>Email: dpo@kivu-event.com</p>
                      <p>Téléphone: +243 123 456 789</p>
                      <p>Adresse: 123 Avenue des Événements, Goma, RDC</p>
                    </div>
                    <p className="text-muted-foreground text-sm mt-4">
                      Nous nous engageons à répondre à vos demandes dans un délai de 30 jours maximum.
                    </p>
                  </div>

                  <div className="bg-destructive/10 p-6 rounded-lg border-l-4 border-destructive">
                    <h3 className="font-semibold text-destructive mb-2">Modifications de cette politique</h3>
                    <p className="text-destructive">
                      Nous pouvons mettre à jour cette politique de confidentialité. Les modifications importantes vous
                      seront notifiées par email et/ou via un avis sur notre plateforme.
                    </p>
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
