import { NextRequest, NextResponse } from 'next/server'
import { trackShipment } from '@/lib/carriers/carrier-integration'

export const dynamic = 'force-dynamic'

/**
 * GET /api/shipping/track?trackingNumber=xxx&carrier=UPS
 * Track shipment status
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const trackingNumber = searchParams.get('trackingNumber')
    const carrier = searchParams.get('carrier') as 'UPS' | 'FEDEX' | 'USPS' | null

    if (!trackingNumber || !carrier) {
      return NextResponse.json(
        { success: false, error: 'Missing trackingNumber or carrier parameter' },
        { status: 400 }
      )
    }

    const trackingInfo = await trackShipment(trackingNumber, carrier)

    return NextResponse.json({
      success: true,
      data: {
        tracking: trackingInfo,
      },
    })
  } catch (error) {
    console.error('Error tracking shipment:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to track shipment',
      },
      { status: 500 }
    )
  }
}
