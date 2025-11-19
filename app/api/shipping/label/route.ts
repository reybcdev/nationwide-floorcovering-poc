import { NextRequest, NextResponse } from 'next/server'
import { createShippingLabel } from '@/lib/carriers/carrier-integration'
import type { ShippingAddress, ShipmentPackage } from '@/lib/carriers/carrier-integration'

/**
 * POST /api/shipping/label
 * Create shipping label with selected carrier
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { from, to, packages, carrier, service } = body

    // Validate required fields
    if (!from || !to || !packages || !carrier || !service) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const label = await createShippingLabel(from, to, packages, carrier, service)

    return NextResponse.json({
      success: true,
      data: {
        label,
      },
    })
  } catch (error) {
    console.error('Error creating shipping label:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create shipping label',
      },
      { status: 500 }
    )
  }
}
