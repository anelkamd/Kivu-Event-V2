import Link from "next/link"
import { CalendarIcon, MapPinIcon, UserGroupIcon } from "@heroicons/react/24/outline"

export default function Home() {
  return (
      <div className="flex flex-col min-h-screen bg-black text-white">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-black opacity-80"></div>
          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-4xl mx-auto text-center animate-fade-in">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                Événements d'entreprise sans limites
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-10">
                Planifiez, gérez et suivez vos événements professionnels avec une plateforme intuitive et puissante.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/events" className="px-8 py-4 bg-white text-black font-medium rounded-full inline-block hover:bg-gray-200 transition-all hover:scale-105 active:scale-95">
                  Découvrir les événements
                </Link>
                <Link href="/register" className="px-8 py-4 bg-transparent border border-white text-white font-medium rounded-full inline-block hover:bg-white/10 transition-all hover:scale-105 active:scale-95">
                  Créer un compte
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-900">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16 animate-fade-in">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Fonctionnalités principales</h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Tout ce dont vous avez besoin pour gérer vos événements professionnels
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-10">
              <div className="bg-gray-800 p-8 rounded-2xl animate-fade-in">
                <div className="bg-gray-700 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-6">
                  <CalendarIcon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Gestion des événements</h3>
                <p className="text-gray-400">
                  Créez et gérez facilement des conférences, séminaires, ateliers et réunions avec tous les détails nécessaires.
                </p>
              </div>

              <div className="bg-gray-800 p-8 rounded-2xl animate-fade-in delay-100">
                <div className="bg-gray-700 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-6">
                  <UserGroupIcon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Suivi des participants</h3>
                <p className="text-gray-400">
                  Gérez les inscriptions, suivez les présences et recueillez les commentaires pour améliorer vos futurs événements.
                </p>
              </div>

              <div className="bg-gray-800 p-8 rounded-2xl animate-fade-in delay-200">
                <div className="bg-gray-700 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-6">
                  <MapPinIcon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Gestion des lieux</h3>
                <p className="text-gray-400">
                  Trouvez et réservez les meilleurs lieux pour vos événements avec toutes les informations nécessaires.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-black relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black opacity-80"></div>
          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-4xl mx-auto text-center animate-fade-in">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Prêt à organiser votre prochain événement?</h2>
              <p className="text-xl text-gray-300 mb-10">
                Rejoignez Kivu Event dès aujourd'hui et commencez à créer des événements mémorables pour votre entreprise.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register" className="px-8 py-4 bg-white text-black font-medium rounded-full inline-block hover:bg-gray-200 transition-all hover:scale-105 active:scale-95">
                  Commencer gratuitement
                </Link>
                <Link href="/contact" className="px-8 py-4 bg-transparent border border-white text-white font-medium rounded-full inline-block hover:bg-white/10 transition-all hover:scale-105 active:scale-95">
                  Nous contacter
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
  )
}