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
  images: string[]
  description: string
  inStock: boolean
  stockQuantity: number
  brand: string
  rating: number
  reviewCount: number
  certifications: string[]
  specifications: {
    color: string
    material?: string
    warranty?: string
    thickness?: string
    width?: string
    length?: string
    finish?: string
    durabilityRating?: number
    moistureResistance?: string
    scratchResistance?: string
    roomSuitability?: string[]
    installation?: string
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
 * Get diverse product images based on category and product name
 */
function getProductImages(productName: string, category: string): string[] {
  const nameLower = productName.toLowerCase()
  
  // Hardwood images - diverse wood types and finishes
  const hardwoodImages = {
    oak: [
      'https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=800&h=600&fit=crop',
    ],
    walnut: [
      'https://images.unsplash.com/photo-1615876234886-fd9a39fda97f?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=800&h=600&fit=crop',
    ],
    maple: [
      'https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=800&h=600&fit=crop&sat=-20',
      'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&h=600&fit=crop',
    ],
    cherry: [
      'https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=800&h=600&fit=crop&sat=20',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800&h=600&fit=crop',
    ],
    default: [
      'https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop',
    ],
  }
  
  // Carpet images - diverse colors and textures
  const carpetImages = {
    beige: [
      'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1615529182904-14819c35db37?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&h=600&fit=crop',
    ],
    gray: [
      'https://images.unsplash.com/photo-1634712282287-14ed57b9cc89?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600585152915-d208bec867a1?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=800&h=600&fit=crop',
    ],
    blue: [
      'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=800&h=600&fit=crop&sat=30&hue=200',
      'https://images.unsplash.com/photo-1615529182904-14819c35db37?w=800&h=600&fit=crop&sat=30&hue=200',
      'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&h=600&fit=crop&sat=30&hue=200',
    ],
    brown: [
      'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=800&h=600&fit=crop&sat=20&hue=30',
      'https://images.unsplash.com/photo-1615529182904-14819c35db37?w=800&h=600&fit=crop&sat=20&hue=30',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop',
    ],
    default: [
      'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1615529182904-14819c35db37?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&h=600&fit=crop',
    ],
  }
  
  // Vinyl images - diverse styles and colors
  const vinylImages = {
    gray: [
      'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800&h=600&fit=crop',
    ],
    white: [
      'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800&h=600&fit=crop&brightness=10',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&h=600&fit=crop&brightness=10',
    ],
    brown: [
      'https://images.unsplash.com/photo-1615876234886-fd9a39fda97f?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop&sat=20&hue=30',
      'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800&h=600&fit=crop',
    ],
    stone: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800&h=600&fit=crop',
    ],
    tile: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=800&h=600&fit=crop',
    ],
    default: [
      'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800&h=600&fit=crop',
    ],
  }
  
  // Select images based on category and product name keywords
  if (category === 'hardwood') {
    if (nameLower.includes('oak')) return hardwoodImages.oak
    if (nameLower.includes('walnut')) return hardwoodImages.walnut
    if (nameLower.includes('maple')) return hardwoodImages.maple
    if (nameLower.includes('cherry')) return hardwoodImages.cherry
    return hardwoodImages.default
  }
  
  if (category === 'carpet') {
    if (nameLower.includes('beige') || nameLower.includes('tan')) return carpetImages.beige
    if (nameLower.includes('gray') || nameLower.includes('grey') || nameLower.includes('charcoal')) return carpetImages.gray
    if (nameLower.includes('blue')) return carpetImages.blue
    if (nameLower.includes('brown')) return carpetImages.brown
    return carpetImages.default
  }
  
  if (category === 'vinyl') {
    if (nameLower.includes('stone') || nameLower.includes('marble') || nameLower.includes('slate')) return vinylImages.stone
    if (nameLower.includes('tile')) return vinylImages.tile
    if (nameLower.includes('gray') || nameLower.includes('grey')) return vinylImages.gray
    if (nameLower.includes('white') || nameLower.includes('light')) return vinylImages.white
    if (nameLower.includes('brown') || nameLower.includes('dark')) return vinylImages.brown
    return vinylImages.default
  }
  
  // Fallback for other categories
  return [
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop',
  ]
}

/**
 * Transform Odoo product to e-commerce product
 */
export function transformOdooProduct(odooProduct: OdooProduct): SyncedProduct {
  const category = mapCategory(odooProduct.categ_id?.[1] || 'other')
  const productImages = getProductImages(odooProduct.name, category)
  
  // Generate specification details based on category
  const getRoomSuitability = (cat: string): string[] => {
    if (cat === 'hardwood') return ['Living Room', 'Dining Room', 'Bedroom', 'Office']
    if (cat === 'carpet') return ['Bedroom', 'Living Room', 'Basement']
    if (cat === 'vinyl') return ['Kitchen', 'Bathroom', 'Basement', 'Laundry Room']
    return ['Living Room', 'Bedroom']
  }

  const getInstallation = (cat: string): string => {
    if (cat === 'hardwood') return 'Nail-down or glue-down'
    if (cat === 'carpet') return 'Stretch-in'
    if (cat === 'vinyl') return 'Click-lock floating'
    return 'Professional installation recommended'
  }

  const getMoistureResistance = (cat: string): string => {
    if (cat === 'vinyl') return 'Waterproof'
    if (cat === 'hardwood') return 'Medium'
    if (cat === 'carpet') return 'Low'
    return 'Medium'
  }

  // Extract color from product name
  const getColor = (name: string): string => {
    const nameLower = name.toLowerCase()
    
    // Common wood colors
    if (nameLower.includes('walnut') || nameLower.includes('dark brown')) return 'Dark Walnut'
    if (nameLower.includes('cherry')) return 'Cherry'
    if (nameLower.includes('maple')) return 'Natural Maple'
    if (nameLower.includes('oak')) return 'Natural Oak'
    
    // Common carpet/vinyl colors
    if (nameLower.includes('beige') || nameLower.includes('tan')) return 'Beige'
    if (nameLower.includes('gray') || nameLower.includes('grey')) return 'Gray'
    if (nameLower.includes('charcoal')) return 'Charcoal'
    if (nameLower.includes('blue')) return 'Blue'
    if (nameLower.includes('brown')) return 'Brown'
    if (nameLower.includes('white')) return 'White'
    if (nameLower.includes('black')) return 'Black'
    if (nameLower.includes('cream')) return 'Cream'
    if (nameLower.includes('stone')) return 'Stone'
    
    return 'Natural'
  }

  return {
    id: `odoo-${odooProduct.id}`,
    odooId: odooProduct.id,
    name: odooProduct.name,
    sku: odooProduct.default_code || `SKU-${odooProduct.id}`,
    category,
    price: odooProduct.list_price || 0,
    pricePerSqFt: odooProduct.list_price || 0,
    image: productImages[0],
    images: productImages,
    description: odooProduct.description_sale || `Premium ${category} flooring from Odoo`,
    inStock: (odooProduct.qty_available || 0) > 0,
    stockQuantity: odooProduct.qty_available || 0,
    brand: 'Nationwide Floorcovering',
    rating: 4.5, // Default rating, TODO: Integrate with review system
    reviewCount: 0, // Default review count, TODO: Integrate with review system
    certifications: ['Quality Certified', 'Eco-Friendly'],
    specifications: {
      color: getColor(odooProduct.name),
      material: odooProduct.categ_id?.[1] || 'Premium Material',
      warranty: '25 years',
      thickness: category === 'hardwood' ? '3/4 inch' : category === 'vinyl' ? '8mm' : '1/2 inch',
      durabilityRating: category === 'vinyl' ? 5 : 4,
      moistureResistance: getMoistureResistance(category),
      scratchResistance: category === 'vinyl' ? 'Very High' : 'High',
      roomSuitability: getRoomSuitability(category),
      installation: getInstallation(category),
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
