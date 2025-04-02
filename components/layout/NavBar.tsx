"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Menu, X, Moon, Sun } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { theme, setTheme } = useTheme()
  const isDark = theme === "dark"

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
      <motion.header
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
              scrolled ? "bg-white/95 dark:bg-black/95 backdrop-blur-sm shadow-sm" : "bg-transparent"
          }`}
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <motion.div
                className="flex items-center"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Link href="/" className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-md bg-black text-white dark:bg-white dark:text-black font-bold">
                  KE
                </div>
                <span className="font-semibold text-lg">Kivu Event</span>
              </Link>

              <nav className="hidden md:ml-10 md:flex md:space-x-8">
                <Link
                    href="/features"
                    className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white px-3 py-2 text-sm font-medium"
                >
                  Fonctionnalités
                </Link>
                <Link
                    href="/pricing"
                    className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white px-3 py-2 text-sm font-medium"
                >
                  Tarifs
                </Link>
                <Link
                    href="/about"
                    className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white px-3 py-2 text-sm font-medium"
                >
                  À propos
                </Link>
                <Link
                    href="/contact"
                    className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white px-3 py-2 text-sm font-medium"
                >
                  Contact
                </Link>
              </nav>
            </motion.div>

            <motion.div
                className="hidden md:flex items-center space-x-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Button variant="ghost" size="icon" onClick={() => setTheme(isDark ? "light" : "dark")}>
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/login">Se connecter</Link>
              </Button>
              <motion.button
                  className="bg-black hover:bg-black/90 text-white dark:bg-white dark:text-black dark:hover:bg-white/90 px-4 py-2 rounded-md"
                  whileHover={{scale: 1.05}}
                  whileTap={{scale: 0.95}}
              >
                <Link href="/register">S'inscrire</Link>
              </motion.button>
            </motion.div>

            <motion.div className="flex items-center md:hidden" initial={{opacity: 0}} animate={{opacity: 1}}>
              <Button variant="ghost" size="icon" onClick={() => setTheme(isDark ? "light" : "dark")}>
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMenuOpen && (
              <motion.div
                  className="md:hidden bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
              >
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                  <Link
                      href="/features"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => setIsMenuOpen(false)}
                  >
                    Fonctionnalités
                  </Link>
                  <Link
                      href="/pricing"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => setIsMenuOpen(false)}
                  >
                    Tarifs
                  </Link>
                  <Link
                      href="/about"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => setIsMenuOpen(false)}
                  >
                    À propos
                  </Link>
                  <Link
                      href="/contact"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => setIsMenuOpen(false)}
                  >
                    Contact
                  </Link>
                </div>
                <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-800">
                  <div className="px-2 space-y-1">
                    <Link
                        href="/login"
                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={() => setIsMenuOpen(false)}
                    >
                      Se connecter
                    </Link>
                    <Link
                        href="/register"
                        className="block px-3 py-2 rounded-md text-base font-medium bg-black text-white dark:bg-white dark:text-black"
                        onClick={() => setIsMenuOpen(false)}
                    >
                      S'inscrire
                    </Link>
                  </div>
                </div>
              </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
  )
}

