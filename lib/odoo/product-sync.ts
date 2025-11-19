/**
 * Product Synchronization Service
 * Syncs products from Odoo ERP to e-commerce site
 */

import { getOdooClient } from './client'
import type { OdooProduct } from './types'

export interface SyncedProduct {
  id: string
  odooId: number
  name: string
  sku: string
  category: 'hardwood' | 'carpet' | 'vinyl' | 'other'
  price: number
  pricePerSqFt: number
  image: string
  description: string
  inStock: boolean
  stockQuantity: number
  brand: string
  specifications: {
    color: string
    material?: string
    warranty?: string
  }
  lastSyncedAt: string
}

export interface ProductSyncResult {
  success: boolean
  productsImported: number
  products: SyncedProduct[]
  errors: string[]
}

/**
 * Map Odoo category to e-commerce category
 */
function mapCategory(odooCategory: string): 'hardwood' | 'carpet' | 'vinyl' | 'other' {
  const categoryLower = odooCategory.toLowerCase()
  
  if (categoryLower.includes('hardwood') || categoryLower.includes('oak') || categoryLower.includes('wood')) {
    return 'hardwood'
  }
  if (categoryLower.includes('carpet')) {
    return 'carpet'
  }
  if (categoryLower.includes('vinyl') || categoryLower.includes('lvp') || categoryLower.includes('lvt')) {
    return 'vinyl'
  }
  
  return 'other'
}

/**
 * Get default product image based on category
 */
function getDefaultImage(category: string): string {
  const images = {
    hardwood: 'https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=800&h=600&fit=crop',
    carpet: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=800&h=600&fit=crop',
    vinyl: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800&h=600&fit=crop',
    other: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop',
  }
  
  return images[category as keyof typeof images] || images.other
}

/**
 * Transform Odoo product to e-commerce product
 */
export function transformOdooProduct(odooProduct: OdooProduct): SyncedProduct {
  const category = mapCategory(odooProduct.categ_id?.[1] || 'other')
  
  return {
    id: `odoo-${odooProduct.id}`,
    odooId: odooProduct.id,
    name: odooProduct.name,
    sku: odooProduct.default_code || `SKU-${odooProduct.id}`,
    category,
    price: odooProduct.list_price || 0,
    pricePerSqFt: odooProduct.list_price || 0,
    image: getDefaultImage(category),
    description: odooProduct.description_sale || `Premium ${category} flooring from Odoo`,
    inStock: (odooProduct.qty_available || 0) > 0,
    stockQuantity: odooProduct.qty_available || 0,
    brand: 'Odoo Floorcovering',
    specifications: {
      color: 'Natural',
      material: odooProduct.categ_id?.[1] || 'Premium Material',
      warranty: '25 years',
    },
    lastSyncedAt: new Date().toISOString(),
  }
}

/**
 * Sync products from Odoo
 */
export async function syncProductsFromOdoo(limit = 100): Promise<ProductSyncResult> {
  const errors: string[] = []
  const products: SyncedProduct[] = []

  try {
    const odooClient = getOdooClient()
    
    // Fetch products from Odoo
    const odooProducts = await odooClient.getProducts(limit)
    
    console.log(`Fetched ${odooProducts.length} products from Odoo`)
    
    // Transform each product
    for (const odooProduct of odooProducts) {
      try {
        const syncedProduct = transformOdooProduct(odooProduct)
        products.push(syncedProduct)
      } catch (error) {
        const errorMsg = `Failed to transform product ${odooProduct.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
        console.error(errorMsg)
        errors.push(errorMsg)
      }
    }
    
    return {
      success: true,
      productsImported: products.length,
      products,
      errors,
    }
  } catch (error) {
    const errorMsg = `Failed to sync products from Odoo: ${error instanceof Error ? error.message : 'Unknown error'}`
    console.error(errorMsg)
    errors.push(errorMsg)
    
    return {
      success: false,
      productsImported: 0,
      products: [],
      errors,
    }
  }
}

/**
 * Get a single product from Odoo by ID
 */
export async function getProductFromOdoo(odooId: number): Promise<SyncedProduct | null> {
  try {
    const odooClient = getOdooClient()
    
    const products = await odooClient.searchRead<OdooProduct>({
      model: 'product.product',
      domain: [['id', '=', odooId]],
      fields: [
        'name',
        'default_code',
        'list_price',
        'standard_price',
        'qty_available',
        'virtual_available',
        'type',
        'categ_id',
        'description_sale',
        'barcode',
      ],
      limit: 1,
    })
    
    if (products.length === 0) {
      return null
    }
    
    return transformOdooProduct(products[0])
  } catch (error) {
    console.error('Failed to fetch product from Odoo:', error)
    return null
  }
}

/**
 * Update product stock in Odoo
 */
export async function updateProductStockInOdoo(odooId: number, quantity: number): Promise<boolean> {
  try {
    const odooClient = getOdooClient()
    await odooClient.updateProductStock(odooId, quantity)
    return true
  } catch (error) {
    console.error('Failed to update product stock in Odoo:', error)
    return false
  }
}
