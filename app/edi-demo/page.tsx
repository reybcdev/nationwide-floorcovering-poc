'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FileText, Download, Check } from 'lucide-react'

export default function EDIDemoPage() {
  const [loading, setLoading] = useState(false)
  const [orderResult, setOrderResult] = useState<any>(null)
  const [formData, setFormData] = useState({
    customerName: 'John Smith',
    customerEmail: 'john.smith@example.com',
    customerPhone: '555-0123',
    customerAddress: '123 Main Street',
    customerCity: 'New York',
    customerState: 'NY',
    customerZip: '10001',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setOrderResult(null)

    try {
      const response = await fetch('/api/orders/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer: {
            name: formData.customerName,
            email: formData.customerEmail,
            phone: formData.customerPhone,
            address: formData.customerAddress,
            city: formData.customerCity,
            state: formData.customerState,
            zip: formData.customerZip,
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
            {
              odooId: 1,
              sku: 'BOOKING-FEE',
              name: 'Booking Fees',
              quantity: 1,
              unitPrice: 50,
            },
          ],
          total: 818,
        }),
      })

      const data = await response.json()
      setOrderResult(data)
    } catch (error) {
      setOrderResult({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to submit order',
      })
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
        <h1 className="text-4xl font-bold mb-2">EDI Integration Demo</h1>
        <p className="text-muted-foreground">
          Electronic Data Interchange - Generate EDI 850 (Purchase Order) and EDI 810 (Invoice) documents
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Form */}
        <div>
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Place Demo Order</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="customerName">Customer Name</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="customerEmail">Email</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="customerPhone">Phone</Label>
                <Input
                  id="customerPhone"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="customerAddress">Address</Label>
                <Input
                  id="customerAddress"
                  value={formData.customerAddress}
                  onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="customerCity">City</Label>
                  <Input
                    id="customerCity"
                    value={formData.customerCity}
                    onChange={(e) => setFormData({ ...formData, customerCity: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="customerState">State</Label>
                  <Input
                    id="customerState"
                    value={formData.customerState}
                    onChange={(e) => setFormData({ ...formData, customerState: e.target.value })}
                    required
                    maxLength={2}
                  />
                </div>
                <div>
                  <Label htmlFor="customerZip">ZIP</Label>
                  <Input
                    id="customerZip"
                    value={formData.customerZip}
                    onChange={(e) => setFormData({ ...formData, customerZip: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-2">Order Items:</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• VINEYARD - PINOT Hardwood Floor (100 sq ft @ $7.68) = $768.00</li>
                  <li>• Booking Fees (1 @ $50.00) = $50.00</li>
                </ul>
                <p className="font-bold mt-2">Total: $818.00</p>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? 'Processing...' : 'Submit Order & Generate EDI'}
              </Button>
            </form>
          </div>
        </div>

        {/* Results */}
        <div>
          {orderResult && (
            <div className="space-y-6">
              {/* Success Message */}
              {orderResult.success && (
                <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-6">
                  <div className="flex items-start">
                    <Check className="h-6 w-6 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Order Submitted Successfully!</h3>
                      <dl className="space-y-1 text-sm">
                        <div>
                          <dt className="inline font-semibold">Order Number: </dt>
                          <dd className="inline">{orderResult.data.orderNumber}</dd>
                        </div>
                        <div>
                          <dt className="inline font-semibold">Odoo Order ID: </dt>
                          <dd className="inline">{orderResult.data.odooOrderId}</dd>
                        </div>
                        <div>
                          <dt className="inline font-semibold">Customer ID: </dt>
                          <dd className="inline">{orderResult.data.partnerId}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {!orderResult.success && (
                <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-6">
                  <h3 className="font-semibold mb-2">Error</h3>
                  <p>{orderResult.error || orderResult.message}</p>
                </div>
              )}

              {/* EDI Documents */}
              {orderResult.success && orderResult.data.edi && (
                <>
                  {/* EDI 850 */}
                  <div className="bg-card border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-blue-500 mr-2" />
                        <h3 className="font-semibold">EDI 850 - Purchase Order</h3>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadDocument(
                          orderResult.data.edi.edi850X12,
                          `EDI-850-${orderResult.data.orderNumber}.txt`
                        )}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                    <div className="bg-muted p-4 rounded text-xs font-mono overflow-x-auto">
                      <pre>{orderResult.data.edi.edi850X12}</pre>
                    </div>
                  </div>

                  {/* EDI 810 */}
                  <div className="bg-card border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-green-500 mr-2" />
                        <h3 className="font-semibold">EDI 810 - Invoice</h3>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadDocument(
                          orderResult.data.edi.edi810X12,
                          `EDI-810-${orderResult.data.orderNumber}.txt`
                        )}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                    <div className="bg-muted p-4 rounded text-xs font-mono overflow-x-auto">
                      <pre>{orderResult.data.edi.edi810X12}</pre>
                    </div>
                  </div>

                  {/* EDI Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="font-semibold text-blue-900 mb-3">📄 EDI Document Details</h3>
                    <div className="space-y-3 text-blue-800 text-sm">
                      <div>
                        <p className="font-semibold">EDI 850 - Purchase Order</p>
                        <p className="text-xs">Standard transaction set for purchase orders between buyer and seller</p>
                      </div>
                      <div>
                        <p className="font-semibold">EDI 810 - Invoice</p>
                        <p className="text-xs">Standard transaction set for invoicing after order fulfillment</p>
                      </div>
                      <div className="pt-2 border-t border-blue-200">
                        <p className="font-semibold">X12 Format</p>
                        <p className="text-xs">Industry-standard EDI format used for B2B transactions</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Info Card */}
          {!orderResult && (
            <div className="bg-card border rounded-lg p-6">
              <h3 className="font-semibold mb-4">How EDI Integration Works</h3>
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="flex">
                  <span className="font-bold text-primary mr-2">1.</span>
                  <span>Customer places order on e-commerce site</span>
                </li>
                <li className="flex">
                  <span className="font-bold text-primary mr-2">2.</span>
                  <span>Customer info synced to Odoo ERP</span>
                </li>
                <li className="flex">
                  <span className="font-bold text-primary mr-2">3.</span>
                  <span>Sale order created in Odoo</span>
                </li>
                <li className="flex">
                  <span className="font-bold text-primary mr-2">4.</span>
                  <span>EDI 850 (Purchase Order) generated</span>
                </li>
                <li className="flex">
                  <span className="font-bold text-primary mr-2">5.</span>
                  <span>EDI 810 (Invoice) generated</span>
                </li>
                <li className="flex">
                  <span className="font-bold text-primary mr-2">6.</span>
                  <span>Documents ready for B2B transmission</span>
                </li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
