import Link from "next/link"
import Image from "next/image"
import { CalendarIcon, MapPinIcon, UserGroupIcon } from "@heroicons/react/24/outline"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-white dark:bg-gray-900">
        <div className="hero-gradient absolute inset-0 opacity-10 dark:opacity-20" />
        <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 lg:py-40">
          <div className="md:flex md:items-center md:space-x-12">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
                <span className="block">Organisez vos</span>
                <span className="block text-primary">événements d'entreprise</span>
                <span className="block">sans effort</span>
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-8 text-gray-600 dark:text-gray-300">
                Kivu Event simplifie la gestion de vos séminaires, conférences et ateliers. Suivez vos participants,
                gérez les inscriptions et créez des événements mémorables.
              </p>
              <div className="mt-10 flex items-center gap-x-6">
                <Link
                  href="/events"
                  className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  Découvrir les événements
                </Link>
                <Link href="/register" className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100">
                  Créer un compte <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 relative h-[400px] rounded-xl overflow-hidden shadow-xl">
              <Image src="/images/hero-image.jpg" alt="Événement d'entreprise" fill className="object-cover" priority />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 dark:bg-gray-800 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Tout ce dont vous avez besoin pour vos événements
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              Kivu Event offre une suite complète d'outils pour gérer efficacement vos événements d'entreprise.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 dark:text-white">
                  <CalendarIcon className="h-6 w-6 flex-none text-primary" aria-hidden="true" />
                  Gestion des événements
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-300">
                  <p className="flex-auto">
                    Créez et gérez facilement des conférences, séminaires, ateliers et réunions. Définissez les détails,
                    les horaires et les capacités.
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 dark:text-white">
                  <UserGroupIcon className="h-6 w-6 flex-none text-primary" aria-hidden="true" />
                  Suivi des participants
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-300">
                  <p className="flex-auto">
                    Gérez les inscriptions, suivez les présences et recueillez les commentaires des participants pour
                    améliorer vos futurs événements.
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 dark:text-white">
                  <MapPinIcon className="h-6 w-6 flex-none text-primary" aria-hidden="true" />
                  Gestion des lieux
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-300">
                  <p className="flex-auto">
                    Trouvez et réservez les meilleurs lieux pour vos événements. Gérez les informations sur les
                    installations et les capacités.
                  </p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-white dark:bg-gray-900 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Prêt à organiser votre prochain événement?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-600 dark:text-gray-300">
              Rejoignez Kivu Event dès aujourd'hui et commencez à créer des événements mémorables pour votre entreprise.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/register"
                className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Commencer gratuitement
              </Link>
              <Link href="/contact" className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100">
                Nous contacter <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

