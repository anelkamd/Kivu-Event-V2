"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Star, Zap, Crown } from "lucide-react"
import Link from "next/link"
import { Footer } from "@/components/layout/Footer"
import { Navbar } from "@/components/layout/NavBar"

const plans = [
  {
    name: "Gratuit",
    price: "0",
    period: "mois",
    description: "Parfait pour commencer avec des événements simples",
    icon: Star,
    popular: false,
    features: [
      "Jusqu'à 100 participants",
      "4 événement par mois",
      "Inscription en ligne basique",
      "Support par email",
      "Statistiques de base",
      "QR codes pour check-in",
    ],
    limitations: ["Pas de personnalisation avancée", "Branding Kivu Event visible", "Pas d'intégrations tierces"],
  },
  {
    name: "Pro",
    price: "29",
    period: "mois",
    description: "Idéal pour les organisateurs réguliers",
    icon: Zap,
    popular: true,
    features: [
      "Jusqu'à 500 participants",
      "Événements illimités",
      "Personnalisation complète",
      "Support prioritaire",
      "Analytics avancées",
      "Intégrations (Zoom, Teams)",
      "Emails personnalisés",
      "Gestion des paiements",
      "Export des données",
      "API access",
    ],
    limitations: [],
  },
  {
    name: "Enterprise",
    price: "99",
    period: "mois",
    description: "Pour les grandes organisations et événements",
    icon: Crown,
    popular: false,
    features: [
      "Participants illimités",
      "Événements illimités",
      "White-label complet",
      "Support dédié 24/7",
      "Analytics enterprise",
      "Toutes les intégrations",
      "Multi-utilisateurs",
      "SSO (Single Sign-On)",
      "SLA garanti",
      "Formation personnalisée",
      "Développement sur mesure",
    ],
    limitations: [],
  },
]

const faqs = [
  {
    question: "Puis-je changer de plan à tout moment ?",
    answer:
      "Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. Les changements prennent effet immédiatement.",
  },
  {
    question: "Y a-t-il des frais cachés ?",
    answer: "Non, nos prix sont transparents. Aucun frais de configuration ou coût caché.",
  },
  {
    question: "Que se passe-t-il si je dépasse ma limite ?",
    answer: "Nous vous contacterons pour vous proposer un upgrade. Vos événements ne seront jamais interrompus.",
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground sm:text-5xl">Tarifs simples et transparents</h1>
            <p className="mt-4 text-xl text-muted-foreground max-w-3xl mx-auto">
              Choisissez le plan qui correspond à vos besoins. Commencez gratuitement et évoluez selon votre croissance.
            </p>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => {
            const IconComponent = plan.icon
            return (
              <Card
                key={index}
                className={`relative ${plan.popular ? "ring-2 ring-primary shadow-xl scale-105" : "shadow-lg"} transition-all duration-300 hover:shadow-xl`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                    Le plus populaire
                  </Badge>
                )}

                <CardHeader className="text-center pb-8">
                  <div className="flex justify-center mb-4">
                    <div className={`p-3 rounded-full ${plan.popular ? "bg-primary/10" : "bg-muted"}`}>
                      <IconComponent className={`h-8 w-8 ${plan.popular ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <CardDescription className="text-muted-foreground mt-2">{plan.description}</CardDescription>
                  <div className="mt-6">
                    <span className="text-4xl font-bold text-foreground">{plan.price}$</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center">
                        <Check className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                        <span className="text-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {plan.limitations.length > 0 && (
                    <div className="pt-4 border-t border-border">
                      <p className="text-sm text-muted-foreground mb-2">Limitations :</p>
                      <div className="space-y-2">
                        {plan.limitations.map((limitation, limitIndex) => (
                          <div key={limitIndex} className="flex items-center">
                            <span className="text-muted-foreground mr-3">•</span>
                            <span className="text-sm text-muted-foreground">{limitation}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    className={`w-full mt-8 ${plan.popular ? "bg-primary hover:bg-primary/90" : ""}`}
                    variant={plan.popular ? "default" : "outline"}
                    asChild
                  >
                    <Link href="/register">{plan.price === "0" ? "Commencer gratuitement" : "Choisir ce plan"}</Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground">Questions fréquentes</h2>
            <p className="mt-4 text-lg text-muted-foreground">Vous avez des questions ? Nous avons les réponses.</p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">Vous avez d'autres questions ?</p>
            <Button variant="outline" asChild>
              <Link href="/contact">Contactez-nous</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="hero-gradient">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            Prêt à organiser votre prochain événement ?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8">
            Rejoignez des milliers d'organisateurs qui font confiance à Kivu Event.
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
