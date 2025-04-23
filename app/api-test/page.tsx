"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import axios from "@/lib/axios"

export default function ApiTestPage() {
    const [result, setResult] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const testApi = async (endpoint: string) => {
        setLoading(true)
        setError(null)

        try {
            console.log(`Test de l'API: ${endpoint}`)

            // Test avec fetch natif d'abord
            try {
                const fetchResponse = await fetch(`/api/${endpoint}`)
                const fetchData = await fetchResponse.json()
                console.log(`Réponse fetch de /api/${endpoint}:`, fetchData)
            } catch (fetchErr) {
                console.error("Erreur avec fetch:", fetchErr)
            }

            // Puis test avec axios
            const response = await axios.get(`/api/${endpoint}`)
            console.log(`Réponse axios de /api/${endpoint}:`, response.data)
            setResult(response.data)
        } catch (err: any) {
            console.error(`Erreur lors du test de /api/${endpoint}:`, err)
            setError(`Erreur: ${err.message}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Test des API</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Test des points d'accès API</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Button onClick={() => testApi("debug")} disabled={loading} className="w-full">
                                Tester /api/debug
                            </Button>
                        </div>

                        <div>
                            <Button onClick={() => testApi("test")} disabled={loading} className="w-full">
                                Tester /api/test
                            </Button>
                        </div>

                        <div>
                            <Button onClick={() => testApi("users/me")} disabled={loading} className="w-full">
                                Tester /api/users/me
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Résultat</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading && <p>Chargement...</p>}

                        {error && (
                            <div className="p-4 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-md">{error}</div>
                        )}

                        {result && (
                            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
                                <pre className="whitespace-pre-wrap overflow-auto max-h-80">{JSON.stringify(result, null, 2)}</pre>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Conseils de débogage</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Vérifiez que votre serveur Next.js est en cours d'exécution</li>
                        <li>Assurez-vous que les routes API sont dans le bon format (app/api/[route]/route.ts)</li>
                        <li>Consultez la console du navigateur pour voir les erreurs détaillées</li>
                        <li>Vérifiez que vous n'avez pas de problèmes CORS si vous accédez à l'API depuis un autre domaine</li>
                        <li>Si vous utilisez un proxy ou un serveur personnalisé, vérifiez sa configuration</li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    )
}
