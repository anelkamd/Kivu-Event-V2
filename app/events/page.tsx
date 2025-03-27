"use client"

import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useSearchParams } from "next/navigation"
import axios from "@/lib/axios"
import type { Event, PaginatedResponse } from "@/types"
import EventList from "@/components/events/EventList"
import AdvancedSearch from "@/components/search/AdvancedSearch"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import Pagination from "@/components/ui/Pagination"
import { motion } from "framer-motion"

export default function EventsPage() {
  const searchParams = useSearchParams()
  const page = Number(searchParams.get("page") || "1")
  const limit = Number(searchParams.get("limit") || "9")

  const queryParams = {
    page,
    limit,
    keyword: searchParams.get("keyword") || undefined,
    type: searchParams.get("type") || undefined,
    status: searchParams.get("status") || undefined,
    startDate: searchParams.get("startDate") || undefined,
    endDate: searchParams.get("endDate") || undefined,
    location: searchParams.get("location") || undefined,
  }

  const { data, isLoading, refetch } = useQuery<PaginatedResponse<Event>>(
      ["events", queryParams],
      async () => {
        try {
          const response = await axios.get("/events", { params: queryParams })
          return response.data
        } catch (error) {
          console.error("Error fetching events:", error)
          return { success: true, count: 0, pagination: { total: 0, page: 1, pages: 1 }, data: [] }
        }
      }
  )

  useEffect(() => {
    refetch()
  }, [searchParams, refetch])

  return (
      <div className="min-h-screen bg-black text-white py-16">
        <div className="container mx-auto px-4">
          <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Événements</h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Découvrez tous les événements à venir et inscrivez-vous pour y participer.
            </p>
          </motion.div>

          <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
          >
            <AdvancedSearch />
          </motion.div>

          {isLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
          ) : data?.data && data.data.length > 0 ? (
              <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
              >
                <EventList events={data.data} />

                {data.pagination.pages > 1 && (
                    <div className="mt-12">
                      <Pagination currentPage={data.pagination.page} totalPages={data.pagination.pages} baseUrl="/events" />
                    </div>
                )}
              </motion.div>
          ) : (
              <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="text-center py-12 bg-gray-900 rounded-2xl"
              >
                <p className="text-gray-400">Aucun événement ne correspond à votre recherche.</p>
              </motion.div>
          )}
        </div>
      </div>
  )
}