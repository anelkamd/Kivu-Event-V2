import { Skeleton } from "@/components/ui/skeleton"
import { Mail } from "lucide-react"

export default function InboxLoading() {
    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-background">
            {/* Header */}
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                        <Skeleton className="h-8 w-32" />
                        <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Skeleton className="h-9 w-9 rounded-full" />
                        <Skeleton className="h-9 w-9 rounded-full" />
                    </div>
                </div>

                <div className="flex items-center space-x-2 pb-4">
                    <Skeleton className="h-8 w-24 rounded-full" />
                    <Skeleton className="h-8 w-28 rounded-full" />
                    <Skeleton className="h-8 w-24 rounded-full" />
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Messages list */}
                <div className="w-full md:w-2/5 overflow-y-auto px-6 pb-6">
                    {Array(5)
                        .fill(0)
                        .map((_, i) => (
                            <Skeleton key={i} className="h-24 w-full mb-3 rounded-xl" />
                        ))}
                </div>

                {/* Empty message detail */}
                <div className="hidden md:flex flex-1 items-center justify-center">
                    <div className="text-center max-w-md p-8">
                        <div className="bg-muted/30 p-6 rounded-full inline-block mb-4">
                            <Mail className="h-10 w-10 text-muted-foreground/50" />
                        </div>
                        <Skeleton className="h-8 w-64 mx-auto mb-2" />
                        <Skeleton className="h-4 w-full mx-auto mb-2" />
                        <Skeleton className="h-4 w-5/6 mx-auto mb-2" />
                        <Skeleton className="h-4 w-4/6 mx-auto mb-6" />
                        <Skeleton className="h-10 w-40 mx-auto rounded-md" />
                    </div>
                </div>
            </div>
        </div>
    )
}
