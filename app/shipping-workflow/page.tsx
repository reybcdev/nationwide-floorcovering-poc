'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Package, Truck, FileText, Download, CheckCircle, ArrowRight } from 'lucide-react'

export default function ShippingWorkflowPage() {
  const [step, setStep] = useState(1)
  const [orderResult, setOrderResult] = useState<any>(null)
  const [shippingRates, setShippingRates] = useState<any[]>([])
  const [selectedRate, setSelectedRate] = useState<any>(null)
  const [shippingLabel, setShippingLabel] = useState<any>(null)
  const [edi856, setEdi856] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // Step 1: Submit Order (EDI 850 & 810)
  const submitOrder = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/orders/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            name: 'John Smith',
            email: 'john.smith@example.com',
            phone: '555-0123',
            address: '456 Oak Avenue',
            city: 'Los Angeles',
            state: 'CA',
            zip: '90001',
            country: 'US',
          },
          items: [
            {
              odooId: 3,
              sku: 'VINEYARD-PINOT',
              name: 'VINEYARD - PINOT Hardwood Floor',
              quantity: 100,
              unitPrice: 7.68,
            },
          ],
          total: 768.00,
        }),
      })
      const data = await response.json()
      setOrderResult(data)
      if (data.success) setStep(2)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Get Shipping Rates
  const getShippingRates = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/shipping/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: {
            name: 'Nationwide Floorcovering',
            address1: '123 Flooring Street',
            city: 'New York',
            state: 'NY',
            zip: '10001',
            country: 'US',
          },
          to: {
            name: 'John Smith',
            address1: '456 Oak Avenue',
            city: 'Los Angeles',
            state: 'CA',
            zip: '90001',
            country: 'US',
          },
          packages: [
            { weight: 120, length: 48, width: 12, height: 6 },
          ],
        }),
      })
      const data = await response.json()
      setShippingRates(data.data.rates)
      setStep(3)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Create Shipping Label
  const createLabel = async (rate: any) => {
    setLoading(true)
    setSelectedRate(rate)
    try {
      const response = await fetch('/api/shipping/label', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: {
            name: 'Nationwide Floorcovering',
            address1: '123 Flooring Street',
            city: 'New York',
            state: 'NY',
            zip: '10001',
            country: 'US',
          },
          to: {
            name: 'John Smith',
            address1: '456 Oak Avenue',
            city: 'Los Angeles',
            state: 'CA',
            zip: '90001',
            country: 'US',
          },
          packages: [
            { weight: 120, length: 48, width: 12, height: 6 },
          ],
          carrier: rate.carrier,
          service: rate.service,
        }),
      })
      const data = await response.json()
      setShippingLabel(data.data.label)
      setStep(4)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // Step 4: Generate EDI 856 and Send
  const generateShipNotice = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/shipping/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shipmentId: `SHP-${Date.now()}`,
          purchaseOrderNumber: orderResult?.data?.orderNumber,
          invoiceNumber: `INV-${orderResult?.data?.orderNumber}`,
          carrier: shippingLabel?.carrier,
          trackingNumber: shippingLabel?.trackingNumber,
          serviceLevel: selectedRate?.service,
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
              trackingNumber: shippingLabel?.trackingNumber,
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
        }),
      })
      const data = await response.json()
      setEdi856(data.data)
      setStep(5)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const downloadDocument = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Complete EDI Shipping Workflow</h1>
        <p className="text-muted-foreground">
          End-to-end demonstration: Order → Shipping → EDI Transmission
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          {[
            { num: 1, label: 'Order', icon: FileText },
            { num: 2, label: 'Rates', icon: Package },
            { num: 3, label: 'Label', icon: Truck },
            { num: 4, label: 'EDI 856', icon: FileText },
            { num: 5, label: 'Complete', icon: CheckCircle },
          ].map((s, idx) => (
            <div key={s.num} className="flex items-center">
              <div className={`flex flex-col items-center ${step >= s.num ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                  step >= s.num ? 'border-primary bg-primary text-white' : 'border-muted-foreground'
                }`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <span className="text-xs mt-2">{s.label}</span>
              </div>
              {idx < 4 && (
                <ArrowRight className={`mx-4 h-5 w-5 ${step > s.num ? 'text-primary' : 'text-muted-foreground'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Submit Order */}
      {step === 1 && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Step 1: Submit Order</h2>
            <p className="text-muted-foreground mb-6">
              Create order in Odoo and generate EDI 850 (Purchase Order) & EDI 810 (Invoice)
            </p>
            <div className="bg-muted p-4 rounded mb-4">
              <h3 className="font-semibold mb-2">Demo Order Details:</h3>
              <ul className="text-sm space-y-1">
                <li>• Customer: John Smith, Los Angeles, CA</li>
                <li>• Product: VINEYARD - PINOT Hardwood Floor</li>
                <li>• Quantity: 100 sq ft @ $7.68</li>
                <li>• Total: $768.00</li>
              </ul>
            </div>
            <Button onClick={submitOrder} disabled={loading} size="lg" className="w-full">
              {loading ? 'Processing...' : 'Submit Order & Generate EDI 850/810'}
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Get Shipping Rates */}
      {step === 2 && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Step 2: Get Shipping Rates</h2>
            <p className="text-muted-foreground mb-6">
              Compare rates from multiple carriers (UPS, FedEx, USPS)
            </p>
            {orderResult && (
              <div className="bg-green-50 border border-green-200 p-4 rounded mb-4">
                <p className="text-green-800 font-semibold">✓ Order Created Successfully</p>
                <p className="text-sm text-green-700">Order: {orderResult.data.orderNumber}</p>
                <p className="text-sm text-green-700">Odoo ID: {orderResult.data.odooOrderId}</p>
              </div>
            )}
            <Button onClick={getShippingRates} disabled={loading} size="lg" className="w-full">
              {loading ? 'Fetching Rates...' : 'Get Shipping Rates'}
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Select Shipping Rate */}
      {step === 3 && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Step 3: Select Carrier & Create Label</h2>
            <p className="text-muted-foreground mb-6">
              Choose shipping method and generate shipping label
            </p>
            <div className="space-y-3">
              {shippingRates.map((rate, idx) => (
                <div
                  key={idx}
                  className="border rounded-lg p-4 hover:bg-muted cursor-pointer flex justify-between items-center"
                  onClick={() => createLabel(rate)}
                >
                  <div>
                    <p className="font-semibold">{rate.carrier} - {rate.service}</p>
                    <p className="text-sm text-muted-foreground">
                      Delivers in {rate.deliveryDays} days ({rate.deliveryDate})
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">${rate.cost.toFixed(2)}</p>
                    <Button size="sm" disabled={loading}>
                      {loading && selectedRate === rate ? 'Creating...' : 'Select'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Generate EDI 856 */}
      {step === 4 && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Step 4: Generate Advance Ship Notice</h2>
            <p className="text-muted-foreground mb-6">
              Create EDI 856 (ASN) and send to carrier/trading partner
            </p>
            {shippingLabel && (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded mb-4">
                <p className="text-blue-800 font-semibold">✓ Shipping Label Created</p>
                <p className="text-sm text-blue-700">Carrier: {shippingLabel.carrier}</p>
                <p className="text-sm text-blue-700">Tracking: {shippingLabel.trackingNumber}</p>
                <p className="text-sm text-blue-700">Cost: ${shippingLabel.cost}</p>
              </div>
            )}
            <Button onClick={generateShipNotice} disabled={loading} size="lg" className="w-full">
              {loading ? 'Generating EDI 856...' : 'Generate EDI 856 & Send to Carrier'}
            </Button>
          </div>
        </div>
      )}

      {/* Step 5: Complete */}
      {step === 5 && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-green-800 mb-2">Workflow Complete!</h2>
            <p className="text-green-700">
              All EDI documents generated and shipment processed
            </p>
          </div>

          {/* EDI 856 Document */}
          {edi856 && (
            <div className="bg-card border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-purple-500 mr-2" />
                  <h3 className="font-semibold">EDI 856 - Advance Ship Notice</h3>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => downloadDocument(edi856.edi856X12, `EDI-856-${edi856.edi856.shipmentId}.txt`)}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
              <div className="bg-muted p-4 rounded text-xs font-mono overflow-x-auto max-h-64">
                <pre>{edi856.edi856X12}</pre>
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="bg-card border rounded-lg p-6">
            <h3 className="font-semibold mb-4">Complete EDI Workflow Summary</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <div>
                  <p className="font-semibold">Step 1: Order Placed</p>
                  <p className="text-sm text-muted-foreground">
                    ✓ EDI 850 (Purchase Order) generated<br />
                    ✓ EDI 810 (Invoice) generated<br />
                    ✓ Order created in Odoo (ID: {orderResult?.data?.odooOrderId})
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <div>
                  <p className="font-semibold">Step 2: Shipping Arranged</p>
                  <p className="text-sm text-muted-foreground">
                    ✓ Carrier: {shippingLabel?.carrier}<br />
                    ✓ Service: {selectedRate?.service}<br />
                    ✓ Tracking: {shippingLabel?.trackingNumber}
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <div>
                  <p className="font-semibold">Step 3: Ship Notice Sent</p>
                  <p className="text-sm text-muted-foreground">
                    ✓ EDI 856 (Advance Ship Notice) generated<br />
                    ✓ Sent to carrier/trading partner<br />
                    ✓ Customer notified of shipment
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button 
              onClick={() => window.location.href = `/tracking?trackingNumber=${shippingLabel?.trackingNumber}&carrier=${shippingLabel?.carrier}`}
              size="lg"
              className="flex-1"
            >
              Track This Shipment
            </Button>
            <Button onClick={() => window.location.reload()} variant="outline" size="lg" className="flex-1">
              Start New Workflow
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
