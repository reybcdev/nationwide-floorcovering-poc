import { NextRequest, NextResponse } from 'next/server'
import { syncProductsFromOdoo } from '@/lib/odoo/product-sync'

export const dynamic = 'force-dynamic'

/**
 * GET /api/sync/products/[id]
 * Get a single product from Odoo by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id
    
    // Extract Odoo ID from the product ID format (odoo-123 -> 123)
    let odooId: number
    
    if (productId.startsWith('odoo-')) {
      odooId = parseInt(productId.replace('odoo-', ''))
    } else {
      odooId = parseInt(productId)
    }
    
    if (isNaN(odooId)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid product ID',
        },
        { status: 400 }
      )
    }
    
    // Fetch all products and find the one we need
    // TODO: Optimize this to fetch single product directly
    const result = await syncProductsFromOdoo(1000)
    
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to fetch product',
          errors: result.errors,
        },
        { status: 500 }
      )
    }
    
    const product = result.products.find(
      p => p.odooId === odooId || p.id === productId
    )
    
    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: 'Product not found',
        },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: product,
    })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch product from Odoo',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
