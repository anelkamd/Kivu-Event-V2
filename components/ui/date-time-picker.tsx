"use client"

import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { CalendarIcon, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

interface DateTimePickerProps {
    date?: Date
    setDate: (date: Date | undefined) => void
}

export function DateTimePicker({ date, setDate }: DateTimePickerProps) {
    const [selectedTime, setSelectedTime] = useState<{
        hours: string
        minutes: string
    }>({
        hours: date ? String(date.getHours()).padStart(2, "0") : "09",
        minutes: date ? String(date.getMinutes()).padStart(2, "0") : "00",
    })

    const handleSelect = (selectedDate: Date | undefined) => {
        if (selectedDate) {
            const hours = Number(selectedTime.hours)
            const minutes = Number(selectedTime.minutes)

            selectedDate.setHours(hours)
            selectedDate.setMinutes(minutes)

            setDate(selectedDate)
        } else {
            setDate(undefined)
        }
    }

    const handleTimeChange = (type: "hours" | "minutes", value: string) => {
        setSelectedTime((prev) => ({
            ...prev,
            [type]: value,
        }))

        if (date) {
            const newDate = new Date(date)
            if (type === "hours") {
                newDate.setHours(Number(value))
            } else {
                newDate.setMinutes(Number(value))
            }
            setDate(newDate)
        }
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP 'à' HH:mm", { locale: fr }) : <span>Sélectionner une date et heure</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={date} onSelect={handleSelect} initialFocus locale={fr} />
                <div className="border-t border-border p-3 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Select value={selectedTime.hours} onValueChange={(value) => handleTimeChange("hours", value)}>
                        <SelectTrigger className="w-[70px]">
                            <SelectValue placeholder="Heure" />
                        </SelectTrigger>
                        <SelectContent>
                            {Array.from({ length: 24 }).map((_, i) => (
                                <SelectItem key={i} value={String(i).padStart(2, "0")}>
                                    {String(i).padStart(2, "0")}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <span>:</span>
                    <Select value={selectedTime.minutes} onValueChange={(value) => handleTimeChange("minutes", value)}>
                        <SelectTrigger className="w-[70px]">
                            <SelectValue placeholder="Min" />
                        </SelectTrigger>
                        <SelectContent>
                            {["00", "15", "30", "45"].map((minute) => (
                                <SelectItem key={minute} value={minute}>
                                    {minute}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </PopoverContent>
        </Popover>
    )
}
