import { NextRequest, NextResponse } from 'next/server'
import { getOdooClient } from '@/lib/odoo/client'

/**
 * GET /api/odoo/partners
 * Fetch partners/customers from Odoo ERP
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '50')

    const odooClient = getOdooClient()
    const partners = await odooClient.getPartners(limit)

    return NextResponse.json({
      success: true,
      data: partners,
      count: partners.length,
    })
  } catch (error) {
    console.error('Error fetching Odoo partners:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch partners from Odoo',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
