/**
 * Store EDI Documents in Odoo as Attachments
 * This allows you to view/download EDI documents from within Odoo
 */

import { getOdooClient } from './client'

/**
 * Store EDI document as attachment in Odoo
 * 
 * @param ediContent - EDI document content (X12 format)
 * @param fileName - Name of the file (e.g., "EDI-850-12345.txt")
 * @param model - Odoo model (e.g., "sale.order", "stock.picking")
 * @param recordId - ID of the record to attach to
 * @returns Attachment ID in Odoo
 */
export async function storeEDIInOdoo(
  ediContent: string,
  fileName: string,
  model: string,
  recordId: number
): Promise<number> {
  const odooClient = getOdooClient()
  
  // Convert content to base64
  const base64Content = Buffer.from(ediContent).toString('base64')
  
  // Create attachment in Odoo
  const attachmentId = await odooClient.create({
    model: 'ir.attachment',
    values: {
      name: fileName,
      datas: base64Content,
      res_model: model,
      res_id: recordId,
      mimetype: 'text/plain',
      description: 'EDI Document - X12 Format',
    },
  })
  
  return attachmentId
}

/**
 * Store EDI 850 (Purchase Order) in Odoo
 */
export async function storeEDI850InOdoo(
  edi850X12: string,
  orderNumber: string,
  odooOrderId: number
): Promise<number> {
  return await storeEDIInOdoo(
    edi850X12,
    `EDI-850-PO-${orderNumber}.txt`,
    'sale.order',
    odooOrderId
  )
}

/**
 * Store EDI 810 (Invoice) in Odoo
 */
export async function storeEDI810InOdoo(
  edi810X12: string,
  invoiceNumber: string,
  odooInvoiceId: number
): Promise<number> {
  return await storeEDIInOdoo(
    edi810X12,
    `EDI-810-INV-${invoiceNumber}.txt`,
    'account.move',
    odooInvoiceId
  )
}

/**
 * Store EDI 856 (Advance Ship Notice) in Odoo
 */
export async function storeEDI856InOdoo(
  edi856X12: string,
  shipmentId: string,
  odooPickingId: number
): Promise<number> {
  return await storeEDIInOdoo(
    edi856X12,
    `EDI-856-ASN-${shipmentId}.txt`,
    'stock.picking',
    odooPickingId
  )
}

/**
 * Retrieve EDI attachments from Odoo
 * 
 * @param model - Odoo model
 * @param recordId - Record ID
 * @returns Array of EDI attachments
 */
export async function getEDIFromOdoo(
  model: string,
  recordId: number
): Promise<Array<{
  id: number
  name: string
  content: string
  createDate: string
}>> {
  const odooClient = getOdooClient()
  
  // Search for EDI attachments
  const attachments = await odooClient.searchRead({
    model: 'ir.attachment',
    domain: [
      ['res_model', '=', model],
      ['res_id', '=', recordId],
      ['name', 'ilike', 'EDI-'],
    ],
    fields: ['id', 'name', 'datas', 'create_date'],
  })
  
  // Decode base64 content
  return attachments.map((att: any) => ({
    id: att.id,
    name: att.name,
    content: Buffer.from(att.datas, 'base64').toString('utf-8'),
    createDate: att.create_date,
  }))
}

/**
 * Complete workflow: Generate EDI and store in Odoo
 */
export async function generateAndStoreEDI(
  odooOrderId: number,
  edi850X12: string,
  edi810X12: string
): Promise<{
  edi850AttachmentId: number
  edi810AttachmentId: number
}> {
  const odooClient = getOdooClient()
  
  // Get order number
  const orders = await odooClient.searchRead({
    model: 'sale.order',
    domain: [['id', '=', odooOrderId]],
    fields: ['name'],
  })
  
  const orderNumber = orders[0].name
  
  // Store EDI 850
  const edi850AttachmentId = await storeEDI850InOdoo(
    edi850X12,
    orderNumber,
    odooOrderId
  )
  
  // Store EDI 810
  const edi810AttachmentId = await storeEDI810InOdoo(
    edi810X12,
    `INV-${orderNumber}`,
    odooOrderId  // Note: In production, use actual invoice ID
  )
  
  return {
    edi850AttachmentId,
    edi810AttachmentId,
  }
}

/**
 * Add note to Odoo order about EDI transmission
 */
export async function logEDITransmission(
  odooOrderId: number,
  ediType: '850' | '810' | '856',
  status: 'sent' | 'failed',
  details: string
): Promise<void> {
  const odooClient = getOdooClient()
  
  const message = `
EDI ${ediType} Transmission: ${status.toUpperCase()}
Time: ${new Date().toISOString()}
${details}
  `.trim()
  
  await odooClient.create({
    model: 'mail.message',
    values: {
      body: message,
      model: 'sale.order',
      res_id: odooOrderId,
      message_type: 'notification',
      subtype_id: 2,  // Note subtype
    },
  })
}
