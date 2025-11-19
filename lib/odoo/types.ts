// Odoo ERP EDI Integration Types

export interface OdooConfig {
  url: string
  db: string
  username: string
  password: string
  apiKey?: string
}

export interface OdooProduct {
  id: number
  name: string
  default_code: string // SKU
  list_price: number
  standard_price: number // Cost
  qty_available: number
  virtual_available: number
  type: 'product' | 'service' | 'consu'
  categ_id: [number, string]
  description_sale?: string
  image_1920?: string
  barcode?: string
  weight?: number
  volume?: number
  uom_id: [number, string]
  uom_po_id: [number, string]
  taxes_id: number[]
}

export interface OdooSaleOrder {
  id: number
  name: string // Order reference
  partner_id: [number, string] // Customer
  date_order: string
  amount_total: number
  amount_tax: number
  amount_untaxed: number
  state: 'draft' | 'sent' | 'sale' | 'done' | 'cancel'
  order_line: number[] | OdooOrderLine[]
  invoice_status: 'upselling' | 'invoiced' | 'to invoice' | 'no'
  delivery_status: 'pending' | 'partial' | 'full'
  user_id: [number, string] // Salesperson
  team_id: [number, string] // Sales team
  payment_term_id?: [number, string]
  pricelist_id: [number, string]
}

export interface OdooOrderLine {
  id: number
  order_id: [number, string]
  product_id: [number, string]
  name: string // Description
  product_uom_qty: number
  qty_delivered: number
  qty_invoiced: number
  price_unit: number
  price_subtotal: number
  price_total: number
  discount: number
  tax_id: number[]
  product_uom: [number, string]
}

export interface OdooPartner {
  id: number
  name: string
  email?: string
  phone?: string
  mobile?: string
  street?: string
  street2?: string
  city?: string
  state_id?: [number, string]
  zip?: string
  country_id?: [number, string]
  vat?: string // Tax ID
  customer_rank: number
  supplier_rank: number
  is_company: boolean
  company_type: 'person' | 'company'
}

export interface OdooStockMove {
  id: number
  name: string
  product_id: [number, string]
  product_uom_qty: number
  product_uom: [number, string]
  location_id: [number, string]
  location_dest_id: [number, string]
  state: 'draft' | 'waiting' | 'confirmed' | 'assigned' | 'done' | 'cancel'
  picking_id: [number, string]
  origin?: string
  date: string
}

export interface OdooInvoice {
  id: number
  name: string
  partner_id: [number, string]
  invoice_date: string
  invoice_date_due: string
  amount_total: number
  amount_tax: number
  amount_untaxed: number
  state: 'draft' | 'posted' | 'cancel'
  payment_state: 'not_paid' | 'in_payment' | 'paid' | 'partial' | 'reversed'
  invoice_line_ids: number[]
  move_type: 'out_invoice' | 'out_refund' | 'in_invoice' | 'in_refund'
}

export interface OdooResponse<T> {
  jsonrpc: string
  id: number
  result?: T
  error?: {
    code: number
    message: string
    data: {
      name: string
      debug: string
      message: string
      arguments: any[]
    }
  }
}

export interface OdooSearchReadParams {
  model: string
  domain?: any[]
  fields?: string[]
  limit?: number
  offset?: number
  order?: string
  context?: Record<string, any>
}

export interface OdooCreateParams {
  model: string
  values: Record<string, any>
  context?: Record<string, any>
}

export interface OdooWriteParams {
  model: string
  ids: number[]
  values: Record<string, any>
  context?: Record<string, any>
}

// EDI Message Types for B2B Integration
export interface EDIOrder {
  orderNumber: string
  orderDate: string
  customerId: string
  customerName: string
  customerEmail: string
  shippingAddress: {
    street: string
    city: string
    state: string
    zip: string
    country: string
  }
  billingAddress: {
    street: string
    city: string
    state: string
    zip: string
    country: string
  }
  items: {
    sku: string
    productName: string
    quantity: number
    unitPrice: number
    sqFeet?: number
    total: number
  }[]
  subtotal: number
  tax: number
  shipping: number
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
}

export interface EDISyncStatus {
  lastSync: string
  nextSync: string
  status: 'idle' | 'syncing' | 'error'
  recordsSynced: {
    products: number
    orders: number
    customers: number
    inventory: number
  }
  errors: Array<{
    timestamp: string
    type: string
    message: string
    details?: any
  }>
}
