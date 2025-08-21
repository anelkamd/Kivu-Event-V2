"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  ChevronDown,
  ChevronUp,
  Search,
  HelpCircle,
  Users,
  CreditCard,
  Settings,
  Shield,
  Smartphone,
} from "lucide-react"
import Link from "next/link"
import { Footer } from "@/components/layout/Footer"
import { Navbar } from "@/components/layout/NavBar"

const faqCategories = [
  {
    id: "general",
    name: "Général",
    icon: HelpCircle,
    color: "bg-primary/10 text-primary",
  },
  {
    id: "events",
    name: "Gestion d'événements",
    icon: Users,
    color: "bg-green-100 text-green-600",
  },
  {
    id: "payments",
    name: "Paiements",
    icon: CreditCard,
    color: "bg-purple-100 text-purple-600",
  },
  {
    id: "technical",
    name: "Technique",
    icon: Settings,
    color: "bg-orange-100 text-orange-600",
  },
  {
    id: "security",
    name: "Sécurité",
    icon: Shield,
    color: "bg-red-100 text-red-600",
  },
  {
    id: "mobile",
    name: "Application mobile",
    icon: Smartphone,
    color: "bg-indigo-100 text-indigo-600",
  },
]

const faqs = [
  {
    category: "general",
    question: "Qu'est-ce que Kivu Event ?",
    answer:
      "Kivu Event est une plateforme complète de gestion d'événements qui vous permet de créer, promouvoir et gérer vos événements en ligne. De la création de l'événement au check-in des participants, nous couvrons tous les aspects de l'organisation événementielle.",
  },
  {
    category: "general",
    question: "Dans quels pays Kivu Event est-il disponible ?",
    answer:
      "Kivu Event est principalement conçu pour l'Afrique, avec un focus particulier sur la RDC, mais nous servons des clients dans plus de 15 pays africains et au-delà. Notre plateforme supporte plusieurs devises et langues.",
  },
  {
    category: "general",
    question: "Puis-je utiliser Kivu Event gratuitement ?",
    answer:
      "Oui ! Nous offrons un plan gratuit qui vous permet d'organiser des événements jusqu'à 50 participants avec toutes les fonctionnalités de base. C'est parfait pour commencer et tester notre plateforme.",
  },
  {
    category: "events",
    question: "Combien d'événements puis-je créer ?",
    answer:
      "Cela dépend de votre plan. Le plan gratuit permet 1 événement par mois, le plan Pro offre des événements illimités, et le plan Enterprise n'a aucune limite avec des fonctionnalités avancées.",
  },
  {
    category: "events",
    question: "Comment puis-je promouvoir mon événement ?",
    answer:
      "Kivu Event vous fournit une page d'événement publique optimisée, des outils de partage sur les réseaux sociaux, des codes d'intégration pour votre site web, et des fonctionnalités d'email marketing pour atteindre votre audience.",
  },
  {
    category: "events",
    question: "Puis-je gérer plusieurs types d'événements ?",
    answer:
      "Absolument ! Notre plateforme supporte tous types d'événements : conférences, workshops, meetups, webinaires, festivals, événements corporate, et bien plus. Chaque type d'événement peut être personnalisé selon vos besoins.",
  },
  {
    category: "events",
    question: "Comment fonctionne le système de check-in ?",
    answer:
      "Nous utilisons des QR codes uniques envoyés par email à chaque participant. Le jour de l'événement, vous pouvez scanner ces codes avec notre app mobile ou interface web pour un check-in rapide et efficace.",
  },
  {
    category: "payments",
    question: "Quels moyens de paiement acceptez-vous ?",
    answer:
      "Nous supportons les cartes de crédit/débit internationales, Mobile Money (M-Pesa, Orange Money, Airtel Money), virements bancaires, et d'autres méthodes de paiement locales selon votre région.",
  },
  {
    category: "payments",
    question: "Y a-t-il des frais de transaction ?",
    answer:
      "Les frais de transaction varient selon le moyen de paiement utilisé. Pour les cartes de crédit, c'est généralement 2.9% + 0.30€. Pour Mobile Money, les frais sont souvent plus bas. Consultez notre page tarifs pour plus de détails.",
  },
  {
    category: "payments",
    question: "Quand recevrai-je mes paiements ?",
    answer:
      "Les paiements sont généralement transférés sur votre compte dans les 2-7 jours ouvrables après l'événement, selon votre méthode de paiement et votre région. Vous pouvez suivre tous vos paiements dans votre tableau de bord.",
  },
  {
    category: "technical",
    question: "Puis-je intégrer Kivu Event avec d'autres outils ?",
    answer:
      "Oui ! Nous offrons des intégrations avec Zoom, Microsoft Teams, Google Calendar, Mailchimp, et bien d'autres. Notre API REST permet également des intégrations personnalisées.",
  },
  {
    category: "technical",
    question: "Vos données sont-elles sauvegardées ?",
    answer:
      "Oui, toutes vos données sont automatiquement sauvegardées quotidiennement sur plusieurs serveurs sécurisés. Nous utilisons des centres de données certifiés avec une disponibilité de 99.9%.",
  },
  {
    category: "technical",
    question: "Puis-je exporter mes données ?",
    answer:
      "Absolument ! Vous pouvez exporter toutes vos données (participants, événements, statistiques) en formats CSV, Excel, ou PDF à tout moment depuis votre tableau de bord.",
  },
  {
    category: "security",
    question: "Mes données sont-elles sécurisées ?",
    answer:
      "La sécurité est notre priorité. Nous utilisons le chiffrement SSL/TLS, l'authentification à deux facteurs, et nous sommes conformes aux standards GDPR et autres réglementations de protection des données.",
  },
  {
    category: "security",
    question: "Qui peut voir les informations de mes participants ?",
    answer:
      "Seuls vous et les membres de votre équipe que vous autorisez peuvent accéder aux données des participants. Nous ne partageons jamais ces informations avec des tiers sans votre consentement explicite.",
  },
  {
    category: "mobile",
    question: "Y a-t-il une application mobile ?",
    answer:
      "Oui ! Nous avons des applications iOS et Android pour les organisateurs et les participants. L'app organisateur permet le check-in et la gestion en temps réel, tandis que l'app participant facilite l'inscription et l'accès aux événements.",
  },
  {
    category: "mobile",
    question: "L'application fonctionne-t-elle hors ligne ?",
    answer:
      "L'application organisateur peut fonctionner en mode hors ligne pour le check-in des participants. Les données sont synchronisées automatiquement dès que la connexion internet est rétablie.",
  },
]

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [expandedItems, setExpandedItems] = useState<number[]>([])

  const toggleExpanded = (index: number) => {
    setExpandedItems((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]))
  }

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground sm:text-5xl">Questions fréquemment posées</h1>
            <p className="mt-4 text-xl text-muted-foreground max-w-3xl mx-auto">
              Trouvez rapidement les réponses à vos questions sur Kivu Event. Si vous ne trouvez pas ce que vous
              cherchez, n'hésitez pas à nous contacter.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Search and Filters */}
        <div className="mb-12">
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                placeholder="Rechercher dans les FAQ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 py-3 text-lg"
              />
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              onClick={() => setSelectedCategory("all")}
              className="rounded-full"
            >
              Toutes les catégories
            </Button>
            {faqCategories.map((category) => {
              const IconComponent = category.icon
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id)}
                  className="rounded-full"
                >
                  <IconComponent className="h-4 w-4 mr-2" />
                  {category.name}
                </Button>
              )
            })}
          </div>
        </div>

        {/* FAQ Items */}
        <div className="max-w-4xl mx-auto">
          {filteredFaqs.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <HelpCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Aucune question trouvée</h3>
                <p className="text-muted-foreground mb-6">
                  Essayez de modifier vos termes de recherche ou sélectionnez une autre catégorie.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedCategory("all")
                  }}
                >
                  Réinitialiser les filtres
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredFaqs.map((faq, index) => {
                const category = faqCategories.find((cat) => cat.id === faq.category)
                const isExpanded = expandedItems.includes(index)

                return (
                  <Card key={index} className="shadow-sm hover:shadow-md transition-shadow duration-200">
                    <CardHeader className="cursor-pointer" onClick={() => toggleExpanded(index)}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {category && (
                            <Badge className={category.color} variant="secondary">
                              {category.name}
                            </Badge>
                          )}
                          <CardTitle className="text-lg font-semibold text-left">{faq.question}</CardTitle>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        )}
                      </div>
                    </CardHeader>

                    {isExpanded && (
                      <CardContent className="pt-0">
                        <p className="text-foreground leading-relaxed">{faq.answer}</p>
                      </CardContent>
                    )}
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* Contact Section */}
        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="py-12">
              <HelpCircle className="h-16 w-16 text-primary mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-foreground mb-4">Vous ne trouvez pas votre réponse ?</h3>
              <p className="text-muted-foreground mb-8">
                Notre équipe support est là pour vous aider. Contactez-nous et nous vous répondrons dans les plus brefs
                délais.
              </p>
              <div className="space-x-4">
                <Button asChild>
                  <Link href="/contact">Nous contacter</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="mailto:support@kivuevent.com">Envoyer un email</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="hero-gradient">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">Prêt à commencer ?</h2>
          <p className="text-xl text-primary-foreground/80 mb-8">
            Créez votre premier événement en quelques minutes avec Kivu Event.
          </p>
          <div className="space-x-4">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/register">Commencer gratuitement</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
              asChild
            >
              <Link href="/events">Voir les événements</Link>
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
