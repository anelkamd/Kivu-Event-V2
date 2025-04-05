"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Scan, CheckCircle, XCircle, User } from "lucide-react"
import axios from "@/lib/axios"

export function QRCodeScanner() {
    const { toast } = useToast()
    const [activeTab, setActiveTab] = useState("camera")
    const [scanning, setScanning] = useState(false)
    const [manualCode, setManualCode] = useState("")
    const [scanResult, setScanResult] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        // Nettoyer lors du démontage du composant
        return () => {
            stopScanner()
        }
    }, [])

    const startScanner = async () => {
        setScanning(true)
        setError(null)
        setScanResult(null)

        try {
            const constraints = {
                video: {
                    facingMode: "environment",
                },
            }

            const stream = await navigator.mediaDevices.getUserMedia(constraints)

            if (videoRef.current) {
                videoRef.current.srcObject = stream
                videoRef.current.play()

                // Commencer la détection de QR code
                requestAnimationFrame(scanVideoFrame)
            }
        } catch (err) {
            console.error("Error accessing camera:", err)
            setError("Impossible d'accéder à la caméra. Veuillez vérifier les permissions.")
            setScanning(false)
        }
    }

    const stopScanner = () => {
        setScanning(false)

        // Arrêter le flux vidéo
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
            tracks.forEach((track) => track.stop())
            videoRef.current.srcObject = null
        }
    }

    const scanVideoFrame = () => {
        if (!scanning) return

        const video = videoRef.current
        const canvas = canvasRef.current

        if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
            const context = canvas.getContext("2d")

            if (context) {
                canvas.height = video.videoHeight
                canvas.width = video.videoWidth

                context.drawImage(video, 0, 0, canvas.width, canvas.height)

                // Ici, vous intégreriez une bibliothèque de détection de QR code
                // comme jsQR ou une API de détection de code-barres

                // Simulation de détection pour cet exemple
                // Dans une implémentation réelle, vous utiliseriez une bibliothèque comme jsQR
                // const code = jsQR(imageData.data, imageData.width, imageData.height)

                // if (code) {
                //   handleQRCodeDetected(code.data)
                // } else {
                //   requestAnimationFrame(scanVideoFrame)
                // }

                // Pour la démonstration, simulons une détection après 3 secondes
                setTimeout(() => {
                    if (scanning) {
                        const simulatedQRData = JSON.stringify({
                            id: "sim-participant-123",
                            eventId: "sim-event-456",
                            userId: "sim-user-789",
                        })
                        handleQRCodeDetected(simulatedQRData)
                    }
                }, 3000)
            }
        } else {
            requestAnimationFrame(scanVideoFrame)
        }
    }

    const handleQRCodeDetected = async (qrData: string) => {
        try {
            stopScanner()

            // Envoyer les données du QR code à l'API
            const response = await axios.post("/api/events/check-in", { qrCode: qrData })

            if (response.data.success) {
                setScanResult({
                    success: true,
                    participant: response.data.participant,
                    message: response.data.message,
                })

                toast({
                    title: "Check-in réussi",
                    description: `${response.data.participant.user.first_name} ${response.data.participant.user.last_name} a été enregistré avec succès.`,
                })
            } else {
                setScanResult({
                    success: false,
                    message: response.data.error,
                })

                toast({
                    title: "Échec du check-in",
                    description: response.data.error,
                    variant: "destructive",
                })
            }
        } catch (error: any) {
            console.error("Error processing QR code:", error)
            setScanResult({
                success: false,
                message: error.response?.data?.error || "Erreur lors du traitement du QR code",
            })

            toast({
                title: "Erreur",
                description: error.response?.data?.error || "Erreur lors du traitement du QR code",
                variant: "destructive",
            })
        }
    }

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!manualCode.trim()) {
            setError("Veuillez entrer un code")
            return
        }

        // Simuler un QR code pour la démonstration
        const simulatedQRData = JSON.stringify({
            id: manualCode,
            eventId: "sim-event-456",
            userId: "sim-user-789",
        })

        handleQRCodeDetected(simulatedQRData)
    }

    const resetScanner = () => {
        setScanResult(null)
        setError(null)
        setManualCode("")
    }

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center">
                    <Scan className="mr-2 h-5 w-5" />
                    Scanner de QR Code
                </CardTitle>
            </CardHeader>
            <CardContent>
                {scanResult ? (
                    <div className="space-y-4">
                        <Alert variant={scanResult.success ? "default" : "destructive"}>
                            <div className="flex items-center">
                                {scanResult.success ? <CheckCircle className="h-5 w-5 mr-2" /> : <XCircle className="h-5 w-5 mr-2" />}
                                <AlertTitle>{scanResult.success ? "Check-in réussi" : "Échec du check-in"}</AlertTitle>
                            </div>
                            <AlertDescription>{scanResult.message}</AlertDescription>
                        </Alert>

                        {scanResult.success && scanResult.participant && (
                            <div className="bg-muted p-4 rounded-lg">
                                <div className="flex items-center mb-4">
                                    <div className="w-12 h-12 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center mr-4">
                                        <User className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-lg">
                                            {scanResult.participant.user.first_name} {scanResult.participant.user.last_name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">{scanResult.participant.user.email}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">Entreprise:</span>
                                        <p>{scanResult.participant.company || "Non spécifié"}</p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Fonction:</span>
                                        <p>{scanResult.participant.job_title || "Non spécifié"}</p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Statut:</span>
                                        <p>{scanResult.participant.status}</p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Date d'inscription:</span>
                                        <p>{new Date(scanResult.participant.registration_date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <Button onClick={resetScanner} className="w-full">
                            Scanner un autre code
                        </Button>
                    </div>
                ) : (
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="camera">Caméra</TabsTrigger>
                            <TabsTrigger value="manual">Code manuel</TabsTrigger>
                        </TabsList>

                        <TabsContent value="camera" className="space-y-4">
                            <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                                {scanning ? (
                                    <>
                                        <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" />
                                        <canvas ref={canvasRef} className="hidden" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-48 h-48 border-2 border-white rounded-lg"></div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Scan className="h-12 w-12 text-muted-foreground" />
                                    </div>
                                )}
                            </div>

                            {error && (
                                <Alert variant="destructive">
                                    <AlertTitle>Erreur</AlertTitle>
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <Button onClick={scanning ? stopScanner : startScanner} className="w-full">
                                {scanning ? "Arrêter le scanner" : "Démarrer le scanner"}
                            </Button>
                        </TabsContent>

                        <TabsContent value="manual" className="space-y-4">
                            <form onSubmit={handleManualSubmit}>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="manualCode">Code participant</Label>
                                        <Input
                                            id="manualCode"
                                            value={manualCode}
                                            onChange={(e) => setManualCode(e.target.value)}
                                            placeholder="Entrez le code du participant"
                                        />
                                    </div>

                                    {error && (
                                        <Alert variant="destructive">
                                            <AlertTitle>Erreur</AlertTitle>
                                            <AlertDescription>{error}</AlertDescription>
                                        </Alert>
                                    )}

                                    <Button type="submit" className="w-full">
                                        Vérifier le code
                                    </Button>
                                </div>
                            </form>
                        </TabsContent>
                    </Tabs>
                )}
            </CardContent>
        </Card>
    )
}

