import { NextResponse } from "next/server"

export async function GET() {
    return NextResponse.json({
        success: true,
        message: "API endpoint is working",
        time: new Date().toISOString(),
    })
}
