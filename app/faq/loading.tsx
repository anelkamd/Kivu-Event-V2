import { Card, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function FAQLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <Skeleton className="h-12 w-96 mx-auto mb-4" />
            <Skeleton className="h-6 w-[600px] mx-auto" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Search Skeleton */}
        <div className="mb-12">
          <div className="max-w-2xl mx-auto mb-8">
            <Skeleton className="h-12 w-full" />
          </div>

          {/* Category Filters Skeleton */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {[...Array(7)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-32 rounded-full" />
            ))}
          </div>
        </div>

        {/* FAQ Items Skeleton */}
        <div className="max-w-4xl mx-auto space-y-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-80" />
                  </div>
                  <Skeleton className="h-5 w-5" />
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
