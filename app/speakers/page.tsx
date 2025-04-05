import { GetStaticProps } from 'next'
import { motion } from "framer-motion"
import { UserIcon, BriefcaseIcon, StarIcon } from "@heroicons/react/24/outline"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import Link from "next/link"
import Image from "next/image"
import axios from "@/lib/axios"

interface Speaker {
    id: string
    name: string
    email: string
    bio: string
    expertise: string[]
    company?: string
    jobTitle?: string
    profileImage?: string
    rating?: number
}

interface SpeakersPageProps {
    speakers: Speaker[]
}

export default function SpeakersPage({ speakers }: SpeakersPageProps) {
    return (
        <div className="min-h-screen bg-black text-white py-16">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Nos intervenants</h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Découvrez les experts qui animent nos événements professionnels.
                    </p>
                </motion.div>

                {speakers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {speakers.map((speaker, index) => (
                            <motion.div
                                key={speaker.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="bg-gray-900 rounded-2xl overflow-hidden hover:shadow-xl transition-all"
                            >
                                <div className="p-6 flex flex-col items-center">
                                    <div className="relative h-32 w-32 rounded-full overflow-hidden mb-4">
                                        {speaker.profileImage ? (
                                            <Image
                                                src={speaker.profileImage || "/placeholder.svg"}
                                                alt={speaker.name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center bg-gray-800">
                                                <UserIcon className="h-16 w-16 text-gray-600" />
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="text-xl font-bold mb-1 text-center">{speaker.name}</h3>
                                    {(speaker.jobTitle || speaker.company) && (
                                        <div className="flex items-center text-gray-400 mb-2">
                                            <BriefcaseIcon className="h-4 w-4 mr-1" />
                                            <span>
                                                {speaker.jobTitle}
                                                {speaker.jobTitle && speaker.company && " - "}
                                                {speaker.company}
                                            </span>
                                        </div>
                                    )}
                                    {speaker.rating && (
                                        <div className="flex items-center text-gray-400 mb-4">
                                            <StarIcon className="h-4 w-4 mr-1 text-yellow-500" />
                                            <span>{speaker.rating.toFixed(1)}/5</span>
                                        </div>
                                    )}
                                    <p className="text-gray-300 mb-4 text-center line-clamp-3">{speaker.bio}</p>
                                    {speaker.expertise && speaker.expertise.length > 0 && (
                                        <div className="mb-4 w-full">
                                            <div className="flex flex-wrap gap-2 justify-center">
                                                {speaker.expertise.slice(0, 3).map((exp, i) => (
                                                    <span key={i} className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-full">
                                                        {exp}
                                                    </span>
                                                ))}
                                                {speaker.expertise.length > 3 && (
                                                    <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-full">
                                                        +{speaker.expertise.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    <Link
                                        href={`/speakers/${speaker.id}`}
                                        className="inline-block bg-white text-black font-medium px-4 py-2 rounded-full hover:bg-gray-200 transition-all"
                                    >
                                        Voir le profil
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
                        <p className="text-gray-400">Aucun intervenant disponible pour le moment.</p>
                    </motion.div>
                )}
            </div>
        </div>
    )
}

// Fonction pour récupérer les données avant la génération statique
export const getStaticProps: GetStaticProps = async () => {
    try {
        const response = await axios.get("/speakers")
        const speakers = response.data.data
        return {
            props: {
                speakers
            },
            revalidate: 60 // La page sera régénérée chaque minute
        }
    } catch (error) {
        console.error("Error fetching speakers:", error)
        return {
            props: {
                speakers: []
            },
            revalidate: 60
        }
    }
}
