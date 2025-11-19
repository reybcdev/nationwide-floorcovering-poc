import { NextRequest, NextResponse } from 'next/server'
import { getOdooClient } from '@/lib/odoo/client'
import type { EDIOrder } from '@/lib/odoo/types'

export const dynamic = 'force-dynamic'

/**
 * GET /api/odoo/orders
 * Fetch sale orders from Odoo ERP
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '50')

    const odooClient = getOdooClient()
    const orders = await odooClient.getSaleOrders(limit)

    return NextResponse.json({
      success: true,
      data: orders,
      count: orders.length,
    })
  } catch (error) {
    console.error('Error fetching Odoo orders:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch orders from Odoo',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/odoo/orders
 * Create a new sale order in Odoo from e-commerce order
 */
export async function POST(request: NextRequest) {
  try {
    const ediOrder: EDIOrder = await request.json()

    // Validate required fields
    if (
      !ediOrder.orderNumber ||
      !ediOrder.customerName ||
      !ediOrder.items ||
      ediOrder.items.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required order fields',
        },
        { status: 400 }
      )
    }

    const odooClient = getOdooClient()
    const orderId = await odooClient.createSaleOrderFromEDI(ediOrder)

    return NextResponse.json({
      success: true,
      message: 'Order created successfully in Odoo',
      data: {
        odooOrderId: orderId,
        orderNumber: ediOrder.orderNumber,
      },
    })
  } catch (error) {
    console.error('Error creating Odoo order:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create order in Odoo',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
