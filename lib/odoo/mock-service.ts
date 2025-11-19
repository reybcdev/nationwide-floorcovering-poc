// Mock Odoo Service for Demo Purposes
// This simulates Odoo ERP responses without needing a real Odoo instance

import type {
  OdooProduct,
  OdooSaleOrder,
  OdooPartner,
  OdooOrderLine,
  EDIOrder,
  EDISyncStatus,
} from './types'
import { products } from '../mock-data'

// Mock Odoo Products based on our floorcovering products
export const mockOdooProducts: OdooProduct[] = products.map((product, index) => ({
  id: parseInt(product.id) + 1000,
  name: product.name,
  default_code: `SKU-${product.id.padStart(6, '0')}`,
  list_price: product.pricePerSqFt,
  standard_price: product.pricePerSqFt * 0.6, // 40% margin
  qty_available: product.inStock ? Math.floor(Math.random() * 500) + 100 : 0,
  virtual_available: product.inStock
    ? Math.floor(Math.random() * 600) + 150
    : 0,
  type: 'product',
  categ_id: [index + 1, `Floorcovering / ${product.category}`],
  description_sale: product.description,
  barcode: `${Math.floor(Math.random() * 1000000000000)}`,
  weight: 20.5,
  volume: 0.1,
  uom_id: [1, 'Square Feet'],
  uom_po_id: [1, 'Square Feet'],
  taxes_id: [1],
}))

// Mock Odoo Partners (Customers)
export const mockOdooPartners: OdooPartner[] = [
  {
    id: 1001,
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+1 555-0101',
    street: '123 Main Street',
    city: 'New York',
    state_id: [33, 'New York'],
    zip: '10001',
    country_id: [233, 'United States'],
    customer_rank: 5,
    supplier_rank: 0,
    is_company: false,
    company_type: 'person',
  },
  {
    id: 1002,
    name: 'ABC Construction LLC',
    email: 'orders@abcconstruction.com',
    phone: '+1 555-0202',
    street: '456 Business Ave',
    city: 'Los Angeles',
    state_id: [5, 'California'],
    zip: '90001',
    country_id: [233, 'United States'],
    vat: 'US123456789',
    customer_rank: 10,
    supplier_rank: 0,
    is_company: true,
    company_type: 'company',
  },
  {
    id: 1003,
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    phone: '+1 555-0303',
    street: '789 Oak Street',
    city: 'Chicago',
    state_id: [14, 'Illinois'],
    zip: '60601',
    country_id: [233, 'United States'],
    customer_rank: 3,
    supplier_rank: 0,
    is_company: false,
    company_type: 'person',
  },
]

// Mock Odoo Sale Orders
export const mockOdooSaleOrders: OdooSaleOrder[] = [
  {
    id: 2001,
    name: 'SO001',
    partner_id: [1001, 'John Smith'],
    date_order: new Date(Date.now() - 86400000 * 2).toISOString(),
    amount_total: 1247.5,
    amount_tax: 97.5,
    amount_untaxed: 1150.0,
    state: 'sale',
    order_line: [3001, 3002],
    invoice_status: 'to invoice',
    delivery_status: 'pending',
    user_id: [1, 'Sales Team'],
    team_id: [1, 'Direct Sales'],
    pricelist_id: [1, 'Public Pricelist'],
  },
  {
    id: 2002,
    name: 'SO002',
    partner_id: [1002, 'ABC Construction LLC'],
    date_order: new Date(Date.now() - 86400000 * 5).toISOString(),
    amount_total: 5620.0,
    amount_tax: 420.0,
    amount_untaxed: 5200.0,
    state: 'sale',
    order_line: [3003, 3004, 3005],
    invoice_status: 'invoiced',
    delivery_status: 'partial',
    user_id: [1, 'Sales Team'],
    team_id: [1, 'Direct Sales'],
    pricelist_id: [2, 'Contractor Pricelist'],
  },
  {
    id: 2003,
    name: 'SO003',
    partner_id: [1003, 'Jane Doe'],
    date_order: new Date(Date.now() - 86400000 * 1).toISOString(),
    amount_total: 673.5,
    amount_tax: 48.5,
    amount_untaxed: 625.0,
    state: 'draft',
    order_line: [3006],
    invoice_status: 'no',
    delivery_status: 'pending',
    user_id: [1, 'Sales Team'],
    team_id: [1, 'Direct Sales'],
    pricelist_id: [1, 'Public Pricelist'],
  },
]

// Mock Odoo Order Lines
export const mockOdooOrderLines: OdooOrderLine[] = [
  {
    id: 3001,
    order_id: [2001, 'SO001'],
    product_id: [1001, 'Premium Oak Hardwood Flooring'],
    name: 'Premium Oak Hardwood Flooring',
    product_uom_qty: 100,
    qty_delivered: 0,
    qty_invoiced: 0,
    price_unit: 8.99,
    price_subtotal: 899.0,
    price_total: 966.93,
    discount: 0,
    tax_id: [1],
    product_uom: [1, 'Square Feet'],
  },
  {
    id: 3002,
    order_id: [2001, 'SO001'],
    product_id: [1003, 'Waterproof Luxury Vinyl Plank'],
    name: 'Waterproof Luxury Vinyl Plank - Gray Oak',
    product_uom_qty: 50,
    qty_delivered: 0,
    qty_invoiced: 0,
    price_unit: 4.49,
    price_subtotal: 224.5,
    price_total: 241.45,
    discount: 0,
    tax_id: [1],
    product_uom: [1, 'Square Feet'],
  },
]

// Mock EDI Sync Status
export const mockEDISyncStatus: EDISyncStatus = {
  lastSync: new Date(Date.now() - 3600000).toISOString(),
  nextSync: new Date(Date.now() + 3600000).toISOString(),
  status: 'idle',
  recordsSynced: {
    products: mockOdooProducts.length,
    orders: mockOdooSaleOrders.length,
    customers: mockOdooPartners.length,
    inventory: mockOdooProducts.reduce((sum, p) => sum + p.qty_available, 0),
  },
  errors: [],
}

/**
 * Mock Odoo Service - Simulates Odoo API responses
 */
export class MockOdooService {
  private products = [...mockOdooProducts]
  private partners = [...mockOdooPartners]
  private saleOrders = [...mockOdooSaleOrders]
  private orderLines = [...mockOdooOrderLines]
  private syncStatus = { ...mockEDISyncStatus }

  /**
   * Get all products
   */
  async getProducts(limit = 50): Promise<OdooProduct[]> {
    await this.simulateDelay()
    return this.products.slice(0, limit)
  }

  /**
   * Get product by ID
   */
  async getProduct(id: number): Promise<OdooProduct | undefined> {
    await this.simulateDelay()
    return this.products.find((p) => p.id === id)
  }

  /**
   * Update product inventory
   */
  async updateProductInventory(
    productId: number,
    quantity: number
  ): Promise<boolean> {
    await this.simulateDelay()
    const product = this.products.find((p) => p.id === productId)
    if (product) {
      product.qty_available = quantity
      product.virtual_available = quantity + Math.floor(Math.random() * 50)
      return true
    }
    return false
  }

  /**
   * Get all sale orders
   */
  async getSaleOrders(limit = 50): Promise<OdooSaleOrder[]> {
    await this.simulateDelay()
    return this.saleOrders.slice(0, limit)
  }

  /**
   * Get sale order by ID
   */
  async getSaleOrder(id: number): Promise<OdooSaleOrder | undefined> {
    await this.simulateDelay()
    return this.saleOrders.find((o) => o.id === id)
  }

  /**
   * Create a new sale order from e-commerce order
   */
  async createSaleOrderFromEDI(ediOrder: EDIOrder): Promise<number> {
    await this.simulateDelay()

    // Find or create partner
    let partner = this.partners.find(
      (p) => p.email === ediOrder.customerEmail
    )
    if (!partner) {
      partner = {
        id: this.partners.length + 1001,
        name: ediOrder.customerName,
        email: ediOrder.customerEmail,
        street: ediOrder.shippingAddress.street,
        city: ediOrder.shippingAddress.city,
        zip: ediOrder.shippingAddress.zip,
        customer_rank: 1,
        supplier_rank: 0,
        is_company: false,
        company_type: 'person',
      }
      this.partners.push(partner)
    }

    // Create order
    const newOrderId = this.saleOrders.length + 2001
    const newOrder: OdooSaleOrder = {
      id: newOrderId,
      name: `SO${String(newOrderId).padStart(6, '0')}`,
      partner_id: [partner.id, partner.name],
      date_order: new Date().toISOString(),
      amount_total: ediOrder.total,
      amount_tax: ediOrder.tax,
      amount_untaxed: ediOrder.subtotal,
      state: 'draft',
      order_line: [],
      invoice_status: 'no',
      delivery_status: 'pending',
      user_id: [1, 'E-commerce Integration'],
      team_id: [2, 'Online Sales'],
      pricelist_id: [1, 'Public Pricelist'],
    }

    // Create order lines
    const lineIds: number[] = []
    for (const item of ediOrder.items) {
      const product = this.products.find((p) => p.default_code === item.sku)
      if (product) {
        const lineId = this.orderLines.length + 3001
        const orderLine: OdooOrderLine = {
          id: lineId,
          order_id: [newOrderId, newOrder.name],
          product_id: [product.id, product.name],
          name: item.productName,
          product_uom_qty: item.quantity,
          qty_delivered: 0,
          qty_invoiced: 0,
          price_unit: item.unitPrice,
          price_subtotal: item.total,
          price_total: item.total * 1.0875, // With tax
          discount: 0,
          tax_id: [1],
          product_uom: [1, 'Square Feet'],
        }
        this.orderLines.push(orderLine)
        lineIds.push(lineId)
      }
    }

    newOrder.order_line = lineIds
    this.saleOrders.push(newOrder)

    // Update sync status
    this.syncStatus.recordsSynced.orders++
    this.syncStatus.lastSync = new Date().toISOString()

    return newOrderId
  }

  /**
   * Confirm a sale order
   */
  async confirmSaleOrder(orderId: number): Promise<boolean> {
    await this.simulateDelay()
    const order = this.saleOrders.find((o) => o.id === orderId)
    if (order) {
      order.state = 'sale'
      order.invoice_status = 'to invoice'
      return true
    }
    return false
  }

  /**
   * Get all partners/customers
   */
  async getPartners(limit = 50): Promise<OdooPartner[]> {
    await this.simulateDelay()
    return this.partners.slice(0, limit)
  }

  /**
   * Get EDI sync status
   */
  async getSyncStatus(): Promise<EDISyncStatus> {
    await this.simulateDelay()
    return { ...this.syncStatus }
  }

  /**
   * Trigger manual sync
   */
  async triggerSync(): Promise<EDISyncStatus> {
    this.syncStatus.status = 'syncing'
    await this.simulateDelay(2000)

    // Simulate successful sync
    this.syncStatus.status = 'idle'
    this.syncStatus.lastSync = new Date().toISOString()
    this.syncStatus.nextSync = new Date(
      Date.now() + 3600000
    ).toISOString()

    return { ...this.syncStatus }
  }

  /**
   * Simulate API delay
   */
  private async simulateDelay(ms = 300): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

// Singleton instance
let mockServiceInstance: MockOdooService | null = null

export function getMockOdooService(): MockOdooService {
  if (!mockServiceInstance) {
    mockServiceInstance = new MockOdooService()
  }
  return mockServiceInstance
}
