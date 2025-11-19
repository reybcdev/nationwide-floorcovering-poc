import { NextRequest, NextResponse } from 'next/server'
import { syncProductsFromOdoo } from '@/lib/odoo/product-sync'

/**
 * GET /api/sync/products
 * Sync products from Odoo ERP to e-commerce
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '100')
    
    console.log(`Starting product sync from Odoo (limit: ${limit})...`)
    
    const result = await syncProductsFromOdoo(limit)
    
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Product sync failed',
          errors: result.errors,
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: `Successfully synced ${result.productsImported} products from Odoo`,
      data: {
        productsImported: result.productsImported,
        products: result.products,
        errors: result.errors,
      },
    })
  } catch (error) {
    console.error('Error syncing products:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to sync products from Odoo',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
