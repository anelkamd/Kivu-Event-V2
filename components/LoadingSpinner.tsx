import { Loader2 } from "lucide-react"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
}

export default function LoadingSpinner({ size = "md" }: LoadingSpinnerProps) {
  let spinnerSizeClass = "h-6 w-6"
  if (size === "sm") spinnerSizeClass = "h-4 w-4"
  if (size === "lg") spinnerSizeClass = "h-10 w-10"

  return <Loader2 className={`${spinnerSizeClass} animate-spin text-gray-500`} />
}
