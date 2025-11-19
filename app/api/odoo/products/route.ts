import { NextRequest, NextResponse } from 'next/server'
import { getOdooClient } from '@/lib/odoo/client'

export const dynamic = 'force-dynamic'

/**
 * GET /api/odoo/products
 * Fetch products from Odoo ERP
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '50')

    const odooClient = getOdooClient()
    const products = await odooClient.getProducts(limit)

    return NextResponse.json({
      success: true,
      data: products,
      count: products.length,
    })
  } catch (error) {
    console.error('Error fetching Odoo products:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch products from Odoo',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/odoo/products
 * Update product inventory in Odoo
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, quantity } = body

    if (!productId || quantity === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: productId, quantity',
        },
        { status: 400 }
      )
    }

    const odooClient = getOdooClient()
    await odooClient.updateProductStock(productId, quantity)

    return NextResponse.json({
      success: true,
      message: 'Product inventory updated successfully',
    })
  } catch (error) {
    console.error('Error updating Odoo product:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update product inventory',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
