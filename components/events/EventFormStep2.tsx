"use client"
import { Label } from "@/components/ui/label"
import { DateTimePicker } from "@/components/ui/date-time-picker"

interface EventFormStep2Props {
    eventData: any
    handleChange: (field: string, value: any) => void
}

export default function EventFormStep2({ eventData, handleChange }: EventFormStep2Props) {
    return (
        <div className="space-y-6">
            <div>
                <Label htmlFor="start_date">Date et heure de début *</Label>
                <DateTimePicker
                    date={eventData.start_date ? new Date(eventData.start_date) : undefined}
                    setDate={(date) => handleChange("start_date", date?.toISOString())}
                />
            </div>

            <div>
                <Label htmlFor="end_date">Date et heure de fin *</Label>
                <DateTimePicker
                    date={eventData.end_date ? new Date(eventData.end_date) : undefined}
                    setDate={(date) => handleChange("end_date", date?.toISOString())}
                />
            </div>

            <div>
                <Label htmlFor="registration_deadline">Date limite d'inscription</Label>
                <DateTimePicker
                    date={eventData.registration_deadline ? new Date(eventData.registration_deadline) : undefined}
                    setDate={(date) => handleChange("registration_deadline", date?.toISOString())}
                />
            </div>

            <div>
                <Label htmlFor="status">Statut initial</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                    <div
                        className={`border rounded-lg p-4 cursor-pointer text-center ${
                            eventData.status === "draft"
                                ? "border-black bg-black/5 dark:border-white dark:bg-white/5"
                                : "border-gray-200 dark:border-gray-700"
                        }`}
                        onClick={() => handleChange("status", "draft")}
                    >
                        Brouillon
                    </div>
                    <div
                        className={`border rounded-lg p-4 cursor-pointer text-center ${
                            eventData.status === "published"
                                ? "border-black bg-black/5 dark:border-white dark:bg-white/5"
                                : "border-gray-200 dark:border-gray-700"
                        }`}
                        onClick={() => handleChange("status", "published")}
                    >
                        Publié
                    </div>
                </div>
            </div>
        </div>
    )
}
