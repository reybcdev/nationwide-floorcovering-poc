import { NextRequest, NextResponse } from 'next/server'
import { getShippingRates } from '@/lib/carriers/carrier-integration'
import type { ShippingAddress, ShipmentPackage } from '@/lib/carriers/carrier-integration'

/**
 * POST /api/shipping/rates
 * Get shipping rates from multiple carriers
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { from, to, packages } = body as {
      from: ShippingAddress
      to: ShippingAddress
      packages: ShipmentPackage[]
    }

    // Validate required fields
    if (!from || !to || !packages) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: from, to, packages' },
        { status: 400 }
      )
    }

    const rates = await getShippingRates(from, to, packages)

    return NextResponse.json({
      success: true,
      data: {
        rates,
        count: rates.length,
      },
    })
  } catch (error) {
    console.error('Error getting shipping rates:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get shipping rates',
      },
      { status: 500 }
    )
  }
}
