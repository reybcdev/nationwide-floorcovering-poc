'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FileText, Download, Copy, Check } from 'lucide-react'
import { generateEDI856, edi856ToX12, generateEDI997 } from '@/lib/odoo/edi-shipping'

export default function EDIDocumentsPage() {
  const [activeTab, setActiveTab] = useState<'850' | '810' | '856' | '997'>('856')
  const [copied, setCopied] = useState(false)

  // Sample EDI 850 (Purchase Order)
  const edi850Sample = `ISA*00*          *00*          *ZZ*SENDER         *ZZ*RECEIVER       *241119*1430*U*00401*000000001*0*P*>~
GS*PO*SENDER*RECEIVER*20241119*1430*1*X*004010~
ST*850*0001~
BEG*00*NE*WEB-1234567890*20241119~
REF*DP*DEPT-001~
PER*BD*John Doe*TE*555-0123~
N1*ST*John Smith~
N3*456 Oak Avenue~
N4*Los Angeles*CA*90001~
PO1*1*100*EA*7.68**VP*VINEYARD-PINOT*IN*VINEYARD - PINOT Hardwood Floor~
CTT*1*100~
SE*11*0001~
GE*1*1~
IEA*1*000000001~`

  // Sample EDI 810 (Invoice)
  const edi810Sample = `ISA*00*          *00*          *ZZ*SENDER         *ZZ*RECEIVER       *241119*1430*U*00401*000000002*0*P*>~
GS*IN*SENDER*RECEIVER*20241119*1430*2*X*004010~
ST*810*0001~
BIG*20241119*INV-1234567890*20241119*WEB-1234567890~
REF*DP*DEPT-001~
N1*ST*John Smith~
N3*456 Oak Avenue~
N4*Los Angeles*CA*90001~
IT1*1*100*EA*7.68**VP*VINEYARD-PINOT*IN*VINEYARD - PINOT Hardwood Floor~
TDS*76800~
CAD*A**********02~
CTT*1*100~
SE*11*0001~
GE*1*2~
IEA*1*000000002~`

  // Generate EDI 856 (Advance Ship Notice)
  const edi856Data = generateEDI856({
    shipmentId: 'SHP-TEST-001',
    purchaseOrderNumber: 'WEB-1234567890',
    invoiceNumber: 'INV-1234567890',
    shipDate: '2024-11-19',
    carrier: 'FEDEX',
    trackingNumber: '7ABC123456789',
    serviceLevel: 'FedEx Ground',
    shipFrom: {
      name: 'Nationwide Floorcovering',
      address: '123 Flooring Street',
      city: 'New York',
      state: 'NY',
      zip: '10001',
    },
    shipTo: {
      name: 'John Smith',
      address: '456 Oak Avenue',
      city: 'Los Angeles',
      state: 'CA',
      zip: '90001',
    },
    packages: [
      {
        packageNumber: 'PKG-001',
        trackingNumber: '7ABC123456789',
        weight: 120,
        dimensions: { length: 48, width: 12, height: 6 },
      },
    ],
    items: [
      {
        sku: 'VINEYARD-PINOT',
        name: 'VINEYARD - PINOT Hardwood Floor',
        quantity: 100,
      },
    ],
  })
  const edi856Sample = edi856ToX12(edi856Data)

  // Generate EDI 997 (Functional Acknowledgment)
  // generateEDI997 already returns X12 format string
  const edi997Sample = generateEDI997({
    transactionSetId: '0001',
    status: 'accepted',
  })

  const documents = {
    '850': {
      title: 'EDI 850 - Purchase Order',
      description: 'Sent from buyer to seller to initiate purchase',
      content: edi850Sample,
      color: 'blue',
      icon: '📝',
    },
    '810': {
      title: 'EDI 810 - Invoice',
      description: 'Sent from seller to buyer requesting payment',
      content: edi810Sample,
      color: 'green',
      icon: '💰',
    },
    '856': {
      title: 'EDI 856 - Advance Ship Notice (ASN)',
      description: 'Sent when shipment is created, includes tracking info',
      content: edi856Sample,
      color: 'purple',
      icon: '📦',
    },
    '997': {
      title: 'EDI 997 - Functional Acknowledgment',
      description: 'Confirms receipt and acceptance of EDI document',
      content: edi997Sample,
      color: 'orange',
      icon: '✅',
    },
  }

  const activeDoc = documents[activeTab]

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(activeDoc.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadDocument = () => {
    const blob = new Blob([activeDoc.content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `EDI-${activeTab}-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">EDI Documents Reference</h1>
        <p className="text-muted-foreground">
          View all EDI transaction sets including EDI 856 (Ship Notice) and EDI 997 (Acknowledgment)
        </p>
      </div>

      {/* Document Tabs */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(documents).map(([key, doc]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                activeTab === key
                  ? `border-${doc.color}-500 bg-${doc.color}-50`
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">{doc.icon}</div>
              <div className="font-semibold text-sm">EDI {key}</div>
              <div className="text-xs text-muted-foreground line-clamp-2">
                {doc.description.split(',')[0]}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Active Document */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-card border rounded-lg overflow-hidden">
          {/* Header */}
          <div className={`bg-${activeDoc.color}-50 border-b px-6 py-4`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{activeDoc.icon}</span>
                  <h2 className="text-2xl font-bold">{activeDoc.title}</h2>
                </div>
                <p className="text-muted-foreground">{activeDoc.description}</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={copyToClipboard} variant="outline" size="sm">
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
                <Button onClick={downloadDocument} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="bg-slate-950 text-green-400 p-6 rounded-lg font-mono text-xs overflow-x-auto">
              <pre className="whitespace-pre">{activeDoc.content}</pre>
            </div>
          </div>

          {/* Info Panel */}
          <div className={`bg-${activeDoc.color}-50 border-t px-6 py-4`}>
            <h3 className="font-semibold mb-3">EDI {activeTab} Details</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold mb-2">When is it used?</p>
                <ul className="space-y-1 text-muted-foreground">
                  {activeTab === '850' && (
                    <>
                      <li>• Customer places an order</li>
                      <li>• Sent from buyer to seller</li>
                      <li>• Initiates the purchase process</li>
                    </>
                  )}
                  {activeTab === '810' && (
                    <>
                      <li>• Order is confirmed</li>
                      <li>• Sent from seller to buyer</li>
                      <li>• Requests payment</li>
                    </>
                  )}
                  {activeTab === '856' && (
                    <>
                      <li>• Package ships to customer</li>
                      <li>• Sent to carrier and/or buyer</li>
                      <li>• Includes tracking information</li>
                    </>
                  )}
                  {activeTab === '997' && (
                    <>
                      <li>• After receiving any EDI</li>
                      <li>• Sent back to EDI sender</li>
                      <li>• Confirms receipt and status</li>
                    </>
                  )}
                </ul>
              </div>
              <div>
                <p className="font-semibold mb-2">Key Information</p>
                <ul className="space-y-1 text-muted-foreground">
                  {activeTab === '850' && (
                    <>
                      <li>• Purchase order number</li>
                      <li>• Items, quantities, prices</li>
                      <li>• Shipping address</li>
                    </>
                  )}
                  {activeTab === '810' && (
                    <>
                      <li>• Invoice number</li>
                      <li>• Line item details</li>
                      <li>• Payment terms and total</li>
                    </>
                  )}
                  {activeTab === '856' && (
                    <>
                      <li>• Tracking number</li>
                      <li>• Carrier and service level</li>
                      <li>• Package contents and weight</li>
                    </>
                  )}
                  {activeTab === '997' && (
                    <>
                      <li>• Original transaction ID</li>
                      <li>• Acceptance/rejection status</li>
                      <li>• Error codes (if any)</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How to Generate */}
      <div className="max-w-6xl mx-auto mt-8">
        <div className="bg-card border rounded-lg p-6">
          <h3 className="font-semibold mb-4">How to Generate These Documents</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-blue-500" />
                <h4 className="font-semibold">EDI 850 & 810</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Generated automatically when order is submitted
              </p>
              <div className="space-y-1 text-sm">
                <p>• Visit: <code className="bg-muted px-2 py-0.5 rounded">/edi-demo</code></p>
                <p>• Or: <code className="bg-muted px-2 py-0.5 rounded">/shipping-workflow</code></p>
                <p>• Submit order to generate both documents</p>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-purple-500" />
                <h4 className="font-semibold">EDI 856 & 997</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Generated during shipping process
              </p>
              <div className="space-y-1 text-sm">
                <p>• Visit: <code className="bg-muted px-2 py-0.5 rounded">/shipping-workflow</code></p>
                <p>• Complete all steps to Step 4</p>
                <p>• EDI 856 generated with tracking info</p>
                <p>• EDI 997 generated on receipt confirmation</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* API Reference */}
      <div className="max-w-6xl mx-auto mt-6">
        <div className="bg-card border rounded-lg p-6">
          <h3 className="font-semibold mb-4">API Endpoints</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <code className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono">POST</code>
              <div className="flex-1">
                <code className="bg-muted px-2 py-1 rounded">/api/orders/submit</code>
                <p className="text-muted-foreground mt-1">Generates EDI 850 & 810</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <code className="bg-purple-100 text-purple-800 px-2 py-1 rounded font-mono">POST</code>
              <div className="flex-1">
                <code className="bg-muted px-2 py-1 rounded">/api/shipping/notify</code>
                <p className="text-muted-foreground mt-1">Generates EDI 856 (Advance Ship Notice)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
