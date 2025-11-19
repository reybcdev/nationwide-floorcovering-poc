import { NextRequest, NextResponse } from 'next/server'
import { getMockOdooService } from '@/lib/odoo/mock-service'

/**
 * POST /api/odoo/orders/[id]/confirm
 * Confirm a sale order in Odoo
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = parseInt(params.id)

    if (isNaN(orderId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid order ID',
        },
        { status: 400 }
      )
    }

    const odooService = getMockOdooService()
    const result = await odooService.confirmSaleOrder(orderId)

    if (result) {
      return NextResponse.json({
        success: true,
        message: 'Order confirmed successfully',
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Order not found',
        },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('Error confirming Odoo order:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to confirm order',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
