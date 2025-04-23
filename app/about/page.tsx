"use client"

import { motion } from "framer-motion"
import { Navbar } from "@/components/layout/NavBar"
import { Footer } from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle, Users, Calendar, Award } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function AboutPage() {
    return (
        <div className="flex flex-col min-h-screen bg-white dark:bg-black">
            <Navbar />

            <main className="flex-grow">
                {/* Hero Section */}
                <section className="py-20 md:py-28">
                    <div className="container mx-auto px-4">
                        <div className="max-w-3xl mx-auto text-center">
                            <motion.h1
                                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.7 }}
                            >
                                À propos de{" "}
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-black to-gray-600 dark:from-white dark:to-gray-400">
                                    Kivu Event
                                </span>
                            </motion.h1>
                            <motion.p
                                className="text-lg md:text-xl mb-8 text-gray-700 dark:text-gray-300"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3, duration: 0.7 }}
                            >
                                Découvrez l'histoire et la mission derrière notre plateforme de gestion d'événements d'entreprise.
                            </motion.p>
                        </div>
                    </div>
                </section>

                {/* Notre histoire */}
                <section className="py-16 bg-gray-50 dark:bg-gray-900">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.7 }}
                            >
                                <h2 className="text-3xl font-bold mb-6">Notre histoire</h2>
                                <p className="text-gray-700 dark:text-gray-300 mb-4">
                                    Kivu Event est né d'une vision simple mais puissante : simplifier la gestion des événements
                                    d'entreprise pour permettre aux organisateurs de se concentrer sur ce qui compte vraiment - créer des
                                    expériences mémorables.
                                </p>
                                <p className="text-gray-700 dark:text-gray-300 mb-4">
                                    Fondé par Anelka MD, un entrepreneur passionné par l'innovation technologique et l'expérience
                                    utilisateur, Kivu Event a été développé pour répondre aux défis spécifiques rencontrés par les
                                    organisateurs d'événements professionnels.
                                </p>
                                <p className="text-gray-700 dark:text-gray-300">
                                    Depuis sa création, notre plateforme n'a cessé d'évoluer, intégrant les retours de nos utilisateurs et
                                    les dernières avancées technologiques pour offrir une solution complète et intuitive.
                                </p>
                            </motion.div>
                            <motion.div
                                className="relative"
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2, duration: 0.7 }}
                            >
                                <div className="aspect-video bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden relative">
                                    <Image
                                        src="/placeholder.svg?height=400&width=600"
                                        alt="L'équipe Kivu Event"
                                        width={600}
                                        height={400}
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-black dark:bg-white rounded-xl transform rotate-6"></div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Notre mission */}
                <section className="py-16">
                    <div className="container mx-auto px-4">
                        <div className="max-w-3xl mx-auto text-center mb-12">
                            <motion.h2
                                className="text-3xl font-bold mb-6"
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.7 }}
                            >
                                Notre mission
                            </motion.h2>
                            <motion.p
                                className="text-lg text-gray-700 dark:text-gray-300"
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2, duration: 0.7 }}
                            >
                                Chez Kivu Event, nous nous engageons à transformer la façon dont les entreprises organisent et gèrent
                                leurs événements professionnels.
                            </motion.p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: Users,
                                    title: "Simplifier",
                                    description:
                                        "Rendre la gestion d'événements accessible à tous, quelle que soit leur expertise technique.",
                                    delay: 0.1,
                                },
                                {
                                    icon: Calendar,
                                    title: "Optimiser",
                                    description:
                                        "Améliorer l'efficacité des processus d'organisation pour gagner du temps et réduire les coûts.",
                                    delay: 0.3,
                                },
                                {
                                    icon: Award,
                                    title: "Innover",
                                    description:
                                        "Intégrer continuellement de nouvelles fonctionnalités pour répondre aux besoins évolutifs du marché.",
                                    delay: 0.5,
                                },
                            ].map((item, index) => (
                                <motion.div
                                    key={index}
                                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: item.delay, duration: 0.5 }}
                                >
                                    <div className="w-12 h-12 rounded-lg bg-black dark:bg-white text-white dark:text-black flex items-center justify-center mb-4">
                                        <item.icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                                    <p className="text-gray-700 dark:text-gray-300">{item.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Fondateur */}
                <section className="py-16 bg-gray-50 dark:bg-gray-900">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <motion.div
                                className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-100 dark:border-gray-700"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.7 }}
                            >
                                <div className="flex flex-col md:flex-row items-center gap-8">
                                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                                        <Image
                                            src="/profil.JPG"
                                            alt="Anelka MD"
                                            width={128}
                                            height={128}
                                            className="object-cover w-full h-full"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold mb-2">Anelka MD</h3>
                                        <p className="text-gray-600 dark:text-gray-400 mb-4">Fondateur & CEO</p>
                                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                                            "Notre vision est de créer une plateforme qui non seulement simplifie la gestion des événements,
                                            mais qui transforme également la façon dont les entreprises interagissent avec leurs participants.
                                            Nous croyons que chaque événement est une opportunité de créer des connexions significatives."
                                        </p>
                                        <div className="flex gap-4">
                                            <Link href="https://x.com/Anelka_MD">
                                                <Button variant="outline" size="sm">
                                                    Twitter
                                                </Button>
                                            </Link>
                                            <Link href="https://www.linkedin.com/in/anelkamd/">
                                                <Button variant="outline" size="sm">
                                                    Linkedin
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Nos valeurs */}
                <section className="py-16">
                    <div className="container mx-auto px-4">
                        <div className="max-w-3xl mx-auto text-center mb-12">
                            <motion.h2
                                className="text-3xl font-bold mb-6"
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.7 }}
                            >
                                Nos valeurs
                            </motion.h2>
                            <motion.p
                                className="text-lg text-gray-700 dark:text-gray-300"
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2, duration: 0.7 }}
                            >
                                Les principes qui guident nos décisions et notre développement.
                            </motion.p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                {
                                    title: "Innovation",
                                    description:
                                        "Nous repoussons constamment les limites de ce qui est possible dans la gestion d'événements.",
                                },
                                {
                                    title: "Excellence",
                                    description: "Nous nous efforçons d'offrir la meilleure expérience possible à nos utilisateurs.",
                                },
                                {
                                    title: "Collaboration",
                                    description: "Nous croyons au pouvoir du travail d'équipe et des partenariats stratégiques.",
                                },
                                {
                                    title: "Intégrité",
                                    description: "Nous agissons avec honnêteté et transparence dans toutes nos interactions.",
                                },
                            ].map((value, index) => (
                                <motion.div
                                    key={index}
                                    className="flex items-start p-4"
                                    initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1, duration: 0.5 }}
                                >
                                    <CheckCircle className="h-6 w-6 text-black dark:text-white mr-3 mt-1" />
                                    <div>
                                        <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                                        <p className="text-gray-700 dark:text-gray-300">{value.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-16 bg-black text-white dark:bg-white dark:text-black">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto text-center">
                            <motion.h2
                                className="text-3xl md:text-4xl font-bold mb-6"
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.7 }}
                            >
                                Prêt à transformer vos événements d'entreprise ?
                            </motion.h2>
                            <motion.p
                                className="text-lg mb-8 text-white/80 dark:text-black/80"
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2, duration: 0.7 }}
                            >
                                Rejoignez des centaines d'entreprises qui utilisent déjà Kivu Event pour leurs séminaires et
                                conférences.
                            </motion.p>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.4, duration: 0.5 }}
                            >
                                <Button
                                    asChild
                                    size="lg"
                                    className="bg-white hover:bg-white/90 text-black dark:bg-black dark:text-white dark:hover:bg-black/90"
                                >
                                    <Link href="/register">
                                        Commencer maintenant <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </motion.div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}
