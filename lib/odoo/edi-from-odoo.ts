/**
 * Generate EDI Documents from Odoo ERP Data
 * This service retrieves order/shipment data from Odoo and generates EDI documents
 */

import { getOdooClient } from './client'
import { generateEDI850, generateEDI810, edi850ToX12, edi810ToX12 } from './edi-service'
import { generateEDI856, edi856ToX12 } from './edi-shipping'

/**
 * Retrieve sale order from Odoo and generate EDI 850 (Purchase Order)
 * 
 * @param odooOrderId - Odoo sale.order ID
 * @returns EDI 850 document in X12 format
 */
export async function generateEDI850FromOdoo(odooOrderId: number): Promise<string> {
  const odooClient = getOdooClient()
  
  // Step 1: Read order from Odoo
  const orders = await odooClient.searchRead({
    model: 'sale.order',
    domain: [['id', '=', odooOrderId]],
    fields: [
      'name',
      'partner_id',
      'date_order',
      'order_line',
      'amount_total',
    ],
  })
  
  if (orders.length === 0) {
    throw new Error(`Order ${odooOrderId} not found in Odoo`)
  }
  
  const order = orders[0]
  
  // Step 2: Read customer/partner details
  const partners = await odooClient.searchRead({
    model: 'res.partner',
    domain: [['id', '=', order.partner_id[0]]],
    fields: ['name', 'email', 'phone', 'street', 'city', 'state_id', 'zip', 'country_id'],
  })
  
  const partner = partners[0]
  
  // Step 3: Read order line items
  const orderLineIds = order.order_line
  const orderLines = await odooClient.searchRead({
    model: 'sale.order.line',
    domain: [['id', 'in', orderLineIds]],
    fields: ['product_id', 'product_uom_qty', 'price_unit', 'name'],
  })
  
  // Step 4: Read product details
  const productIds = orderLines.map((line: any) => line.product_id[0])
  const products = await odooClient.searchRead({
    model: 'product.product',
    domain: [['id', 'in', productIds]],
    fields: ['id', 'default_code', 'name', 'barcode'],
  })
  
  // Create product lookup map
  const productMap = new Map(products.map((p: any) => [p.id, p]))
  
  // Step 5: Transform to EDI format
  const items = orderLines.map((line: any, index: number) => {
    const product = productMap.get(line.product_id[0])
    return {
      sku: product?.default_code || product?.barcode || `PROD-${line.product_id[0]}`,
      name: line.name,
      quantity: line.product_uom_qty,
      unitPrice: line.price_unit,
    }
  })
  
  // Step 6: Generate EDI 850
  const edi850 = generateEDI850({
    orderNumber: order.name,
    orderDate: order.date_order.split(' ')[0],
    customer: {
      name: partner.name,
      email: partner.email || '',
      address: partner.street || '',
      city: partner.city || '',
      state: partner.state_id ? partner.state_id[1] : '',
      zip: partner.zip || '',
    },
    items,
    total: order.amount_total,
  })
  
  return edi850ToX12(edi850)
}

/**
 * Retrieve sale order from Odoo and generate EDI 810 (Invoice)
 * 
 * @param odooOrderId - Odoo sale.order ID
 * @returns EDI 810 document in X12 format
 */
export async function generateEDI810FromOdoo(odooOrderId: number): Promise<string> {
  const odooClient = getOdooClient()
  
  // Step 1: Read order from Odoo
  const orders = await odooClient.searchRead({
    model: 'sale.order',
    domain: [['id', '=', odooOrderId]],
    fields: [
      'name',
      'partner_id',
      'date_order',
      'order_line',
      'amount_total',
      'amount_tax',
      'amount_untaxed',
    ],
  })
  
  if (orders.length === 0) {
    throw new Error(`Order ${odooOrderId} not found in Odoo`)
  }
  
  const order = orders[0]
  
  // Step 2: Read customer/partner details
  const partners = await odooClient.searchRead({
    model: 'res.partner',
    domain: [['id', '=', order.partner_id[0]]],
    fields: ['name', 'email', 'street', 'city', 'state_id', 'zip'],
  })
  
  const partner = partners[0]
  
  // Step 3: Read order line items
  const orderLineIds = order.order_line
  const orderLines = await odooClient.searchRead({
    model: 'sale.order.line',
    domain: [['id', 'in', orderLineIds]],
    fields: ['product_id', 'product_uom_qty', 'price_unit', 'price_subtotal', 'name'],
  })
  
  // Step 4: Read product details
  const productIds = orderLines.map((line: any) => line.product_id[0])
  const products = await odooClient.searchRead({
    model: 'product.product',
    domain: [['id', 'in', productIds]],
    fields: ['id', 'default_code', 'name'],
  })
  
  const productMap = new Map(products.map((p: any) => [p.id, p]))
  
  // Step 5: Transform to EDI format
  const items = orderLines.map((line: any, index: number) => {
    const product = productMap.get(line.product_id[0])
    return {
      lineNumber: index + 1,
      sku: product?.default_code || `PROD-${line.product_id[0]}`,
      quantity: line.product_uom_qty,
      unitPrice: line.price_unit,
      amount: line.price_subtotal,
      description: line.name,
    }
  })
  
  // Step 6: Generate EDI 810
  const edi810 = generateEDI810({
    invoiceNumber: `INV-${order.name}`,
    invoiceDate: order.date_order.split(' ')[0],
    orderNumber: order.name,
    customer: {
      name: partner.name,
      email: partner.email || '',
      address: partner.street || '',
      city: partner.city || '',
      state: partner.state_id ? partner.state_id[1] : '',
      zip: partner.zip || '',
    },
    items,
    subtotal: order.amount_untaxed,
    tax: order.amount_tax,
    total: order.amount_total,
  })
  
  return edi810ToX12(edi810)
}

/**
 * Retrieve delivery order from Odoo and generate EDI 856 (Advance Ship Notice)
 * 
 * @param odooPickingId - Odoo stock.picking ID (delivery order)
 * @param trackingNumber - Carrier tracking number
 * @param carrier - Carrier name (UPS, FEDEX, USPS)
 * @returns EDI 856 document in X12 format
 */
export async function generateEDI856FromOdoo(
  odooPickingId: number,
  trackingNumber: string,
  carrier: 'UPS' | 'FEDEX' | 'USPS'
): Promise<string> {
  const odooClient = getOdooClient()
  
  // Step 1: Read delivery order from Odoo
  const pickings = await odooClient.searchRead({
    model: 'stock.picking',
    domain: [['id', '=', odooPickingId]],
    fields: [
      'name',
      'origin', // sale order reference
      'partner_id',
      'scheduled_date',
      'move_ids_without_package',
      'carrier_tracking_ref',
    ],
  })
  
  if (pickings.length === 0) {
    throw new Error(`Delivery ${odooPickingId} not found in Odoo`)
  }
  
  const picking = pickings[0]
  
  // Step 2: Read customer/partner details
  const partners = await odooClient.searchRead({
    model: 'res.partner',
    domain: [['id', '=', picking.partner_id[0]]],
    fields: ['name', 'street', 'city', 'state_id', 'zip'],
  })
  
  const partner = partners[0]
  
  // Step 3: Read stock moves (items being shipped)
  const moveIds = picking.move_ids_without_package
  const moves = await odooClient.searchRead({
    model: 'stock.move',
    domain: [['id', 'in', moveIds]],
    fields: ['product_id', 'product_uom_qty', 'name'],
  })
  
  // Step 4: Read product details
  const productIds = moves.map((move: any) => move.product_id[0])
  const products = await odooClient.searchRead({
    model: 'product.product',
    domain: [['id', 'in', productIds]],
    fields: ['id', 'default_code', 'name', 'weight'],
  })
  
  const productMap = new Map(products.map((p: any) => [p.id, p]))
  
  // Step 5: Calculate total weight for package
  const totalWeight = products.reduce((sum: number, p: any) => sum + (p.weight || 0), 0)
  
  // Step 6: Transform to EDI format
  const items = moves.map((move: any) => {
    const product = productMap.get(move.product_id[0])
    return {
      sku: product?.default_code || `PROD-${move.product_id[0]}`,
      name: move.name,
      quantity: move.product_uom_qty,
    }
  })
  
  // Step 7: Generate EDI 856
  const edi856 = generateEDI856({
    shipmentId: picking.name,
    purchaseOrderNumber: picking.origin || picking.name,
    invoiceNumber: `INV-${picking.origin || picking.name}`,
    shipDate: picking.scheduled_date?.split(' ')[0] || new Date().toISOString().split('T')[0],
    carrier,
    trackingNumber: picking.carrier_tracking_ref || trackingNumber,
    serviceLevel: 'Ground',
    shipFrom: {
      name: 'Nationwide Floorcovering',
      address: '123 Flooring Street',
      city: 'New York',
      state: 'NY',
      zip: '10001',
    },
    shipTo: {
      name: partner.name,
      address: partner.street || '',
      city: partner.city || '',
      state: partner.state_id ? partner.state_id[1].split(' ')[0] : '',
      zip: partner.zip || '',
    },
    packages: [
      {
        packageNumber: 'PKG-001',
        trackingNumber: picking.carrier_tracking_ref || trackingNumber,
        weight: totalWeight || 100,
        dimensions: {
          length: 48,
          width: 12,
          height: 6,
        },
      },
    ],
    items,
  })
  
  return edi856ToX12(edi856)
}

/**
 * Complete workflow: Create order in Odoo and generate all EDI documents
 * 
 * @param orderData - Order information
 * @returns All EDI documents
 */
export async function generateAllEDIFromOdoo(orderData: {
  customer: any
  items: any[]
  total: number
}): Promise<{
  odooOrderId: number
  edi850: string
  edi810: string
}> {
  const odooClient = getOdooClient()
  
  // Step 1: Create customer in Odoo if needed
  const partners = await odooClient.searchRead({
    model: 'res.partner',
    domain: [['email', '=', orderData.customer.email]],
    fields: ['id'],
    limit: 1,
  })
  
  let partnerId: number
  
  if (partners.length === 0) {
    // Create new customer
    partnerId = await odooClient.create({
      model: 'res.partner',
      values: {
        name: orderData.customer.name,
        email: orderData.customer.email,
        phone: orderData.customer.phone,
        street: orderData.customer.address,
        city: orderData.customer.city,
        zip: orderData.customer.zip,
      },
    })
  } else {
    partnerId = partners[0].id
  }
  
  // Step 2: Create order in Odoo
  const orderLines = orderData.items.map((item: any) => [
    0,
    0,
    {
      product_id: item.odooId,
      product_uom_qty: item.quantity,
      price_unit: item.unitPrice,
    },
  ])
  
  const odooOrderId = await odooClient.create({
    model: 'sale.order',
    values: {
      partner_id: partnerId,
      order_line: orderLines,
    },
  })
  
  // Step 3: Generate EDI 850 from Odoo order
  const edi850 = await generateEDI850FromOdoo(odooOrderId)
  
  // Step 4: Generate EDI 810 from Odoo order
  const edi810 = await generateEDI810FromOdoo(odooOrderId)
  
  return {
    odooOrderId,
    edi850,
    edi810,
  }
}

/**
 * Update Odoo order with tracking information and generate EDI 856
 * 
 * @param odooOrderId - Odoo sale.order ID
 * @param trackingInfo - Carrier tracking details
 * @returns EDI 856 document
 */
export async function updateOdooWithTrackingAndGenerateEDI856(
  odooOrderId: number,
  trackingInfo: {
    carrier: 'UPS' | 'FEDEX' | 'USPS'
    trackingNumber: string
    serviceLevel: string
  }
): Promise<string> {
  const odooClient = getOdooClient()
  
  // Step 1: Find delivery order for this sale order
  const pickings = await odooClient.searchRead({
    model: 'stock.picking',
    domain: [['origin', '=', `SO${odooOrderId}`]],
    fields: ['id', 'name'],
    limit: 1,
  })
  
  if (pickings.length === 0) {
    throw new Error(`No delivery found for order ${odooOrderId}`)
  }
  
  const pickingId = pickings[0].id
  
  // Step 2: Update tracking in Odoo
  await odooClient.write({
    model: 'stock.picking',
    ids: [pickingId],
    values: {
      carrier_tracking_ref: trackingInfo.trackingNumber,
    },
  })
  
  // Step 3: Generate EDI 856 from updated Odoo data
  return await generateEDI856FromOdoo(
    pickingId,
    trackingInfo.trackingNumber,
    trackingInfo.carrier
  )
}
