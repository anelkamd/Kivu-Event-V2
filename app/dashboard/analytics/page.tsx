import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, LineChart, PieChart } from "@/components/charts"

export default function AnalyticsPage() {
  return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Tableau de bord analytique</h1>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="events">Événements</TabsTrigger>
            <TabsTrigger value="participants">Participants</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Total des événements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">24</div>
                  <p className="text-sm text-muted-foreground">+12% par rapport au mois dernier</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Total des participants</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">1,248</div>
                  <p className="text-sm text-muted-foreground">+18% par rapport au mois dernier</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Taux de participation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">87%</div>
                  <p className="text-sm text-muted-foreground">+5% par rapport au mois dernier</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Événements par mois</CardTitle>
                </CardHeader>
                <CardContent>
                  <BarChart
                      data={[
                        { name: "Jan", value: 4 },
                        { name: "Fév", value: 3 },
                        { name: "Mar", value: 5 },
                        { name: "Avr", value: 2 },
                        { name: "Mai", value: 3 },
                        { name: "Juin", value: 7 },
                      ]}
                      xKey="name"
                      yKey="value"
                  />
                </CardContent>
              </Card>

              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Participants par événement</CardTitle>
                </CardHeader>
                <CardContent>
                  <LineChart
                      data={[
                        { name: "Conférence A", value: 120 },
                        { name: "Séminaire B", value: 80 },
                        { name: "Atelier C", value: 40 },
                        { name: "Réunion D", value: 30 },
                        { name: "Conférence E", value: 150 },
                      ]}
                      xKey="name"
                      yKey="value"
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="events">
            <Card>
              <CardHeader>
                <CardTitle>Types d'événements</CardTitle>
              </CardHeader>
              <CardContent>
                <PieChart
                    data={[
                      { name: "Conférences", value: 40 },
                      { name: "Séminaires", value: 30 },
                      { name: "Ateliers", value: 20 },
                      { name: "Réunions", value: 10 },
                    ]}
                    nameKey="name"
                    valueKey="value"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="participants">
            <Card>
              <CardHeader>
                <CardTitle>Satisfaction des participants</CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart
                    data={[
                      { name: "Très satisfait", value: 45 },
                      { name: "Satisfait", value: 30 },
                      { name: "Neutre", value: 15 },
                      { name: "Insatisfait", value: 7 },
                      { name: "Très insatisfait", value: 3 },
                    ]}
                    xKey="name"
                    yKey="value"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  )
}

