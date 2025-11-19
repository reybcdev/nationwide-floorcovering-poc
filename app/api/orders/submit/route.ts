import { NextRequest, NextResponse } from 'next/server'
import { getOdooClient } from '@/lib/odoo/client'
import { syncCustomerToOdoo } from '@/lib/odoo/customer-sync'
import { generateEDIFromOdooOrder } from '@/lib/odoo/edi-service'

/**
 * POST /api/orders/submit
 * Submit order to Odoo with EDI generation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customer, items, total } = body

    // Validate request
    if (!customer || !items || !total) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: customer, items, total',
        },
        { status: 400 }
      )
    }

    console.log('Processing order submission...')

    // Step 1: Sync customer to Odoo
    const customerSync = await syncCustomerToOdoo({
      id: customer.email,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: {
        street: customer.address,
        city: customer.city,
        state: customer.state,
        zip: customer.zip,
        country: customer.country || 'US',
      },
      customerType: 'individual',
      lastSyncedAt: new Date().toISOString(),
    })

    if (!customerSync.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to sync customer to Odoo',
          details: customerSync.message,
        },
        { status: 500 }
      )
    }

    const partnerId = customerSync.customerId

    // Step 2: Create sale order in Odoo
    const odooClient = getOdooClient()
    
    // Prepare order lines
    const orderLines = items.map((item: any) => ({
      product_id: item.odooId || 1, // Default to product ID 1 if not specified
      product_uom_qty: item.quantity,
      price_unit: item.unitPrice,
    }))

    const orderData = {
      partner_id: partnerId,
      order_line: orderLines,
    }

    const odooOrderId = await odooClient.createSaleOrder(orderData)

    // Generate order number
    const orderNumber = `WEB-${Date.now()}`

    // Step 3: Generate EDI documents
    const ediDocuments = await generateEDIFromOdooOrder(
      orderNumber,
      {
        name: customer.name,
        email: customer.email,
        address: customer.address,
        city: customer.city,
        state: customer.state,
        zip: customer.zip,
      },
      items.map((item: any) => ({
        sku: item.sku,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.quantity * item.unitPrice,
      })),
      total
    )

    return NextResponse.json({
      success: true,
      message: 'Order submitted successfully with EDI generation',
      data: {
        orderNumber,
        odooOrderId,
        partnerId,
        edi: {
          edi850: ediDocuments.edi850,
          edi850X12: ediDocuments.edi850X12,
          edi810: ediDocuments.edi810,
          edi810X12: ediDocuments.edi810X12,
        },
      },
    })
  } catch (error) {
    console.error('Error submitting order:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to submit order',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
