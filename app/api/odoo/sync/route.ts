import { NextRequest, NextResponse } from 'next/server'
import { getOdooClient } from '@/lib/odoo/client'

/**
 * GET /api/odoo/sync
 * Get EDI sync status
 */
export async function GET() {
  try {
    const odooClient = getOdooClient()
    const status = await odooClient.getSyncStatus()

    return NextResponse.json({
      success: true,
      data: status,
    })
  } catch (error) {
    console.error('Error fetching sync status:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch sync status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/odoo/sync
 * Trigger manual sync with Odoo
 */
export async function POST() {
  try {
    const odooClient = getOdooClient()
    const status = await odooClient.triggerSync()

    return NextResponse.json({
      success: true,
      message: 'Sync completed successfully',
      data: status,
    })
  } catch (error) {
    console.error('Error triggering sync:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to trigger sync',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
