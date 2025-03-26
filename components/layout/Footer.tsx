import Link from "next/link"
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa"

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex justify-center space-x-6 md:order-2">
          <Link href="#" className="text-gray-400 hover:text-primary">
            <span className="sr-only">Facebook</span>
            <FaFacebook className="h-6 w-6" />
          </Link>
          <Link href="#" className="text-gray-400 hover:text-primary">
            <span className="sr-only">Twitter</span>
            <FaTwitter className="h-6 w-6" />
          </Link>
          <Link href="#" className="text-gray-400 hover:text-primary">
            <span className="sr-only">Instagram</span>
            <FaInstagram className="h-6 w-6" />
          </Link>
          <Link href="#" className="text-gray-400 hover:text-primary">
            <span className="sr-only">LinkedIn</span>
            <FaLinkedin className="h-6 w-6" />
          </Link>
        </div>
        <div className="mt-8 md:order-1 md:mt-0">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-6 mb-4">
            <Link href="/about" className="text-gray-500 hover:text-primary">
              À propos
            </Link>
            <Link href="/contact" className="text-gray-500 hover:text-primary mt-2 md:mt-0">
              Contact
            </Link>
            <Link href="/privacy" className="text-gray-500 hover:text-primary mt-2 md:mt-0">
              Politique de confidentialité
            </Link>
            <Link href="/terms" className="text-gray-500 hover:text-primary mt-2 md:mt-0">
              Conditions d'utilisation
            </Link>
          </div>
          <p className="text-center text-xs leading-5 text-gray-500">
            &copy; {new Date().getFullYear()} Kivu Event. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  )
}

