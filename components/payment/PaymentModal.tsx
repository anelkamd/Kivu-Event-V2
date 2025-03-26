"use client"

import type React from "react"

import { useState } from "react"
import { Dialog } from "@headlessui/react"
import { XMarkIcon, CreditCardIcon, LockClosedIcon } from "@heroicons/react/24/outline"
import { motion, AnimatePresence } from "framer-motion"
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { getStripe } from "@/lib/stripe"
import axios from "@/lib/axios"
import toast from "react-hot-toast"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  eventId: string
  eventTitle: string
  price: number
  onSuccess: () => void
}

function CheckoutForm({ eventId, eventTitle, price, onSuccess, onClose }: Omit<PaymentModalProps, "isOpen">) {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Créer une intention de paiement
      const { data: clientSecret } = await axios.post("/payments/create-intent", {
        eventId,
        amount: price,
      })

      // Confirmer le paiement
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) throw new Error("Card element not found")

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: "Nom du client", // Idéalement, récupérer le nom de l'utilisateur
          },
        },
      })

      if (stripeError) {
        setError(stripeError.message || "Une erreur est survenue lors du paiement.")
      } else if (paymentIntent.status === "succeeded") {
        // Enregistrer le paiement dans notre système
        await axios.post("/payments/confirm", {
          eventId,
          paymentIntentId: paymentIntent.id,
        })

        toast.success("Paiement réussi! Vous êtes inscrit à l'événement.")
        onSuccess()
        onClose()
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Une erreur est survenue lors du paiement.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="card-element" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Informations de carte
        </label>
        <div className="mt-1 p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#424770",
                  "::placeholder": {
                    color: "#aab7c4",
                  },
                },
                invalid: {
                  color: "#9e2146",
                },
              },
            }}
          />
        </div>
      </div>

      {error && <div className="text-sm text-red-600 dark:text-red-400">{error}</div>}

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700 dark:text-gray-300">
          <span className="font-medium">Total:</span> {(price / 100).toFixed(2)} €
        </div>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={!stripe || isLoading}
            className="inline-flex justify-center items-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
          >
            {isLoading ? (
              "Traitement en cours..."
            ) : (
              <>
                <LockClosedIcon className="mr-2 h-4 w-4" />
                Payer maintenant
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  )
}

export default function PaymentModal({ isOpen, onClose, eventId, eventTitle, price, onSuccess }: PaymentModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog
          as={motion.div}
          static
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          open={isOpen}
          onClose={onClose}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel
              as={motion.div}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mx-auto max-w-md rounded-lg bg-white dark:bg-gray-800 p-6 shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-white">
                  Paiement pour {eventTitle}
                </Dialog.Title>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <span className="sr-only">Fermer</span>
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                <div className="flex items-center text-gray-700 dark:text-gray-300">
                  <CreditCardIcon className="h-5 w-5 mr-2 text-primary" />
                  <span>Paiement sécurisé via Stripe</span>
                </div>
              </div>

              <Elements stripe={getStripe()}>
                <CheckoutForm
                  eventId={eventId}
                  eventTitle={eventTitle}
                  price={price}
                  onSuccess={onSuccess}
                  onClose={onClose}
                />
              </Elements>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  )
}

