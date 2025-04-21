"use client"

import { motion } from "framer-motion"
import { Navbar } from "@/components/layout/NavBar"
import { Footer } from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle, Calendar, Users, QrCode, BarChart, MessageSquare, Mail } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function FeaturesPage() {
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
                                Fonctionnalités{" "}
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-black to-gray-600 dark:from-white dark:to-gray-400">
                  complètes
                </span>
                            </motion.h1>
                            <motion.p
                                className="text-lg md:text-xl mb-8 text-gray-700 dark:text-gray-300"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3, duration: 0.7 }}
                            >
                                Découvrez tous les outils dont vous avez besoin pour organiser des événements d'entreprise réussis.
                            </motion.p>
                        </div>
                    </div>
                </section>

                {/* Fonctionnalités principales */}
                <section className="py-16 bg-gray-50 dark:bg-gray-900">
                    <div className="container mx-auto px-4">
                        <div className="max-w-3xl mx-auto text-center mb-12">
                            <motion.h2
                                className="text-3xl font-bold mb-6"
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.7 }}
                            >
                                Fonctionnalités principales
                            </motion.h2>
                            <motion.p
                                className="text-lg text-gray-700 dark:text-gray-300"
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2, duration: 0.7 }}
                            >
                                Tout ce dont vous avez besoin pour gérer vos événements de A à Z.
                            </motion.p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: Calendar,
                                    title: "Gestion des événements",
                                    description: "Créez et gérez facilement tous vos événements d'entreprise en un seul endroit.",
                                    delay: 0.1,
                                },
                                {
                                    icon: Users,
                                    title: "Gestion des participants",
                                    description: "Suivez les inscriptions, envoyez des invitations et gérez la liste des participants.",
                                    delay: 0.3,
                                },
                                {
                                    icon: QrCode,
                                    title: "Check-in QR Code",
                                    description:
                                        "Simplifiez l'enregistrement des participants le jour de l'événement avec notre système de QR code.",
                                    delay: 0.5,
                                },
                                {
                                    icon: BarChart,
                                    title: "Analyses détaillées",
                                    description:
                                        "Obtenez des insights précieux sur vos événements pour améliorer vos futures organisations.",
                                    delay: 0.7,
                                },
                                {
                                    icon: MessageSquare,
                                    title: "Networking",
                                    description: "Facilitez les connexions entre participants avec notre outil de mise en relation.",
                                    delay: 0.9,
                                },
                                {
                                    icon: Mail,
                                    title: "Enquêtes post-événement",
                                    description: "Recueillez les retours des participants pour améliorer vos prochains événements.",
                                    delay: 1.1,
                                },
                            ].map((feature, index) => (
                                <motion.div
                                    key={index}
                                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: feature.delay, duration: 0.5 }}
                                >
                                    <div className="w-12 h-12 rounded-lg bg-black dark:bg-white text-white dark:text-black flex items-center justify-center mb-4">
                                        <feature.icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                                    <p className="text-gray-700 dark:text-gray-300">{feature.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Fonctionnalité en détail - Gestion des événements */}
                <section className="py-16">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.7 }}
                            >
                                <h2 className="text-3xl font-bold mb-6">Gestion des événements simplifiée</h2>
                                <p className="text-gray-700 dark:text-gray-300 mb-6">
                                    Notre plateforme vous permet de créer et gérer tous vos événements d'entreprise en quelques clics. Que
                                    ce soit pour des conférences, des séminaires ou des ateliers, Kivu Event vous offre tous les outils
                                    nécessaires.
                                </p>
                                <ul className="space-y-3 mb-6">
                                    {[
                                        "Création d'événements en quelques étapes",
                                        "Personnalisation complète des détails",
                                        "Gestion des dates et des lieux",
                                        "Contrôle des inscriptions et de la capacité",
                                        "Statuts d'événements personnalisables",
                                    ].map((item, index) => (
                                        <li key={index} className="flex items-start">
                                            <CheckCircle className="h-5 w-5 text-black dark:text-white mr-2 mt-0.5" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Button
                                    asChild
                                    className="bg-black hover:bg-black/90 text-white dark:bg-white dark:hover:bg-white/90 dark:text-black"
                                >
                                    <Link href="/register">
                                        Essayer maintenant <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
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
                                        alt="Interface de gestion d'événements"
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

                {/* Fonctionnalité en détail - Check-in QR Code */}
                <section className="py-16 bg-gray-50 dark:bg-gray-900">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            <motion.div
                                className="relative order-2 md:order-1"
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2, duration: 0.7 }}
                            >
                                <div className="aspect-video bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden relative">
                                    <Image
                                        src="/placeholder.svg?height=400&width=600"
                                        alt="Système de check-in par QR code"
                                        width={600}
                                        height={400}
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                                <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-black dark:bg-white rounded-xl transform -rotate-6"></div>
                            </motion.div>
                            <motion.div
                                className="order-1 md:order-2"
                                initial={{ opacity: 0, x: 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.7 }}
                            >
                                <h2 className="text-3xl font-bold mb-6">Check-in rapide par QR code</h2>
                                <p className="text-gray-700 dark:text-gray-300 mb-6">
                                    Simplifiez l'enregistrement des participants le jour de l'événement avec notre système de QR code.
                                    Plus besoin de longues files d'attente ou de processus manuels fastidieux.
                                </p>
                                <ul className="space-y-3 mb-6">
                                    {[
                                        "Génération automatique de QR codes uniques",
                                        "Scan rapide via l'application mobile",
                                        "Suivi en temps réel des présences",
                                        "Statistiques de participation instantanées",
                                        "Mode hors ligne disponible",
                                    ].map((item, index) => (
                                        <li key={index} className="flex items-start">
                                            <CheckCircle className="h-5 w-5 text-black dark:text-white mr-2 mt-0.5" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Button
                                    asChild
                                    className="bg-black hover:bg-black/90 text-white dark:bg-white dark:hover:bg-white/90 dark:text-black"
                                >
                                    <Link href="/register">
                                        Découvrir cette fonctionnalité <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Fonctionnalité en détail - Analyses */}
                <section className="py-16">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.7 }}
                            >
                                <h2 className="text-3xl font-bold mb-6">Analyses détaillées</h2>
                                <p className="text-gray-700 dark:text-gray-300 mb-6">
                                    Prenez des décisions éclairées grâce à nos tableaux de bord d'analyse complets. Suivez les
                                    performances de vos événements et identifiez les opportunités d'amélioration.
                                </p>
                                <ul className="space-y-3 mb-6">
                                    {[
                                        "Tableaux de bord personnalisables",
                                        "Suivi des taux de participation",
                                        "Analyse des retours des participants",
                                        "Comparaison entre événements",
                                        "Rapports exportables",
                                    ].map((item, index) => (
                                        <li key={index} className="flex items-start">
                                            <CheckCircle className="h-5 w-5 text-black dark:text-white mr-2 mt-0.5" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Button
                                    asChild
                                    className="bg-black hover:bg-black/90 text-white dark:bg-white dark:hover:bg-white/90 dark:text-black"
                                >
                                    <Link href="/register">
                                        Explorer les analyses <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
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
                                        alt="Tableaux de bord d'analyse"
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

                {/* Tableau comparatif */}
                <section className="py-16 bg-gray-50 dark:bg-gray-900">
                    <div className="container mx-auto px-4">
                        <div className="max-w-3xl mx-auto text-center mb-12">
                            <motion.h2
                                className="text-3xl font-bold mb-6"
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.7 }}
                            >
                                Comparaison des fonctionnalités
                            </motion.h2>
                            <motion.p
                                className="text-lg text-gray-700 dark:text-gray-300"
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2, duration: 0.7 }}
                            >
                                Découvrez pourquoi Kivu Event est la solution idéale pour vos événements d'entreprise.
                            </motion.p>
                        </div>

                        <motion.div
                            className="overflow-x-auto"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4, duration: 0.7 }}
                        >
                            <table className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-md">
                                <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700">
                                    <th className="py-4 px-6 text-left">Fonctionnalités</th>
                                    <th className="py-4 px-6 text-center">Kivu Event</th>
                                    <th className="py-4 px-6 text-center">Solutions traditionnelles</th>
                                </tr>
                                </thead>
                                <tbody>
                                {[
                                    { feature: "Création d'événements", kivu: true, others: true },
                                    { feature: "Gestion des participants", kivu: true, others: true },
                                    { feature: "Check-in par QR code", kivu: true, others: false },
                                    { feature: "Analyses détaillées", kivu: true, others: false },
                                    { feature: "Networking entre participants", kivu: true, others: false },
                                    { feature: "Enquêtes post-événement", kivu: true, others: true },
                                    { feature: "Interface intuitive", kivu: true, others: false },
                                    { feature: "Support technique dédié", kivu: true, others: false },
                                ].map((row, index) => (
                                    <tr key={index} className="border-b border-gray-200 dark:border-gray-700">
                                        <td className="py-4 px-6">{row.feature}</td>
                                        <td className="py-4 px-6 text-center">
                                            {row.kivu ? (
                                                <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                                            ) : (
                                                <span className="text-red-500">✕</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            {row.others ? (
                                                <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                                            ) : (
                                                <span className="text-red-500">✕</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </motion.div>
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
