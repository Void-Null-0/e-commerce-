import { NextResponse } from 'next/server'

export async function GET() {
  const checks: Record<string, string> = {}

  checks.TURSO_DATABASE_URL = process.env.TURSO_DATABASE_URL
    ? `${process.env.TURSO_DATABASE_URL.substring(0, 30)}...`
    : 'NOT SET ❌'

  checks.TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN
    ? `SET (${process.env.TURSO_AUTH_TOKEN.length} chars)`
    : 'NOT SET ❌'

  checks.DATABASE_URL = process.env.DATABASE_URL || 'NOT SET ❌'

  // Try to connect to the database
  try {
    const { db } = await import('@/lib/db')
    const count = await db.product.count()
    checks.database = `OK ✅ (${count} products)`
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    checks.database = `FAILED ❌: ${msg}`
  }

  return NextResponse.json(checks)
}