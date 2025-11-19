// Helper functions for syncing e-commerce data with Odoo ERP

import type { EDIOrder } from './types'
import type { Product } from '../mock-data'

interface CartItem {
  product: Product
  quantity: number
  sqFeet: number
}

/**
 * Convert cart items to EDI order format for Odoo
 */
export function convertCartToEDIOrder(
  cartItems: CartItem[],
  customerInfo: {
    name: string
    email: string
    phone?: string
    shippingAddress: {
      street: string
      city: string
      state: string
      zip: string
      country: string
    }
    billingAddress?: {
      street: string
      city: string
      state: string
      zip: string
      country: string
    }
  }
): EDIOrder {
  const subtotal = cartItems.reduce(
    (total, item) => total + item.product.pricePerSqFt * item.sqFeet,
    0
  )
  const tax = subtotal * 0.0875 // 8.75% tax rate
  const shipping = subtotal > 500 ? 0 : 75 // Free shipping over $500
  const total = subtotal + tax + shipping

  const orderNumber = `WEB-${Date.now()}-${Math.floor(Math.random() * 1000)}`

  return {
    orderNumber,
    orderDate: new Date().toISOString(),
    customerId: customerInfo.email,
    customerName: customerInfo.name,
    customerEmail: customerInfo.email,
    shippingAddress: customerInfo.shippingAddress,
    billingAddress: customerInfo.billingAddress || customerInfo.shippingAddress,
    items: cartItems.map((item) => ({
      sku: `SKU-${item.product.id.padStart(6, '0')}`,
      productName: item.product.name,
      quantity: item.quantity,
      unitPrice: item.product.pricePerSqFt,
      sqFeet: item.sqFeet,
      total: item.product.pricePerSqFt * item.sqFeet,
    })),
    subtotal,
    tax,
    shipping,
    total,
    status: 'pending',
  }
}

/**
 * Send order to Odoo ERP via API
 */
export async function syncOrderToOdoo(ediOrder: EDIOrder): Promise<{
  success: boolean
  odooOrderId?: number
  error?: string
}> {
  try {
    const response = await fetch('/api/odoo/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ediOrder),
    })

    const data = await response.json()

    if (data.success) {
      return {
        success: true,
        odooOrderId: data.data.odooOrderId,
      }
    } else {
      return {
        success: false,
        error: data.error || 'Failed to sync order',
      }
    }
  } catch (error) {
    console.error('Error syncing order to Odoo:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Get product inventory from Odoo
 */
export async function getProductInventory(productSku: string): Promise<{
  available: number
  virtual: number
} | null> {
  try {
    const response = await fetch('/api/odoo/products')
    const data = await response.json()

    if (data.success) {
      const product = data.data.find((p: any) => p.default_code === productSku)
      if (product) {
        return {
          available: product.qty_available,
          virtual: product.virtual_available,
        }
      }
    }
    return null
  } catch (error) {
    console.error('Error fetching product inventory:', error)
    return null
  }
}

/**
 * Check if products are in stock in Odoo
 */
export async function checkInventoryAvailability(
  items: Array<{ sku: string; quantity: number }>
): Promise<{
  available: boolean
  insufficientStock: Array<{ sku: string; requested: number; available: number }>
}> {
  try {
    const response = await fetch('/api/odoo/products')
    const data = await response.json()

    if (!data.success) {
      return { available: true, insufficientStock: [] }
    }

    const insufficientStock: Array<{
      sku: string
      requested: number
      available: number
    }> = []

    for (const item of items) {
      const product = data.data.find((p: any) => p.default_code === item.sku)
      if (product && product.qty_available < item.quantity) {
        insufficientStock.push({
          sku: item.sku,
          requested: item.quantity,
          available: product.qty_available,
        })
      }
    }

    return {
      available: insufficientStock.length === 0,
      insufficientStock,
    }
  } catch (error) {
    console.error('Error checking inventory:', error)
    // Return true to allow order in case of API error
    return { available: true, insufficientStock: [] }
  }
}
