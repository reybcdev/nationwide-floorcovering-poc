import { NextRequest, NextResponse } from 'next/server'
import { getAllCustomersFromOdoo } from '@/lib/odoo/customer-sync'

/**
 * GET /api/sync/customers
 * Sync customers from Odoo ERP
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '50')
    
    console.log(`Fetching customers from Odoo (limit: ${limit})...`)
    
    const customers = await getAllCustomersFromOdoo(limit)
    
    return NextResponse.json({
      success: true,
      message: `Successfully fetched ${customers.length} customers from Odoo`,
      data: {
        count: customers.length,
        customers,
      },
    })
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch customers from Odoo',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
