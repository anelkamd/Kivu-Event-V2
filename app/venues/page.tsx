"use client"

import { useQuery } from "@tanstack/react-query"
import axios from "@/lib/axios"
import { motion } from "framer-motion"
import { MapPinIcon, UsersIcon, BuildingOfficeIcon } from "@heroicons/react/24/outline"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import Link from "next/link"
import Image from "next/image"

interface Venue {
    id: string
    name: string
    street: string
    city: string
    state?: string
    country: string
    capacity: number
    facilities: string[]
    description?: string
    images?: string[]
}

export default function VenuesPage() {
    const { data: venues, isLoading } = useQuery<Venue[]>(
        ["venues"],
        async () => {
            try {
                const response = await axios.get("/venues")
                return response.data.data
            } catch (error) {
                console.error("Error fetching venues:", error)
                return []
            }
        }
    )

    return (
        <div className="min-h-screen bg-black text-white py-16">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Lieux d'événements</h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Découvrez nos lieux partenaires pour organiser vos événements professionnels.
                    </p>
                </motion.div>

                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <LoadingSpinner size="lg" />
                    </div>
                ) : venues && venues.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {venues.map((venue, index) => (
                            <motion.div
                                key={venue.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="bg-gray-900 rounded-2xl overflow-hidden hover:shadow-xl transition-all"
                            >
                                <div className="relative h-48">
                                    {venue.images && venue.images.length > 0 ? (
                                        <Image
                                            src={venue.images[0] || "/placeholder.svg"}
                                            alt={venue.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center bg-gray-800">
                                            <BuildingOfficeIcon className="h-16 w-16 text-gray-600" />
                                        </div>
                                    )}
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold mb-2">{venue.name}</h3>
                                    <div className="flex items-center text-gray-400 mb-2">
                                        <MapPinIcon className="h-5 w-5 mr-2" />
                                        <span>
                      {venue.city}, {venue.country}
                    </span>
                                    </div>
                                    <div className="flex items-center text-gray-400 mb-4">
                                        <UsersIcon className="h-5 w-5 mr-2" />
                                        <span>Capacité: {venue.capacity} personnes</span>
                                    </div>
                                    {venue.description && (
                                        <p className="text-gray-300 mb-4 line-clamp-2">{venue.description}</p>
                                    )}
                                    {venue.facilities && venue.facilities.length > 0 && (
                                        <div className="mb-4">
                                            <p className="text-sm font-medium mb-2">Équipements:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {venue.facilities.slice(0, 3).map((facility, i) => (
                                                    <span key={i} className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-full">
                            {facility}
                          </span>
                                                ))}
                                                {venue.facilities.length > 3 && (
                                                    <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-full">
                            +{venue.facilities.length - 3}
                          </span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    <Link
                                        href={`/venues/${venue.id}`}
                                        className="inline-block bg-white text-black font-medium px-4 py-2 rounded-full hover:bg-gray-200 transition-all"
                                    >
                                        Voir les détails
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="text-center py-12 bg-gray-900 rounded-2xl"
                    >
                        <p className="text-gray-400">Aucun lieu disponible pour le moment.</p>
                    </motion.div>
                )}
            </div>
        </div>
    )
}