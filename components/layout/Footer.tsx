"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Footer() {
  return (
      <footer className="bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <motion.div
                className="col-span-1 md:col-span-2"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
            >
              <Link href="/" className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-md bg-black text-white dark:bg-white dark:text-black font-bold">
                  KE
                </div>
                <span className="font-semibold text-lg">Kivu Event</span>
              </Link>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 max-w-md">
                Kivu Event est une plateforme complète de gestion d'événements d'entreprise, conçue pour simplifier
                l'organisation de séminaires, conférences et autres événements professionnels.
              </p>

              <motion.div
                  className="mt-6"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, duration: 0.7 }}
              >
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input type="email" placeholder="Votre email" className="rounded-lg" />
                  <Button className="bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90">
                    Newsletter <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.7 }}
            >
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 tracking-wider uppercase">Produit</h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link
                      href="/features"
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
                  >
                    Fonctionnalités
                  </Link>
                </li>
                <li>
                  <Link
                      href="/pricing"
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
                  >
                    Tarifs
                  </Link>
                </li>
                <li>
                  <Link
                      href="/testimonials"
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
                  >
                    Témoignages
                  </Link>
                </li>
                <li>
                  <Link
                      href="/faq"
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
                  >
                    FAQ
                  </Link>
                </li>
              </ul>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.7 }}
            >
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 tracking-wider uppercase">
                Entreprise
              </h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link
                      href="/about"
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
                  >
                    À propos
                  </Link>
                </li>
                <li>
                  <Link
                      href="/contact"
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                      href="/privacy"
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
                  >
                    Politique de confidentialité
                  </Link>
                </li>
                <li>
                  <Link
                      href="/terms"
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
                  >
                    Conditions d'utilisation
                  </Link>
                </li>
              </ul>
            </motion.div>
          </div>

          <motion.div
              className="mt-12 border-t border-gray-200 dark:border-gray-800 pt-8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 0.7 }}
          >
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              &copy; {new Date().getFullYear()} Kivu Event. Tous droits réservés.
            </p>
          </motion.div>
        </div>
      </footer>
  )
}