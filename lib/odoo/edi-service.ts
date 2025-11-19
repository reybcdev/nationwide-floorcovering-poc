/**
 * EDI (Electronic Data Interchange) Service
 * Generates EDI documents for orders and invoices
 * 
 * Supported Transaction Sets:
 * - EDI 850: Purchase Order
 * - EDI 810: Invoice
 */

import type { OdooSaleOrder } from './types'

export interface EDI850LineItem {
  lineNumber: number
  sku: string
  quantity: number
  unitOfMeasure: string
  unitPrice: number
  productDescription: string
}

export interface EDI850Document {
  transactionSet: '850'
  purchaseOrderNumber: string
  purchaseOrderDate: string
  buyer: {
    name: string
    address: string
    city: string
    state: string
    zip: string
  }
  seller: {
    name: string
    address: string
    city: string
    state: string
    zip: string
  }
  shipTo: {
    name: string
    address: string
    city: string
    state: string
    zip: string
  }
  lineItems: EDI850LineItem[]
  totalAmount: number
  currency: string
  paymentTerms: string
  requestedDeliveryDate?: string
}

export interface EDI810LineItem {
  lineNumber: number
  sku: string
  quantity: number
  unitPrice: number
  extendedPrice: number
  productDescription: string
}

export interface EDI810Document {
  transactionSet: '810'
  invoiceNumber: string
  invoiceDate: string
  purchaseOrderNumber: string
  buyer: {
    name: string
    address: string
  }
  seller: {
    name: string
    address: string
  }
  lineItems: EDI810LineItem[]
  subtotal: number
  taxAmount: number
  totalAmount: number
  currency: string
  paymentTerms: string
  dueDate: string
}

/**
 * Generate EDI 850 (Purchase Order) from e-commerce order
 */
export function generateEDI850(orderData: {
  orderNumber: string
  orderDate: string
  customerName: string
  customerAddress: string
  customerCity: string
  customerState: string
  customerZip: string
  items: Array<{
    sku: string
    name: string
    quantity: number
    unitPrice: number
  }>
  total: number
}): EDI850Document {
  const lineItems: EDI850LineItem[] = orderData.items.map((item, index) => ({
    lineNumber: index + 1,
    sku: item.sku,
    quantity: item.quantity,
    unitOfMeasure: 'SQ FT',
    unitPrice: item.unitPrice,
    productDescription: item.name,
  }))

  return {
    transactionSet: '850',
    purchaseOrderNumber: orderData.orderNumber,
    purchaseOrderDate: orderData.orderDate,
    buyer: {
      name: orderData.customerName,
      address: orderData.customerAddress,
      city: orderData.customerCity,
      state: orderData.customerState,
      zip: orderData.customerZip,
    },
    seller: {
      name: 'Nationwide Floorcovering',
      address: '123 Flooring Street',
      city: 'New York',
      state: 'NY',
      zip: '10001',
    },
    shipTo: {
      name: orderData.customerName,
      address: orderData.customerAddress,
      city: orderData.customerCity,
      state: orderData.customerState,
      zip: orderData.customerZip,
    },
    lineItems,
    totalAmount: orderData.total,
    currency: 'USD',
    paymentTerms: 'Net 30',
    requestedDeliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  }
}

/**
 * Generate EDI 810 (Invoice) from Odoo sale order
 */
export function generateEDI810(invoiceData: {
  invoiceNumber: string
  invoiceDate: string
  purchaseOrderNumber: string
  customerName: string
  customerAddress: string
  items: Array<{
    sku: string
    name: string
    quantity: number
    unitPrice: number
    total: number
  }>
  subtotal: number
  tax: number
  total: number
}): EDI810Document {
  const lineItems: EDI810LineItem[] = invoiceData.items.map((item, index) => ({
    lineNumber: index + 1,
    sku: item.sku,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    extendedPrice: item.total,
    productDescription: item.name,
  }))

  const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  return {
    transactionSet: '810',
    invoiceNumber: invoiceData.invoiceNumber,
    invoiceDate: invoiceData.invoiceDate,
    purchaseOrderNumber: invoiceData.purchaseOrderNumber,
    buyer: {
      name: invoiceData.customerName,
      address: invoiceData.customerAddress,
    },
    seller: {
      name: 'Nationwide Floorcovering',
      address: '123 Flooring Street, New York, NY 10001',
    },
    lineItems,
    subtotal: invoiceData.subtotal,
    taxAmount: invoiceData.tax,
    totalAmount: invoiceData.total,
    currency: 'USD',
    paymentTerms: 'Net 30',
    dueDate,
  }
}

/**
 * Convert EDI 850 to X12 format (simplified version)
 */
export function edi850ToX12(edi: EDI850Document): string {
  const segments: string[] = []
  
  // ISA - Interchange Control Header
  segments.push('ISA*00*          *00*          *ZZ*SENDER         *ZZ*RECEIVER       *' + 
    new Date().toISOString().slice(0,10).replace(/-/g, '').slice(2) + '*' +
    new Date().toTimeString().slice(0,5).replace(/:/g, '') + '*U*00401*000000001*0*P*>~')
  
  // GS - Functional Group Header
  segments.push('GS*PO*SENDER*RECEIVER*' + 
    new Date().toISOString().slice(0,10).replace(/-/g, '') + '*' +
    new Date().toTimeString().slice(0,5).replace(/:/g, '') + '*1*X*004010~')
  
  // ST - Transaction Set Header
  segments.push('ST*850*0001~')
  
  // BEG - Beginning Segment for Purchase Order
  segments.push(`BEG*00*SA*${edi.purchaseOrderNumber}*${edi.purchaseOrderDate.replace(/-/g, '')}~`)
  
  // N1 - Name - Buyer
  segments.push(`N1*BY*${edi.buyer.name}~`)
  segments.push(`N3*${edi.buyer.address}~`)
  segments.push(`N4*${edi.buyer.city}*${edi.buyer.state}*${edi.buyer.zip}~`)
  
  // N1 - Name - Seller
  segments.push(`N1*SE*${edi.seller.name}~`)
  
  // PO1 - Baseline Item Data
  edi.lineItems.forEach(item => {
    segments.push(`PO1*${item.lineNumber}*${item.quantity}*${item.unitOfMeasure}*${item.unitPrice}**BP*${item.sku}~`)
    segments.push(`PID*F****${item.productDescription}~`)
  })
  
  // CTT - Transaction Totals
  segments.push(`CTT*${edi.lineItems.length}~`)
  
  // SE - Transaction Set Trailer
  segments.push(`SE*${segments.length + 1}*0001~`)
  
  // GE - Functional Group Trailer
  segments.push('GE*1*1~')
  
  // IEA - Interchange Control Trailer
  segments.push('IEA*1*000000001~')
  
  return segments.join('\n')
}

/**
 * Convert EDI 810 to X12 format (simplified version)
 */
export function edi810ToX12(edi: EDI810Document): string {
  const segments: string[] = []
  
  // ISA - Interchange Control Header
  segments.push('ISA*00*          *00*          *ZZ*SENDER         *ZZ*RECEIVER       *' + 
    new Date().toISOString().slice(0,10).replace(/-/g, '').slice(2) + '*' +
    new Date().toTimeString().slice(0,5).replace(/:/g, '') + '*U*00401*000000001*0*P*>~')
  
  // GS - Functional Group Header
  segments.push('GS*IN*SENDER*RECEIVER*' + 
    new Date().toISOString().slice(0,10).replace(/-/g, '') + '*' +
    new Date().toTimeString().slice(0,5).replace(/:/g, '') + '*1*X*004010~')
  
  // ST - Transaction Set Header
  segments.push('ST*810*0001~')
  
  // BIG - Beginning Segment for Invoice
  segments.push(`BIG*${edi.invoiceDate.replace(/-/g, '')}*${edi.invoiceNumber}**${edi.purchaseOrderNumber}~`)
  
  // N1 - Name - Buyer
  segments.push(`N1*BT*${edi.buyer.name}~`)
  
  // N1 - Name - Seller
  segments.push(`N1*SE*${edi.seller.name}~`)
  
  // IT1 - Baseline Item Data (Invoice)
  edi.lineItems.forEach(item => {
    segments.push(`IT1*${item.lineNumber}*${item.quantity}*EA*${item.unitPrice}**BP*${item.sku}~`)
    segments.push(`PID*F****${item.productDescription}~`)
  })
  
  // TDS - Total Monetary Value Summary
  segments.push(`TDS*${Math.round(edi.totalAmount * 100)}~`)
  
  // CAD - Carrier Detail
  segments.push(`CAD*****${edi.paymentTerms}~`)
  
  // SE - Transaction Set Trailer
  segments.push(`SE*${segments.length + 1}*0001~`)
  
  // GE - Functional Group Trailer
  segments.push('GE*1*1~')
  
  // IEA - Interchange Control Trailer
  segments.push('IEA*1*000000001~')
  
  return segments.join('\n')
}

/**
 * Generate EDI documents from Odoo order
 */
export async function generateEDIFromOdooOrder(
  orderNumber: string,
  customerData: {
    name: string
    email: string
    address: string
    city: string
    state: string
    zip: string
  },
  items: Array<{
    sku: string
    name: string
    quantity: number
    unitPrice: number
    total: number
  }>,
  total: number
): Promise<{ edi850: EDI850Document; edi850X12: string; edi810: EDI810Document; edi810X12: string }> {
  
  const orderDate = new Date().toISOString().split('T')[0]
  
  // Generate EDI 850 (Purchase Order)
  const edi850 = generateEDI850({
    orderNumber,
    orderDate,
    customerName: customerData.name,
    customerAddress: customerData.address,
    customerCity: customerData.city,
    customerState: customerData.state,
    customerZip: customerData.zip,
    items: items.map(item => ({
      sku: item.sku,
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
    total,
  })
  
  const edi850X12 = edi850ToX12(edi850)
  
  // Generate EDI 810 (Invoice)
  const subtotal = items.reduce((sum, item) => sum + item.total, 0)
  const tax = subtotal * 0.08 // 8% tax for demo
  
  const edi810 = generateEDI810({
    invoiceNumber: `INV-${orderNumber}`,
    invoiceDate: orderDate,
    purchaseOrderNumber: orderNumber,
    customerName: customerData.name,
    customerAddress: `${customerData.address}, ${customerData.city}, ${customerData.state} ${customerData.zip}`,
    items,
    subtotal,
    tax,
    total: subtotal + tax,
  })
  
  const edi810X12 = edi810ToX12(edi810)
  
  return {
    edi850,
    edi850X12,
    edi810,
    edi810X12,
  }
}
