"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Quote } from "lucide-react"
import Link from "next/link"
import { Footer } from "@/components/layout/Footer"
import { Navbar } from "@/components/layout/NavBar"

const testimonials = [
  {
    name: "Marie Dubois",
    role: "Directrice Marketing",
    company: "TechCorp",
    image: "/avatar/avatar11.png",
    rating: 4,
    text: "Kivu Event a révolutionné notre façon d'organiser des événements. L'interface est intuitive et les fonctionnalités de gestion des participants sont exceptionnelles. Nous avons organisé plus de 20 événements avec succès !",
    eventType: "Conférences Tech",
    participants: "500+",
  },
  {
    name: "Jean-Claude Mukendi",
    role: "Fondateur",
    company: "StartupHub Kinshasa",
    image: "/avatar/avatar1.png",
    rating: 3,
    text: "En tant qu'organisateur d'événements startup en RDC, j'avais besoin d'une solution locale et efficace. Kivu Event répond parfaitement à nos besoins avec un support client exceptionnel.",
    eventType: "Événements Startup",
    participants: "200+",
  },
  {
    name: "Sarah Johnson",
    role: "Event Manager",
    company: "Global Events Inc",
    image: "/avatar/avatar21.png",
    rating: 5,
    text: "La fonctionnalité de QR code pour le check-in a considérablement réduit nos temps d'attente. Les analytics en temps réel nous permettent d'optimiser nos événements en direct.",
    eventType: "Événements Corporate",
    participants: "1000+",
  },
  {
    name: "Dr. Amina Hassan",
    role: "Professeure",
    company: "Université de Lubumbashi",
    image: "/avatar/avatar2.png",
    rating: 4,
    text: "Pour nos conférences académiques, Kivu Event offre toutes les fonctionnalités nécessaires. La gestion des speakers et des sessions est remarquablement bien pensée.",
    eventType: "Conférences Académiques",
    participants: "300+",
  },
  {
    name: "Pierre Kalala",
    role: "Directeur Commercial",
    company: "EventPro Solutions",
    image: "/avatar/avatar3.png",
    rating: 5,
    text: "Nous utilisons Kivu Event pour tous nos clients. La personnalisation white-label nous permet de maintenir notre identité de marque tout en offrant une expérience premium.",
    eventType: "Événements B2B",
    participants: "800+",
  },
  {
    name: "Fatima Al-Rashid",
    role: "Community Manager",
    company: "Women in Tech Africa",
    image: "/avatar/avatar31.png",
    rating: 3,
    text: "L'équipe de Kivu Event comprend vraiment les défis de l'organisation d'événements en Afrique. Leur plateforme s'adapte parfaitement à notre contexte local.",
    eventType: "Événements Communautaires",
    participants: "400+",
  },
]

const stats = [
  { label: "Événements organisés", value: "5,000+" },
  { label: "Participants satisfaits", value: "10,000+" },
  { label: "Organisateurs actifs", value: "1,500+" },
  { label: "Provinces couverts", value: "10+" },
]

export default function TestimonialsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Navbar />
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mt-8">
            <h1 className="text-4xl font-bold text-foreground sm:text-5xl">Ce que disent nos clients</h1>
            <p className="mt-4 text-xl text-muted-foreground max-w-3xl mx-auto">
              Découvrez comment Kivu Event aide des milliers d'organisateurs à créer des événements mémorables à travers
              l'Afrique et au-delà.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="hero-gradient text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-primary-foreground/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                {/* Quote Icon */}
                <div className="flex justify-between items-start mb-4">
                  <Quote className="h-8 w-8 text-primary opacity-50" />
                  <div className="flex">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>

                {/* Testimonial Text */}
                <p className="text-foreground mb-6 leading-relaxed">"{testimonial.text}"</p>

                {/* Event Info */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="secondary">{testimonial.eventType}</Badge>
                  <Badge variant="outline">{testimonial.participants} participants</Badge>
                </div>

                {/* Author Info */}
                <div className="flex items-center">
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarImage src={testimonial.image || "/placeholder.svg"} alt={testimonial.name} />
                    <AvatarFallback>
                      {testimonial.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.company}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Success Stories Section */}
      <div className="bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Histoires de succès</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              De petits meetups aux grandes conférences internationales, découvrez comment nos clients transforment
              leurs idées en événements exceptionnels.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-4">TechCorp : De 50 à 500 participants en 6 mois</h3>
              <p className="text-muted-foreground mb-6">
                Marie Dubois et son équipe ont commencé avec de petits meetups techniques. Grâce aux outils d'analytics
                de Kivu Event, ils ont pu identifier les sujets les plus populaires et faire évoluer leurs événements
                vers des conférences majeures attirant des centaines de participants.
              </p>
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="font-semibold text-green-600 mr-2">✓</span>
                  <span className="text-foreground">Croissance de 1000% en participants</span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold text-green-600 mr-2">✓</span>
                  <span className="text-foreground">Taux de satisfaction de 98%</span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold text-green-600 mr-2">✓</span>
                  <span className="text-foreground">ROI événementiel multiplié par 5</span>
                </div>
              </div>
            </div>
            <div className="bg-muted p-8 rounded-lg">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">500+</div>
                <div className="text-foreground mb-4">Participants par événement</div>
                <div className="text-2xl font-bold text-primary mb-2">98%</div>
                <div className="text-foreground">Taux de satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="hero-gradient">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">Rejoignez nos clients satisfaits</h2>
          <p className="text-xl text-primary-foreground/80 mb-8">
            Commencez votre histoire de succès avec Kivu Event dès aujourd'hui.
          </p>
          <div className="space-x-4">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/register">Essayer gratuitement</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
              asChild
            >
              <Link href="/pricing">Voir les tarifs</Link>
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
