/**
 * EDI Shipping Service
 * Handles EDI 856 (Advance Ship Notice) generation and carrier integration
 * 
 * Complete EDI Workflow:
 * 1. EDI 850 - Purchase Order (Buyer → Seller)
 * 2. EDI 810 - Invoice (Seller → Buyer)
 * 3. EDI 856 - Advance Ship Notice (Seller → Buyer) ← THIS FILE
 * 4. EDI 997 - Functional Acknowledgment (optional)
 */

export interface EDI856LineItem {
  lineNumber: number
  sku: string
  quantity: number
  quantityShipped: number
  unitOfMeasure: string
  productDescription: string
  packageNumber?: string
}

export interface EDI856Package {
  packageNumber: string
  trackingNumber: string
  weight: number
  weightUnit: 'LB' | 'KG'
  dimensions: {
    length: number
    width: number
    height: number
    unit: 'IN' | 'CM'
  }
  carrier: 'UPS' | 'FEDEX' | 'USPS'
  serviceLevel: string
}

export interface EDI856Document {
  transactionSet: '856'
  shipmentId: string
  purchaseOrderNumber: string
  invoiceNumber: string
  shipDate: string
  estimatedDeliveryDate: string
  carrier: {
    scac: string // Standard Carrier Alpha Code
    name: string
    trackingNumber: string
  }
  shipFrom: {
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
  packages: EDI856Package[]
  lineItems: EDI856LineItem[]
  totalWeight: number
  totalPackages: number
}

/**
 * Carrier SCAC codes (Standard Carrier Alpha Code)
 */
export const CARRIER_SCAC = {
  UPS: 'UPGF',
  FEDEX: 'FDEG',
  USPS: 'USPS',
  DHL: 'DHLE',
} as const

/**
 * Generate EDI 856 (Advance Ship Notice)
 * Sent when order is shipped to notify buyer
 */
export function generateEDI856(shipmentData: {
  shipmentId: string
  purchaseOrderNumber: string
  invoiceNumber: string
  shipDate: string
  carrier: 'UPS' | 'FEDEX' | 'USPS'
  trackingNumber: string
  serviceLevel: string
  shipFrom: {
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
  packages: Array<{
    packageNumber: string
    trackingNumber: string
    weight: number
    dimensions: { length: number; width: number; height: number }
  }>
  items: Array<{
    sku: string
    name: string
    quantity: number
    packageNumber?: string
  }>
}): EDI856Document {
  const carrierScac = CARRIER_SCAC[shipmentData.carrier]
  
  // Calculate estimated delivery (5-7 business days)
  const estimatedDelivery = new Date(shipmentData.shipDate)
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 6)

  const packages: EDI856Package[] = shipmentData.packages.map((pkg, index) => ({
    packageNumber: pkg.packageNumber || `PKG-${index + 1}`,
    trackingNumber: pkg.trackingNumber,
    weight: pkg.weight,
    weightUnit: 'LB',
    dimensions: {
      length: pkg.dimensions.length,
      width: pkg.dimensions.width,
      height: pkg.dimensions.height,
      unit: 'IN',
    },
    carrier: shipmentData.carrier,
    serviceLevel: shipmentData.serviceLevel,
  }))

  const lineItems: EDI856LineItem[] = shipmentData.items.map((item, index) => ({
    lineNumber: index + 1,
    sku: item.sku,
    quantity: item.quantity,
    quantityShipped: item.quantity,
    unitOfMeasure: 'EA',
    productDescription: item.name,
    packageNumber: item.packageNumber || packages[0]?.packageNumber,
  }))

  const totalWeight = packages.reduce((sum, pkg) => sum + pkg.weight, 0)

  return {
    transactionSet: '856',
    shipmentId: shipmentData.shipmentId,
    purchaseOrderNumber: shipmentData.purchaseOrderNumber,
    invoiceNumber: shipmentData.invoiceNumber,
    shipDate: shipmentData.shipDate,
    estimatedDeliveryDate: estimatedDelivery.toISOString().split('T')[0],
    carrier: {
      scac: carrierScac,
      name: shipmentData.carrier,
      trackingNumber: shipmentData.trackingNumber,
    },
    shipFrom: shipmentData.shipFrom,
    shipTo: shipmentData.shipTo,
    packages,
    lineItems,
    totalWeight,
    totalPackages: packages.length,
  }
}

/**
 * Convert EDI 856 to X12 format
 */
export function edi856ToX12(edi: EDI856Document): string {
  const segments: string[] = []
  
  // ISA - Interchange Control Header
  segments.push('ISA*00*          *00*          *ZZ*SENDER         *ZZ*RECEIVER       *' + 
    new Date().toISOString().slice(0,10).replace(/-/g, '').slice(2) + '*' +
    new Date().toTimeString().slice(0,5).replace(/:/g, '') + '*U*00401*000000001*0*P*>~')
  
  // GS - Functional Group Header
  segments.push('GS*SH*SENDER*RECEIVER*' + 
    new Date().toISOString().slice(0,10).replace(/-/g, '') + '*' +
    new Date().toTimeString().slice(0,5).replace(/:/g, '') + '*1*X*004010~')
  
  // ST - Transaction Set Header (856)
  segments.push('ST*856*0001~')
  
  // BSN - Beginning Segment for Ship Notice
  segments.push(`BSN*00*${edi.shipmentId}*${edi.shipDate.replace(/-/g, '')}*${new Date().toTimeString().slice(0,5).replace(/:/g, '')}~`)
  
  // DTM - Date/Time Reference (Ship Date)
  segments.push(`DTM*011*${edi.shipDate.replace(/-/g, '')}~`)
  
  // DTM - Date/Time Reference (Delivery Date)
  segments.push(`DTM*017*${edi.estimatedDeliveryDate.replace(/-/g, '')}~`)
  
  // HL - Hierarchical Level (Shipment)
  segments.push('HL*1**S~')
  
  // TD5 - Carrier Details
  segments.push(`TD5*****${edi.carrier.scac}~`)
  
  // REF - Reference Identification (Tracking Number)
  segments.push(`REF*CN*${edi.carrier.trackingNumber}~`)
  
  // N1 - Name - Ship From
  segments.push(`N1*SF*${edi.shipFrom.name}~`)
  segments.push(`N3*${edi.shipFrom.address}~`)
  segments.push(`N4*${edi.shipFrom.city}*${edi.shipFrom.state}*${edi.shipFrom.zip}~`)
  
  // N1 - Name - Ship To
  segments.push(`N1*ST*${edi.shipTo.name}~`)
  segments.push(`N3*${edi.shipTo.address}~`)
  segments.push(`N4*${edi.shipTo.city}*${edi.shipTo.state}*${edi.shipTo.zip}~`)
  
  // Packages
  edi.packages.forEach((pkg, index) => {
    // HL - Hierarchical Level (Package)
    segments.push(`HL*${index + 2}*1*P~`)
    
    // MAN - Marks and Numbers (Tracking)
    segments.push(`MAN*GM*${pkg.trackingNumber}~`)
    
    // TD1 - Package Dimensions
    segments.push(`TD1*CTN*1*${pkg.weight}*${pkg.weightUnit}~`)
    segments.push(`TD3***L*${pkg.dimensions.length}*W*${pkg.dimensions.width}*H*${pkg.dimensions.height}*${pkg.dimensions.unit}~`)
  })
  
  // Line Items
  edi.lineItems.forEach((item, index) => {
    // HL - Hierarchical Level (Item)
    segments.push(`HL*${edi.packages.length + index + 2}*${index + 2}*I~`)
    
    // LIN - Item Identification
    segments.push(`LIN*${item.lineNumber}*BP*${item.sku}~`)
    
    // SN1 - Item Detail (Shipment)
    segments.push(`SN1**${item.quantityShipped}*${item.unitOfMeasure}~`)
    
    // PID - Product/Item Description
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
 * Generate EDI 997 (Functional Acknowledgment)
 * Confirms receipt of EDI documents
 */
export function generateEDI997(acknowledgmentData: {
  transactionSetId: string
  status: 'accepted' | 'rejected'
  errors?: string[]
}): string {
  const segments: string[] = []
  
  // ISA
  segments.push('ISA*00*          *00*          *ZZ*RECEIVER       *ZZ*SENDER         *' + 
    new Date().toISOString().slice(0,10).replace(/-/g, '').slice(2) + '*' +
    new Date().toTimeString().slice(0,5).replace(/:/g, '') + '*U*00401*000000001*0*P*>~')
  
  // GS
  segments.push('GS*FA*RECEIVER*SENDER*' + 
    new Date().toISOString().slice(0,10).replace(/-/g, '') + '*' +
    new Date().toTimeString().slice(0,5).replace(/:/g, '') + '*1*X*004010~')
  
  // ST - Transaction Set Header (997)
  segments.push('ST*997*0001~')
  
  // AK1 - Functional Group Response Header
  segments.push('AK1*PO*1~')
  
  // AK2 - Transaction Set Response Header
  segments.push(`AK2*850*${acknowledgmentData.transactionSetId}~`)
  
  // AK5 - Transaction Set Response Trailer
  const statusCode = acknowledgmentData.status === 'accepted' ? 'A' : 'R'
  segments.push(`AK5*${statusCode}~`)
  
  // AK9 - Functional Group Response Trailer
  segments.push('AK9*A*1*1*1~')
  
  // SE
  segments.push(`SE*${segments.length + 1}*0001~`)
  
  // GE
  segments.push('GE*1*1~')
  
  // IEA
  segments.push('IEA*1*000000001~')
  
  return segments.join('\n')
}
