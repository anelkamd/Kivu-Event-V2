"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { CalendarIcon, UserGroupIcon, BuildingOfficeIcon, ChartBarIcon } from "@heroicons/react/24/outline"

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-black text-white">
            {/* Hero Section */}
            <section className="relative py-20">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-3xl mx-auto text-center"
                    >
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">À propos de Kivu Event</h1>
                        <p className="text-xl text-gray-400">
                            Nous simplifions la gestion des événements d'entreprise pour vous permettre de vous concentrer sur ce qui compte vraiment.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-16 bg-gray-900">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                            viewport={{ once: true }}
                            className="md:w-1/2"
                        >
                            <h2 className="text-3xl font-bold mb-6">Notre mission</h2>
                            <p className="text-gray-300 mb-4">
                                Chez Kivu Event, notre mission est de simplifier l'organisation et la gestion des événements d'entreprise, en offrant une plateforme intuitive et complète qui répond aux besoins des organisateurs et des participants.
                            </p>
                            <p className="text-gray-300">
                                Nous croyons que les événements professionnels sont essentiels pour le développement des entreprises et des individus. C'est pourquoi nous nous engageons à fournir des outils qui facilitent chaque étape du processus, de la planification à l'analyse post-événement.
                            </p>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            viewport={{ once: true }}
                            className="md:w-1/2 relative h-80 rounded-2xl overflow-hidden"
                        >
                            <Image
                                src="/images/about-mission.jpg"
                                alt="Notre mission"
                                fill
                                className="object-cover"
                            />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-black">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl font-bold mb-4">Nos fonctionnalités</h2>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            Une suite complète d'outils pour gérer efficacement vos événements d'entreprise
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            viewport={{ once: true }}
                            className="bg-gray-900 p-6 rounded-2xl"
                        >
                            <div className="bg-gray-800 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                                <CalendarIcon className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-lg font-bold mb-2">Gestion des événements</h3>
                            <p className="text-gray-400">
                                Créez et gérez facilement des conférences, séminaires, ateliers et réunions.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            viewport={{ once: true }}
                            className="bg-gray-900 p-6 rounded-2xl"
                        >
                            <div className="bg-gray-800 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                                <UserGroupIcon className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-lg font-bold mb-2">Suivi des participants</h3>
                            <p className="text-gray-400">
                                Gérez les inscriptions, suivez les présences et recueillez les commentaires.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            viewport={{ once: true }}
                            className="bg-gray-900 p-6 rounded-2xl"
                        >
                            <div className="bg-gray-800 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                                <BuildingOfficeIcon className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-lg font-bold mb-2">Gestion des lieux</h3>
                            <p className="text-gray-400">
                                Trouvez et réservez les meilleurs lieux pour vos événements.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            viewport={{ once: true }}
                            className="bg-gray-900 p-6 rounded-2xl"
                        >
                            <div className="bg-gray-800 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                                <ChartBarIcon className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-lg font-bold mb-2">Analyses et rapports</h3>
                            <p className="text-gray-400">
                                Obtenez des insights précieux sur vos événements et participants.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-gray-900">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                        className="max-w-3xl mx-auto text-center"
                    >
                        <h2 className="text-3xl font-bold mb-6">Prêt à simplifier la gestion de vos événements?</h2>
                        <p className="text-xl text-gray-400 mb-8">
                            Rejoignez Kivu Event dès aujourd'hui et commencez à créer des événements mémorables pour votre entreprise.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Link href="/register" className="px-8 py-4 bg-white text-black font-medium rounded-full inline-block hover:bg-gray-200 transition-all">
                                    Commencer gratuitement
                                </Link>
                            </motion.div>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Link href="/contact" className="px-8 py-4 bg-transparent border border-white text-white font-medium rounded-full inline-block hover:bg-white/10 transition-all">
                                    Nous contacter
                                </Link>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    )
}