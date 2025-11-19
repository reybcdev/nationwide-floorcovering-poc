import { NextRequest, NextResponse } from 'next/server'
import { generateEDI856, edi856ToX12 } from '@/lib/odoo/edi-shipping'
import { sendEDI856ToCarrier } from '@/lib/carriers/carrier-integration'

/**
 * POST /api/shipping/notify
 * Generate EDI 856 (Advance Ship Notice) and send to carrier/trading partner
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      shipmentId,
      purchaseOrderNumber,
      invoiceNumber,
      shipDate,
      carrier,
      trackingNumber,
      serviceLevel,
      shipFrom,
      shipTo,
      packages,
      items,
      recipient,
    } = body

    // Validate required fields
    if (!shipmentId || !purchaseOrderNumber || !carrier || !trackingNumber) {
      return NextResponse.json(
        { success: false, error: 'Missing required shipment fields' },
        { status: 400 }
      )
    }

    // Generate EDI 856 document
    const edi856 = generateEDI856({
      shipmentId,
      purchaseOrderNumber,
      invoiceNumber: invoiceNumber || `INV-${purchaseOrderNumber}`,
      shipDate: shipDate || new Date().toISOString().split('T')[0],
      carrier,
      trackingNumber,
      serviceLevel: serviceLevel || 'Ground',
      shipFrom: shipFrom || {
        name: 'Nationwide Floorcovering',
        address: '123 Flooring Street',
        city: 'New York',
        state: 'NY',
        zip: '10001',
      },
      shipTo,
      packages: packages || [],
      items: items || [],
    })

    // Convert to X12 format
    const edi856X12 = edi856ToX12(edi856)

    // Send to carrier/trading partner if recipient specified
    let transmissionResult
    if (recipient) {
      transmissionResult = await sendEDI856ToCarrier(edi856X12, recipient)
    }

    return NextResponse.json({
      success: true,
      message: 'EDI 856 generated successfully',
      data: {
        edi856,
        edi856X12,
        transmission: transmissionResult,
      },
    })
  } catch (error) {
    console.error('Error generating EDI 856:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate EDI 856',
      },
      { status: 500 }
    )
  }
}
