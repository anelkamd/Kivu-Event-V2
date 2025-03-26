"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline"

interface PaginationProps {
  currentPage: number
  totalPages: number
  baseUrl: string
}

export default function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
  const searchParams = useSearchParams()

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", page.toString())
    return `${baseUrl}?${params.toString()}`
  }

  const renderPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    if (startPage > 1) {
      pages.push(
        <Link
          key="1"
          href={createPageUrl(1)}
          className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          1
        </Link>,
      )

      if (startPage > 2) {
        pages.push(
          <span
            key="ellipsis1"
            className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            ...
          </span>,
        )
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Link
          key={i}
          href={createPageUrl(i)}
          className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
            i === currentPage
              ? "z-10 bg-primary text-white focus:z-20"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          }`}
        >
          {i}
        </Link>,
      )
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span
            key="ellipsis2"
            className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            ...
          </span>,
        )
      }

      pages.push(
        <Link
          key={totalPages}
          href={createPageUrl(totalPages)}
          className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          {totalPages}
        </Link>,
      )
    }

    return pages
  }

  return (
    <nav className="flex items-center justify-center">
      <div className="flex -space-x-px">
        <Link
          href={currentPage > 1 ? createPageUrl(currentPage - 1) : "#"}
          className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ${
            currentPage === 1 ? "cursor-not-allowed opacity-50" : "hover:bg-gray-50 dark:hover:bg-gray-700"
          }`}
          aria-disabled={currentPage === 1}
          tabIndex={currentPage === 1 ? -1 : 0}
        >
          <span className="sr-only">Précédent</span>
          <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
        </Link>

        {renderPageNumbers()}

        <Link
          href={currentPage < totalPages ? createPageUrl(currentPage + 1) : "#"}
          className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ${
            currentPage === totalPages ? "cursor-not-allowed opacity-50" : "hover:bg-gray-50 dark:hover:bg-gray-700"
          }`}
          aria-disabled={currentPage === totalPages}
          tabIndex={currentPage === totalPages ? -1 : 0}
        >
          <span className="sr-only">Suivant</span>
          <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
        </Link>
      </div>
    </nav>
  )
}

