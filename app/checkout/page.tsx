'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { convertCartToEDIOrder, syncOrderToOdoo } from '@/lib/odoo/sync-helper'
import { formatPrice } from '@/lib/utils'
import { CheckCircle, Database, Loader2, AlertCircle } from 'lucide-react'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotalPrice, clearCart } = useCartStore()
  const [submitting, setSubmitting] = useState(false)
  const [orderSynced, setOrderSynced] = useState(false)
  const [odooOrderId, setOdooOrderId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [syncToOdoo, setSyncToOdoo] = useState(true)

  const subtotal = getTotalPrice()
  const tax = subtotal * 0.0875 // 8.75% tax
  const shipping = subtotal > 500 ? 0 : 75
  const total = subtotal + tax + shipping

  const [formData, setFormData] = useState({
    name: 'John Demo Customer',
    email: 'demo@example.com',
    phone: '+1 555-0100',
    street: '123 Demo Street',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    country: 'USA',
  })

  useEffect(() => {
    if (items.length === 0 && !orderSynced) {
      router.push('/cart')
    }
  }, [items, orderSynced, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      // Simulate checkout process
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Sync to Odoo if enabled
      if (syncToOdoo) {
        const ediOrder = convertCartToEDIOrder(items, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          shippingAddress: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            zip: formData.zip,
            country: formData.country,
          },
        })

        const syncResult = await syncOrderToOdoo(ediOrder)

        if (syncResult.success) {
          setOdooOrderId(syncResult.odooOrderId || null)
          setOrderSynced(true)
        } else {
          setError(
            `Order placed but failed to sync with Odoo: ${syncResult.error}`
          )
        }
      }

      // Clear cart
      clearCart()
      setOrderSynced(true)
    } catch (err) {
      setError('An error occurred during checkout. Please try again.')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (orderSynced) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="py-16 text-center">
            <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
            <h2 className="text-3xl font-bold mb-2">Order Placed Successfully!</h2>
            <p className="text-muted-foreground mb-6">
              Thank you for your order. A confirmation email has been sent to{' '}
              {formData.email}
            </p>

            {odooOrderId && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Database className="w-5 h-5 text-purple-600" />
                  <span className="font-semibold text-purple-900">
                    Odoo ERP Integration
                  </span>
                </div>
                <p className="text-sm text-purple-700">
                  Order successfully synchronized with Odoo ERP
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  Odoo Order ID: <span className="font-mono">#{odooOrderId}</span>
                </p>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <Button onClick={() => router.push('/products')}>
                Continue Shopping
              </Button>
              <Button variant="outline" onClick={() => router.push('/admin/odoo')}>
                <Database className="w-4 h-4 mr-2" />
                View in Odoo Admin
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Checkout</h1>
        <p className="text-muted-foreground">Complete your order</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Customer Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="street">Street Address *</Label>
                  <Input
                    id="street"
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="zip">ZIP Code *</Label>
                    <Input
                      id="zip"
                      name="zip"
                      value={formData.zip}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Odoo Integration Option */}
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="syncOdoo"
                    checked={syncToOdoo}
                    onCheckedChange={(checked: boolean) => setSyncToOdoo(checked)}
                  />
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-purple-600" />
                    <Label htmlFor="syncOdoo" className="font-medium cursor-pointer">
                      Sync order to Odoo ERP (Demo Feature)
                    </Label>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2 ml-8">
                  This will automatically create a sales order in Odoo ERP system via EDI integration
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 border-b pb-4">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.product.name} ({item.sqFeet} sq ft)
                      </span>
                      <span className="font-medium">
                        {formatPrice(item.product.pricePerSqFt * item.sqFeet)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">
                      {shipping === 0 ? 'Free' : formatPrice(shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (8.75%)</span>
                    <span className="font-medium">{formatPrice(tax)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span className="font-bold">Total</span>
                    <span className="text-xl font-bold">{formatPrice(total)}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Place Order'
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  By placing this order, you agree to our terms and conditions
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
