"use client"

import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { useSearchParams } from "next/navigation"
import axios from "@/lib/axios"
import type { Event, PaginatedResponse } from "@/types"
import EventList from "@/components/events/EventList"
import AdvancedSearch from "@/components/search/AdvancedSearch"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import Pagination from "@/components/ui/Pagination"

export default function EventsPage() {
    const searchParams = useSearchParams()
    const page = Number(searchParams.get("page")) || 1
    const limit = Number(searchParams.get("limit")) || 9

    const queryParams = useMemo(() => {
        return {
            page,
            limit,
            keyword: searchParams.get("keyword") || undefined,
            type: searchParams.get("type") || undefined,
            status: searchParams.get("status") || undefined,
            startDate: searchParams.get("startDate") || undefined,
            endDate: searchParams.get("endDate") || undefined,
            location: searchParams.get("location") || undefined,
        }
    }, [searchParams, page, limit])

    const { data, isLoading, isError } = useQuery<PaginatedResponse<Event>>(
        ["events", queryParams],
        async () => {
            const response = await axios.get("/events", { params: queryParams })
            return response.data
        },
        { keepPreviousData: true }
    )

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Événements</h1>
                <p className="max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
                    Découvrez tous les événements à venir et inscrivez-vous pour y participer.
                </p>
            </div>

            <AdvancedSearch />

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <LoadingSpinner size="lg" />
                </div>
            ) : isError ? (
                <div className="text-center py-12 bg-red-100 dark:bg-red-900 rounded-lg shadow">
                    <p className="text-red-500 dark:text-red-400">Une erreur s'est produite lors du chargement des événements.</p>
                </div>
            ) : data?.data?.length > 0 ? (
                <>
                    <EventList events={data.data} />
                    {data.pagination.pages > 1 && (
                        <div className="mt-12">
                            <Pagination currentPage={data.pagination.page} totalPages={data.pagination.pages} baseUrl="/events" />
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
                    <p className="text-gray-500 dark:text-gray-400">Aucun événement ne correspond à votre recherche.</p>
                </div>
            )}
        </div>
    )
}
