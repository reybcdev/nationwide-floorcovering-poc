// Odoo API Client for XML-RPC and JSON-RPC communication
import type {
  OdooConfig,
  OdooProduct,
  OdooSaleOrder,
  OdooPartner,
  OdooResponse,
  OdooSearchReadParams,
  OdooCreateParams,
  OdooWriteParams,
  EDIOrder,
  EDISyncStatus,
} from './types'

export class OdooClient {
  private config: OdooConfig
  private uid: number | null = null
  private sessionId: string | null = null
  private cookies: string[] = []

  constructor(config: OdooConfig) {
    this.config = config
  }

  /**
   * Authenticate with Odoo and get user ID
   */
  async authenticate(): Promise<number> {
    try {
      const url = `${this.config.url}/web/session/authenticate`
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'call',
          params: {
            db: this.config.db,
            login: this.config.username,
            password: this.config.password,
          },
          id: Math.floor(Math.random() * 1000000),
        }),
      })

      // Extract cookies from response headers
      const setCookieHeaders = response.headers.getSetCookie?.() || response.headers.get('set-cookie')?.split(',') || []
      if (setCookieHeaders.length > 0) {
        this.cookies = setCookieHeaders
      }

      // Check if response is JSON
      const contentType = response.headers.get('content-type')
      if (!contentType?.includes('application/json')) {
        const text = await response.text()
        throw new Error(
          `Expected JSON response but got ${contentType}. This usually means the Odoo URL is incorrect or the database doesn't exist. Response: ${text.substring(0, 200)}...`
        )
      }

      const data: OdooResponse<any> = await response.json()

      if (data.error) {
        throw new Error(
          `Odoo API Error: ${data.error.data?.message || data.error.message}`
        )
      }

      if (data.result?.uid) {
        this.uid = data.result.uid
        this.sessionId = data.result.session_id
        return this.uid as number
      }

      throw new Error('Authentication failed: No UID returned')
    } catch (error) {
      console.error('Odoo authentication error:', error)
      throw error
    }
  }

  /**
   * Search and read records from Odoo
   */
  async searchRead<T = any>(params: OdooSearchReadParams): Promise<T[]> {
    await this.ensureAuthenticated()

    try {
      // First search for IDs
      const searchResponse = await this.jsonRpcCall('/jsonrpc', {
        service: 'object',
        method: 'execute_kw',
        args: [
          this.config.db,
          this.uid,
          this.config.password,
          params.model,
          'search',
          [params.domain || []],
          {
            limit: params.limit || 80,
            offset: params.offset || 0,
            order: params.order || '',
            context: params.context || {},
          },
        ],
      })

      const ids = searchResponse.result || []
      if (ids.length === 0) {
        return []
      }

      // Then read the records
      const readResponse = await this.jsonRpcCall('/jsonrpc', {
        service: 'object',
        method: 'execute_kw',
        args: [
          this.config.db,
          this.uid,
          this.config.password,
          params.model,
          'read',
          [ids],
          { fields: params.fields || [] },
        ],
      })

      return readResponse.result || []
    } catch (error) {
      console.error(`searchRead failed for model ${params.model}:`, error)
      throw error
    }
  }

  /**
   * Create a new record in Odoo
   */
  async create(params: OdooCreateParams): Promise<number> {
    await this.ensureAuthenticated()

    const response = await this.jsonRpcCall('/jsonrpc', {
      service: 'object',
      method: 'execute_kw',
      args: [
        this.config.db,
        this.uid,
        this.config.password,
        params.model,
        'create',
        [params.values],
        { context: params.context || {} },
      ],
    })

    return response.result
  }

  /**
   * Update existing records in Odoo
   */
  async write(params: OdooWriteParams): Promise<boolean> {
    await this.ensureAuthenticated()

    const response = await this.jsonRpcCall('/jsonrpc', {
      service: 'object',
      method: 'execute_kw',
      args: [
        this.config.db,
        this.uid,
        this.config.password,
        params.model,
        'write',
        [params.ids, params.values],
        { context: params.context || {} },
      ],
    })

    return response.result
  }

  /**
   * Delete records from Odoo
   */
  async unlink(model: string, ids: number[]): Promise<boolean> {
    await this.ensureAuthenticated()

    const response = await this.jsonRpcCall('/jsonrpc', {
      service: 'object',
      method: 'execute_kw',
      args: [
        this.config.db,
        this.uid,
        this.config.password,
        model,
        'unlink',
        [ids],
      ],
    })

    return response.result
  }

  /**
   * Get partners/customers from Odoo
   */
  async getPartners(limit = 50): Promise<OdooPartner[]> {
    return this.searchRead<OdooPartner>({
      model: 'res.partner',
      fields: [
        'name',
        'email',
        'phone',
        'street',
        'street2',
        'city',
        'state_id',
        'zip',
        'country_id',
        'customer_rank',
        'supplier_rank',
        'company_type',
        'vat',
        'website',
      ],
      domain: [['customer_rank', '>', 0]], // Only customers
      limit,
      order: 'name asc',
    })
  }

  /**
   * Get products from Odoo
   */
  async getProducts(limit = 50): Promise<OdooProduct[]> {
    return this.searchRead<OdooProduct>({
      model: 'product.product',
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
        'uom_id',
        'taxes_id',
      ],
      domain: [['sale_ok', '=', true]],
      limit,
    })
  }

  /**
   * Get sales orders from Odoo
   */
  async getSaleOrders(limit = 50, state?: string): Promise<OdooSaleOrder[]> {
    const domain: any[] = []
    if (state) {
      domain.push(['state', '=', state])
    }

    return this.searchRead<OdooSaleOrder>({
      model: 'sale.order',
      fields: [
        'name',
        'partner_id',
        'date_order',
        'amount_total',
        'amount_tax',
        'amount_untaxed',
        'state',
        'invoice_status',
        'user_id',
        'team_id',
        'pricelist_id',
      ],
      domain,
      limit,
      order: 'date_order desc',
    })
  }

  /**
   * Create a sales order in Odoo
   */
  async createSaleOrder(order: {
    partner_id: number
    order_line: Array<{
      product_id: number
      product_uom_qty: number
      price_unit: number
    }>
  }): Promise<number> {
    const orderData = {
      partner_id: order.partner_id,
      order_line: order.order_line.map((line) => [
        0,
        0,
        {
          product_id: line.product_id,
          product_uom_qty: line.product_uom_qty,
          price_unit: line.price_unit,
        },
      ]),
    }

    return this.create({
      model: 'sale.order',
      values: orderData,
    })
  }

  /**
   * Create a sales order from EDI format
   * This method handles the transformation from e-commerce EDI order to Odoo sale order
   */
  async createSaleOrderFromEDI(ediOrder: EDIOrder): Promise<number> {
    // 1. Get or create customer partner
    const partnerId = await this.getOrCreatePartner({
      name: ediOrder.customerName,
      email: ediOrder.customerEmail,
      street: ediOrder.shippingAddress.street,
      city: ediOrder.shippingAddress.city,
      zip: ediOrder.shippingAddress.zip,
    })

    // 2. Look up products by SKU and transform order lines
    const orderLines = []
    for (const item of ediOrder.items) {
      // Find product by SKU (default_code in Odoo)
      const products = await this.searchRead<OdooProduct>({
        model: 'product.product',
        domain: [['default_code', '=', item.sku]],
        fields: ['id', 'name', 'default_code'],
        limit: 1,
      })

      if (products.length === 0) {
        throw new Error(`Product with SKU ${item.sku} not found in Odoo`)
      }

      orderLines.push({
        product_id: products[0].id,
        product_uom_qty: item.quantity,
        price_unit: item.unitPrice,
      })
    }

    // 3. Create the sale order with client_order_ref for e-commerce order number
    const orderData = {
      partner_id: partnerId,
      client_order_ref: ediOrder.orderNumber, // Store e-commerce order number
      order_line: orderLines.map((line) => [
        0,
        0,
        {
          product_id: line.product_id,
          product_uom_qty: line.product_uom_qty,
          price_unit: line.price_unit,
        },
      ]),
    }

    const orderId = await this.create({
      model: 'sale.order',
      values: orderData,
    })

    // 4. Optionally confirm the order automatically
    // await this.confirmSaleOrder(orderId)

    return orderId
  }

  /**
   * Get or create customer/partner
   */
  async getOrCreatePartner(partnerData: {
    name: string
    email?: string
    phone?: string
    street?: string
    city?: string
    zip?: string
    country_id?: number
  }): Promise<number> {
    // Try to find existing partner by email
    if (partnerData.email) {
      const existing = await this.searchRead<OdooPartner>({
        model: 'res.partner',
        domain: [['email', '=', partnerData.email]],
        fields: ['id'],
        limit: 1,
      })

      if (existing.length > 0) {
        return existing[0].id
      }
    }

    // Create new partner
    return this.create({
      model: 'res.partner',
      values: {
        ...partnerData,
        customer_rank: 1,
      },
    })
  }

  /**
   * Update product stock quantity
   */
  async updateProductStock(
    productId: number,
    quantity: number,
    locationId?: number
  ): Promise<void> {
    await this.ensureAuthenticated()
    
    // In Odoo, stock is managed through stock.quant
    // This is a simplified example
    await this.jsonRpcCall('/jsonrpc', {
      service: 'object',
      method: 'execute_kw',
      args: [
        this.config.db,
        this.uid,
        this.config.password,
        'product.product',
        'write',
        [
          [productId],
          {
            // Note: In real Odoo, you'd use stock moves or inventory adjustments
            // This is simplified for demo purposes
            qty_available: quantity,
          },
        ],
      ],
    })
  }

  /**
   * Confirm a sales order
   */
  async confirmSaleOrder(orderId: number): Promise<void> {
    await this.jsonRpcCall('/jsonrpc', {
      service: 'object',
      method: 'execute_kw',
      args: [
        this.config.db,
        this.uid,
        this.config.password,
        'sale.order',
        'action_confirm',
        [[orderId]],
      ],
    })
  }

  /**
   * Get EDI sync status
   * Returns information about recent orders and sync status
   */
  async getSyncStatus(): Promise<EDISyncStatus> {
    try {
      await this.ensureAuthenticated()

      // Get counts for products
      const productCount = await this.searchRead<OdooProduct>({
        model: 'product.product',
        domain: [['sale_ok', '=', true]],
        fields: ['id'],
        limit: 1000,
      })

      // Get counts for orders
      const orderCount = await this.searchRead<OdooSaleOrder>({
        model: 'sale.order',
        domain: [],
        fields: ['id'],
        limit: 1000,
      })

      // Get counts for customers
      const customerCount = await this.searchRead<OdooPartner>({
        model: 'res.partner',
        domain: [['customer_rank', '>', 0]],
        fields: ['id'],
        limit: 1000,
      })

      const now = new Date()
      const nextSync = new Date(now.getTime() + 15 * 60 * 1000) // 15 minutes from now

      return {
        lastSync: now.toISOString(),
        nextSync: nextSync.toISOString(),
        status: 'idle',
        recordsSynced: {
          products: productCount.length,
          orders: orderCount.length,
          customers: customerCount.length,
          inventory: productCount.length, // Same as products for now
        },
        errors: [],
      }
    } catch (error) {
      console.error('Error getting sync status:', error)
      return {
        lastSync: new Date().toISOString(),
        nextSync: new Date().toISOString(),
        status: 'error',
        recordsSynced: {
          products: 0,
          orders: 0,
          customers: 0,
          inventory: 0,
        },
        errors: [
          {
            timestamp: new Date().toISOString(),
            type: 'sync_error',
            message: error instanceof Error ? error.message : 'Unknown sync error',
          },
        ],
      }
    }
  }

  /**
   * Trigger manual sync with Odoo
   * Fetches recent orders and returns sync summary
   */
  async triggerSync(): Promise<EDISyncStatus> {
    try {
      await this.ensureAuthenticated()

      // Get counts for products
      const productCount = await this.searchRead<OdooProduct>({
        model: 'product.product',
        domain: [['sale_ok', '=', true]],
        fields: ['id'],
        limit: 1000,
      })

      // Get counts for orders
      const orderCount = await this.searchRead<OdooSaleOrder>({
        model: 'sale.order',
        domain: [],
        fields: ['id'],
        limit: 1000,
      })

      // Get counts for customers
      const customerCount = await this.searchRead<OdooPartner>({
        model: 'res.partner',
        domain: [['customer_rank', '>', 0]],
        fields: ['id'],
        limit: 1000,
      })

      const now = new Date()
      const nextSync = new Date(now.getTime() + 15 * 60 * 1000) // 15 minutes from now

      return {
        lastSync: now.toISOString(),
        nextSync: nextSync.toISOString(),
        status: 'idle',
        recordsSynced: {
          products: productCount.length,
          orders: orderCount.length,
          customers: customerCount.length,
          inventory: productCount.length, // Same as products for now
        },
        errors: [],
      }
    } catch (error) {
      console.error('Error triggering sync:', error)
      return {
        lastSync: new Date().toISOString(),
        nextSync: new Date().toISOString(),
        status: 'error',
        recordsSynced: {
          products: 0,
          orders: 0,
          customers: 0,
          inventory: 0,
        },
        errors: [
          {
            timestamp: new Date().toISOString(),
            type: 'sync_error',
            message: error instanceof Error ? error.message : 'Sync failed',
          },
        ],
      }
    }
  }

  /**
   * Make JSON-RPC call to Odoo
   */
  private async jsonRpcCall(
    endpoint: string,
    params: any
  ): Promise<OdooResponse<any>> {
    const url = `${this.config.url}${endpoint}`

    // Build cookie header from stored cookies
    const cookieHeader = this.cookies.length > 0 
      ? this.cookies.map(c => c.split(';')[0]).join('; ')
      : (this.sessionId ? `session_id=${this.sessionId}` : '')

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'call',
        params,
        id: Math.floor(Math.random() * 1000000),
      }),
    })

    // Update cookies if new ones are provided
    const setCookieHeaders = response.headers.getSetCookie?.() || response.headers.get('set-cookie')?.split(',') || []
    if (setCookieHeaders.length > 0) {
      this.cookies = setCookieHeaders
    }

    // Check if response is JSON
    const contentType = response.headers.get('content-type')
    if (!contentType?.includes('application/json')) {
      const text = await response.text()
      throw new Error(
        `Expected JSON response but got ${contentType}. Response: ${text.substring(0, 200)}...`
      )
    }

    const data: OdooResponse<any> = await response.json()

    if (data.error) {
      throw new Error(
        `Odoo API Error: ${data.error.data?.message || data.error.message}`
      )
    }

    return data
  }

  /**
   * Ensure user is authenticated before making calls
   */
  private async ensureAuthenticated(): Promise<void> {
    if (!this.uid) {
      await this.authenticate()
    }
  }
}

// Singleton instance to maintain session across requests
let clientInstance: OdooClient | null = null

/**
 * Get Odoo client instance with config from environment
 * Uses singleton pattern to maintain session across API calls
 */
export function getOdooClient(): OdooClient {
  // Return existing instance if available
  if (clientInstance) {
    return clientInstance
  }

  // Remove trailing slash from URL if present
  const url = (process.env.ODOO_URL || 'http://localhost:8069').replace(/\/$/, '')
  
  const config: OdooConfig = {
    url,
    db: process.env.ODOO_DB || 'odoo',
    username: process.env.ODOO_USERNAME || 'admin',
    password: process.env.ODOO_PASSWORD || 'admin',
    apiKey: process.env.ODOO_API_KEY,
  }

  clientInstance = new OdooClient(config)
  return clientInstance
}

/**
 * Reset the client instance (useful for testing or switching configs)
 */
export function resetOdooClient(): void {
  clientInstance = null
}
