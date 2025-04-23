import { NextResponse } from "next/server"

export async function GET() {
    return NextResponse.json({
        success: true,
        message: "Le point d'accès API fonctionne",
        time: new Date().toISOString(),
    })
}
