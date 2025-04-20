"use client"

import { useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
import { Navbar } from "@/components/layout/NavBar"
import { Footer } from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import { ArrowRight, Calendar, Check, Users, ChevronRight, ExternalLink } from "lucide-react"
import cover from "@/public/images/illustration1.jpg"

export default function LandingPage() {

  const heroRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const testimonialsRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  const heroInView = useInView(heroRef, { once: true, margin: "-100px 0px" })
  const featuresInView = useInView(featuresRef, { once: true, margin: "-100px 0px" })
  const testimonialsInView = useInView(testimonialsRef, { once: true, margin: "-100px 0px" })
  const ctaInView = useInView(ctaRef, { once: true, margin: "-100px 0px" })

  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 500], [0, 150])
  const y2 = useTransform(scrollY, [0, 500], [0, -150])
  const opacity = useTransform(scrollY, [0, 300, 500], [1, 0.5, 0])

  return (
      <div className="flex flex-col min-h-screen bg-white dark:bg-black overflow-hidden">

        <Navbar />

        <motion.section ref={heroRef} className="relative pt-20 pb-24 md:pt-28 md:pb-32 overflow-hidden">

          <motion.div
              className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-black/5 dark:bg-white/5"
              style={{ y: y1 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.2, duration: 0.8 }}
          />
          <motion.div
              className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-black/5 dark:bg-white/5"
              style={{ y: y2 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.4, duration: 0.8 }}
          />

          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row lg:items-center">
              <motion.div
                  className="lg:w-1/2 mb-10 lg:mb-0 lg:pr-10"
                  initial={{ opacity: 0, y: 50 }}
                  animate={heroInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.7, ease: "easeOut" }}
              >
                <motion.span
                    className="inline-block px-3 py-1 mb-6 text-sm font-medium bg-black/10 dark:bg-white/10 rounded-full"
                    initial={{ opacity: 0, x: -20 }}
                    animate={heroInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.3, duration: 0.5 }}
                >
                  Nouveau: Maintenant disponible en version beta v1.0
                </motion.span>

                <motion.h1
                    className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
                    initial={{ opacity: 0 }}
                    animate={heroInView ? { opacity: 1 } : {}}
                    transition={{ delay: 0.5, duration: 0.5 }}
                >
                  Organisez des événements à{" "}
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-black to-gray-600 dark:from-white dark:to-gray-400">
                  impact maximal
                </span>
                </motion.h1>

                <motion.p
                    className="text-lg md:text-xl mb-8 text-gray-700 dark:text-gray-300"
                    initial={{ opacity: 0 }}
                    animate={heroInView ? { opacity: 1 } : {}}
                    transition={{ delay: 0.7, duration: 0.5 }}
                >
                  Kivu Event simplifie la gestion des événements d'entreprise. Planifiez, organisez et suivez vos
                  séminaires et conférences en toute simplicité.
                </motion.p>

                <motion.div
                    className="flex flex-col sm:flex-row gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={heroInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.9, duration: 0.5 }}
                >
                  <Button
                      asChild
                      size="lg"
                      className="bg-black hover:bg-black/90 text-white dark:bg-white dark:text-black dark:hover:bg-white/90 rounded-lg cursor-pointer"
                  >
                    <Link href="/login">
                      Se connecter <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                      asChild
                      size="lg"
                      variant="outline"
                      className="border-black text-black hover:bg-black/5 dark:border-white dark:text-white dark:hover:bg-white/5 rounded-lg"
                  >
                    <Link href="/register">Créer un compte</Link>
                  </Button>
                </motion.div>
              </motion.div>

              <motion.div
                  className="lg:w-1/2 relative"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={heroInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 0.8, duration: 0.7, ease: "easeOut" }}
              >
                <div className="relative z-10">
                  <div className="bg-white dark:bg-black rounded-2xl shadow-xl overflow-hidden border border-black/10 dark:border-white/10">
                    <div className="pt-6 px-6 pb-4 bg-gray-50 dark:bg-gray-900 border-b border-black/10 dark:border-white/10 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      </div>
                      <div className="text-sm font-medium">Kivu Event Dashboard</div>
                      <div className="w-10"></div>
                    </div>
                    <div className="p-6">
                      <div className="mb-6">
                        <div className="text-lg font-bold mb-2">Événements à venir</div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-black/10 dark:border-white/10">
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-semibold">Lancement de Weka</div>
                              <Calendar className="h-4 w-4" />
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">15 Déc 2025</div>
                            <div className="mt-2 text-xs bg-black/10 dark:bg-white/10 text-gray-700 dark:text-gray-300 py-1 px-2 rounded-full w-fit">
                              248 participants
                            </div>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-black/10 dark:border-white/10">
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-semibold">Séminaire Web</div>
                              <Calendar className="h-4 w-4" />
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">20 Déc 2025</div>
                            <div className="mt-2 text-xs bg-black/10 dark:bg-white/10 text-gray-700 dark:text-gray-300 py-1 px-2 rounded-full w-fit">
                              124 participants
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="text-lg font-bold mb-2">Statistiques mensuelles</div>
                        <div className="h-24 flex items-end gap-2 justify-between px-2">
                          {[40, 65, 45, 80, 75, 90].map((height, i) => (
                              <div key={i} className="relative group">
                                <div
                                    className="w-7 bg-black/80 dark:bg-white/80 rounded-t-md transition-all duration-300"
                                    style={{ height: `${height}%` }}
                                ></div>
                                <div className="text-xs text-center text-gray-500 dark:text-gray-400 mt-1">0{i + 1}</div>
                              </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <motion.div
                      className="absolute -right-6 -bottom-6 w-28 h-28 bg-black dark:bg-white rounded-xl transform rotate-6"
                      initial={{ rotate: 0 }}
                      animate={{ rotate: 6 }}
                      transition={{ duration: 1, delay: 1, type: "spring" }}
                  />
                </div>
              </motion.div>
            </div>

            <motion.div
                className="flex flex-wrap items-center justify-center gap-8 mt-20 opacity-70"
                initial={{ opacity: 0, y: 20 }}
                animate={heroInView ? { opacity: 0.7, y: 0 } : {}}
                transition={{ delay: 1.2, duration: 0.5 }}
            >
              <div className="text-sm font-medium">Ils nous font confiance</div>
              {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-8 w-24 bg-gray-400 dark:bg-gray-600 rounded opacity-50"></div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        <section ref={featuresRef} className="py-20 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <motion.div
                className="text-center mb-16"
                initial={{ opacity: 0, y: 20 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Tout ce qu'il faut pour vos événements d'entreprise</h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
                Notre solution complète vous aide à planifier, organiser et gérer tous vos événements professionnels.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: "Organisation simplifiée",
                  description: "Créez et gérez vos événements en quelques clics avec notre interface intuitive.",
                  icon: Calendar,
                  delay: 0.2,
                },
                {
                  title: "Gestion des participants",
                  description: "Suivez les inscriptions et les présences en temps réel pour optimiser votre événement.",
                  icon: Users,
                  delay: 0.4,
                },
                {
                  title: "Analyses détaillées",
                  description: "Obtenez des insights précieux pour améliorer vos futurs événements.",
                  icon: ExternalLink,
                  delay: 0.6,
                },
              ].map((feature, index) => (
                  <motion.div
                      key={index}
                      className="bg-white dark:bg-black rounded-xl p-6 shadow-md border border-black/10 dark:border-white/10"
                      initial={{ opacity: 0, y: 20 }}
                      animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ delay: feature.delay, duration: 0.5 }}
                  >
                    <motion.div
                        className="w-12 h-12 rounded-lg bg-black dark:bg-white text-white dark:text-black flex items-center justify-center mb-4"
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <feature.icon className="h-6 w-6" />
                    </motion.div>
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-gray-700 dark:text-gray-300">{feature.description}</p>
                  </motion.div>
              ))}
            </div>

            <motion.div
                className="mt-16 bg-white dark:bg-black rounded-xl shadow-lg overflow-hidden border border-black/10 dark:border-white/10"
                initial={{ opacity: 0, y: 30 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.8, duration: 0.6 }}
            >
              <div className="grid md:grid-cols-2 gap-0">
                <div className="p-8 md:p-12">
                  <div className="text-sm uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">
                    Comment ça marche
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-6">
                    Obtenez une vue d'ensemble de tous vos événements
                  </h3>
                  <div className="space-y-4">
                    {[
                      "Tableau de bord centralisé pour tous vos événements",
                      "Création d'événements en quelques étapes",
                      "Gestion des inscriptions et des paiements",
                      "Suivi des participants et des performances",
                      "Analyses et rapports détaillés",
                    ].map((item, index) => (
                        <motion.div
                            key={index}
                            className="flex items-start"
                            initial={{ opacity: 0, x: -10 }}
                            animate={featuresInView ? { opacity: 1, x: 0 } : {}}
                            transition={{ delay: 0.9 + index * 0.1, duration: 0.4 }}
                        >
                          <div className="mr-3 mt-1">
                            <Check className="h-5 w-5 text-black dark:text-white" />
                          </div>
                          <p>{item}</p>
                        </motion.div>
                    ))}
                  </div>
                  <motion.div
                      className="mt-8"
                      initial={{ opacity: 0 }}
                      animate={featuresInView ? { opacity: 1 } : {}}
                      transition={{ delay: 1.5, duration: 0.5 }}
                  >
                    <Button
                        asChild
                        className="bg-black hover:bg-black/90 text-white dark:bg-white dark:hover:bg-white/90 dark:text-black rounded-lg"
                    >
                      <Link href="/login">
                        Essayer gratuitement <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </motion.div>
                </div>
                <div className="relative">
                  <div className="h-full w-full bg-white dark:bg-gray-800 overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center">
                      <Image
                          src={cover}
                          alt="Dashboard Kivu Event"
                          width={600}
                          height={400}
                          className="object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section ref={testimonialsRef} className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
                className="text-center mb-16"
                initial={{ opacity: 0, y: 20 }}
                animate={testimonialsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ce que nos clients disent</h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
                Découvrez comment Kivu Event aide des entreprises à organiser des événements exceptionnels.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: "Baraka Espoir",
                  position: "Developpeur Web, ISIG Goma",
                  quote:
                      "Kivu Event a révolutionné notre façon d'organiser des événements professionnels. Tout est devenu plus simple et plus efficace.",
                  delay: 0.2,
                },
                {
                  name: "Josias Kabambi",
                  position: "Manager, G-SoluTech",
                  quote:
                      "La gestion des participants et le suivi des performances nous ont permis d'améliorer considérablement nos séminaires d'entreprise.",
                  delay: 0.4,
                },
                {
                  name: "Greg Banza",
                  position: "CEO, StartupLab",
                  quote:
                      "Une solution complète qui nous fait gagner un temps précieux. L'interface est intuitive et les fonctionnalités sont nombreuses.",
                  delay: 0.6,
                },
              ].map((testimonial, index) => (
                  <motion.div
                      key={index}
                      className="bg-white dark:bg-black rounded-xl p-6 shadow-md border border-black/10 dark:border-white/10"
                      initial={{ opacity: 0, y: 20 }}
                      animate={testimonialsInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ delay: testimonial.delay, duration: 0.5 }}
                      whileHover={{ y: -5 }}
                  >
                    <div className="h-24 flex items-center">
                      <p className="text-gray-700 dark:text-gray-300 italic">"{testimonial.quote}"</p>
                    </div>
                    <div className="mt-6 flex items-center">
                      <div className="w-10 h-10 rounded-full bg-black/10 dark:bg-white/10"></div>
                      <div className="ml-3">
                        <p className="font-medium">{testimonial.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.position}</p>
                      </div>
                    </div>
                  </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section ref={ctaRef} className="py-20 bg-black text-white dark:bg-white dark:text-black">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <motion.h2
                  className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={ctaInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.7 }}
              >
                Prêt à transformer vos événements d'entreprise?
              </motion.h2>
              <motion.p
                  className="text-lg md:text-xl mb-10 text-white/80 dark:text-black/80"
                  initial={{ opacity: 0 }}
                  animate={ctaInView ? { opacity: 1 } : {}}
                  transition={{ delay: 0.3, duration: 0.7 }}
              >
                Rejoignez des centaines d'entreprises qui utilisent déjà Kivu Event pour leurs séminaires et conférences.
              </motion.p>

              <motion.div
                  className="flex flex-col sm:flex-row gap-4 justify-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={ctaInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.6, duration: 0.5 }}
              >
                <Button
                    asChild
                    size="lg"
                    className="bg-white hover:bg-white/90 text-black dark:bg-black dark:text-white dark:hover:bg-black/90 rounded-lg"
                >
                  <Link href="/register">
                    Créer un compte <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="border-white text-black hover:text-white hover:bg-white/10 dark:border-black dark:text-white dark:hover:bg-black/10 dark:hover:text-black rounded-lg"
                >
                  <Link href="/login">Se connecter</Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
  )
}