import { NextResponse } from "next/server"

export async function GET() {
    return NextResponse.json({
        success: true,
        message: "La route API users/test fonctionne correctement",
        timestamp: new Date().toISOString(),
        data: {
            id: "test-user-id",
            name: "Test User",
            email: "test@example.com",
        },
    })
}
