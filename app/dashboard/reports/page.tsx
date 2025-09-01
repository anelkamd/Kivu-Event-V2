"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, Download, TrendingUp, Users, CalendarDays, DollarSign } from "lucide-react"
import { format, startOfMonth, endOfMonth, startOfDay, endOfDay } from "date-fns"
import { fr } from "date-fns/locale"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

interface ReportData {
  events: {
    total: number
    published: number
    completed: number
    cancelled: number
    byType: { name: string; value: number }[]
  }
  participants: {
    total: number
    registered: number
    attended: number
    cancelled: number
    noShow: number
  }
  revenue: {
    total: number
    pending: number
    refunded: number
    byPeriod: { date: string; amount: number }[]
  }
  trends: {
    eventsOverTime: { date: string; events: number }[]
    participantsOverTime: { date: string; participants: number }[]
  }
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export default function DashboardReportsPage() {
  const [reportType, setReportType] = useState<"daily" | "monthly" | "custom">("monthly")
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  })
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchReportData = async () => {
    setLoading(true)
    try {
      let startDate: Date
      let endDate: Date

      switch (reportType) {
        case "daily":
          startDate = startOfDay(selectedDate)
          endDate = endOfDay(selectedDate)
          break
        case "monthly":
          startDate = startOfMonth(selectedDate)
          endDate = endOfMonth(selectedDate)
          break
        case "custom":
          startDate = dateRange.from
          endDate = dateRange.to
          break
      }

      // Simuler des données pour la démonstration
      // En production, ces appels seraient faits vers votre API
      const mockData: ReportData = {
        events: {
          total: 45,
          published: 32,
          completed: 28,
          cancelled: 3,
          byType: [
            { name: "Conférence", value: 15 },
            { name: "Atelier", value: 12 },
            { name: "Séminaire", value: 8 },
            { name: "Formation", value: 6 },
            { name: "Autre", value: 4 },
          ],
        },
        participants: {
          total: 1250,
          registered: 980,
          attended: 856,
          cancelled: 124,
          noShow: 270,
        },
        revenue: {
          total: 45600,
          pending: 3200,
          refunded: 1800,
          byPeriod: [
            { date: "2024-01", amount: 12000 },
            { date: "2024-02", amount: 15600 },
            { date: "2024-03", amount: 18000 },
          ],
        },
        trends: {
          eventsOverTime: [
            { date: "2024-01", events: 8 },
            { date: "2024-02", events: 12 },
            { date: "2024-03", events: 15 },
          ],
          participantsOverTime: [
            { date: "2024-01", participants: 320 },
            { date: "2024-02", participants: 450 },
            { date: "2024-03", participants: 480 },
          ],
        },
      }

      setReportData(mockData)
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error)
    } finally {
      setLoading(false)
    }
  }

  const exportToPDF = async () => {
    const element = document.getElementById("report-content")
    if (!element) return

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      })

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF("p", "mm", "a4")

      const imgWidth = 210
      const pageHeight = 295
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      let position = 0

      // Ajouter le titre du rapport
      pdf.setFontSize(20)
      pdf.text(
        `Rapport ${reportType === "daily" ? "Journalier" : reportType === "monthly" ? "Mensuel" : "Personnalisé"}`,
        20,
        20,
      )
      pdf.setFontSize(12)
      pdf.text(`Généré le ${format(new Date(), "dd/MM/yyyy à HH:mm", { locale: fr })}`, 20, 30)

      position = 40
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      const fileName = `rapport-${reportType}-${format(new Date(), "yyyy-MM-dd")}.pdf`
      pdf.save(fileName)
    } catch (error) {
      console.error("Erreur lors de l'export PDF:", error)
    }
  }

  useEffect(() => {
    fetchReportData()
  }, [reportType, selectedDate, dateRange])

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Chargement des données...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* En-tête avec contrôles */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Rapports & Statistiques</h1>
          <p className="text-muted-foreground">Analysez les performances de vos événements</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={reportType} onValueChange={(value: "daily" | "monthly" | "custom") => setReportType(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Type de rapport" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Rapport journalier</SelectItem>
              <SelectItem value="monthly">Rapport mensuel</SelectItem>
              <SelectItem value="custom">Période personnalisée</SelectItem>
            </SelectContent>
          </Select>

          {reportType !== "custom" && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[200px] justify-start text-left font-normal bg-transparent">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, reportType === "daily" ? "dd MMMM yyyy" : "MMMM yyyy", { locale: fr })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          )}

          <Button onClick={exportToPDF} className="gap-2">
            <Download className="h-4 w-4" />
            Exporter PDF
          </Button>
        </div>
      </div>

      {/* Contenu du rapport */}
      <div id="report-content" className="space-y-6">
        {/* Métriques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Événements</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData?.events.total}</div>
              <p className="text-xs text-muted-foreground">
                {reportData?.events.published} publiés, {reportData?.events.completed} terminés
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Participants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData?.participants.total}</div>
              <p className="text-xs text-muted-foreground">{reportData?.participants.attended} présents</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenus</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData?.revenue.total.toLocaleString()} €</div>
              <p className="text-xs text-muted-foreground">
                {reportData?.revenue.pending.toLocaleString()} € en attente
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taux de présence</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {reportData
                  ? Math.round((reportData.participants.attended / reportData.participants.registered) * 100)
                  : 0}
                %
              </div>
              <p className="text-xs text-muted-foreground">Sur {reportData?.participants.registered} inscrits</p>
            </CardContent>
          </Card>
        </div>

        {/* Graphiques et analyses */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="events">Événements</TabsTrigger>
            <TabsTrigger value="participants">Participants</TabsTrigger>
            <TabsTrigger value="revenue">Revenus</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Évolution des événements</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={reportData?.trends.eventsOverTime}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="events" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Évolution des participants</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={reportData?.trends.participantsOverTime}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="participants" stroke="#82ca9d" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Répartition par type</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={reportData?.events.byType}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {reportData?.events.byType.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Statuts des événements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Publiés</span>
                    <Badge variant="default">{reportData?.events.published}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Terminés</span>
                    <Badge variant="secondary">{reportData?.events.completed}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Annulés</span>
                    <Badge variant="destructive">{reportData?.events.cancelled}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="participants" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Statuts des participants</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      { name: "Inscrits", value: reportData?.participants.registered || 0 },
                      { name: "Présents", value: reportData?.participants.attended || 0 },
                      { name: "Annulés", value: reportData?.participants.cancelled || 0 },
                      { name: "Absents", value: reportData?.participants.noShow || 0 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Évolution des revenus</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reportData?.revenue.byPeriod}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} €`, "Revenus"]} />
                    <Bar dataKey="amount" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
