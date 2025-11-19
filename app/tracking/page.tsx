'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Package, Search, MapPin, CheckCircle, Clock, Truck, AlertCircle } from 'lucide-react'

export default function TrackingPage() {
  const searchParams = useSearchParams()
  const [trackingNumber, setTrackingNumber] = useState('')
  const [carrier, setCarrier] = useState<'UPS' | 'FEDEX' | 'USPS'>('FEDEX')
  const [trackingInfo, setTrackingInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Auto-load tracking from URL params
  useEffect(() => {
    const urlTrackingNumber = searchParams.get('trackingNumber')
    const urlCarrier = searchParams.get('carrier') as 'UPS' | 'FEDEX' | 'USPS' | null
    
    if (urlTrackingNumber && urlCarrier) {
      setTrackingNumber(urlTrackingNumber)
      setCarrier(urlCarrier)
      // Auto-track after a brief delay
      setTimeout(() => {
        trackPackage(urlTrackingNumber, urlCarrier)
      }, 500)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  // Demo tracking numbers
  const demoTrackingNumbers = {
    UPS: '1Z999AA10123456784',
    FEDEX: '7ABC123456789',
    USPS: '9400111111111111111111',
  }

  const trackPackage = async (trackNum?: string, carr?: 'UPS' | 'FEDEX' | 'USPS') => {
    const numToTrack = trackNum || trackingNumber
    const carrierToUse = carr || carrier

    if (!numToTrack) {
      setError('Please enter a tracking number')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/shipping/track?trackingNumber=${numToTrack}&carrier=${carrierToUse}`
      )
      const data = await response.json()

      if (data.success) {
        setTrackingInfo(data.data.tracking)
      } else {
        setError(data.error || 'Failed to track package')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to track package')
    } finally {
      setLoading(false)
    }
  }

  const useDemoTracking = () => {
    setTrackingNumber(demoTrackingNumbers[carrier])
    setTimeout(() => {
      trackPackage()
    }, 100)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-6 w-6 text-green-500" />
      case 'in_transit':
        return <Truck className="h-6 w-6 text-blue-500" />
      case 'out_for_delivery':
        return <Package className="h-6 w-6 text-orange-500" />
      case 'exception':
        return <AlertCircle className="h-6 w-6 text-red-500" />
      default:
        return <Clock className="h-6 w-6 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'in_transit':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'out_for_delivery':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'exception':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Package Tracking</h1>
        <p className="text-muted-foreground">
          Track your shipment in real-time with live status updates
        </p>
      </div>

      {/* Tracking Form */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="bg-card border rounded-lg p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="carrier">Select Carrier</Label>
              <div className="flex gap-2 mt-2">
                {(['UPS', 'FEDEX', 'USPS'] as const).map((c) => (
                  <Button
                    key={c}
                    variant={carrier === c ? 'default' : 'outline'}
                    onClick={() => setCarrier(c)}
                    className="flex-1"
                  >
                    {c}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="trackingNumber">Tracking Number</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="trackingNumber"
                  placeholder="Enter tracking number"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && trackPackage()}
                />
                <Button onClick={() => trackPackage()} disabled={loading}>
                  <Search className="h-4 w-4 mr-2" />
                  {loading ? 'Tracking...' : 'Track'}
                </Button>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">
                Don't have a tracking number? Try a demo:
              </p>
              <Button onClick={useDemoTracking} variant="outline" size="sm">
                <Package className="h-4 w-4 mr-2" />
                Use Demo Tracking for {carrier}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
            <p className="font-semibold">Error</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Tracking Results */}
      {trackingInfo && (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Status Card */}
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                {getStatusIcon(trackingInfo.status)}
                <div>
                  <h2 className="text-2xl font-bold capitalize">
                    {trackingInfo.statusDescription}
                  </h2>
                  <p className="text-muted-foreground">
                    Tracking Number: {trackingInfo.trackingNumber}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Carrier: {trackingInfo.carrier}
                  </p>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-full border ${getStatusColor(trackingInfo.status)}`}>
                <span className="font-semibold capitalize">{trackingInfo.status.replace('_', ' ')}</span>
              </div>
            </div>

            {trackingInfo.location && (
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <MapPin className="h-4 w-4" />
                <span>{trackingInfo.location}</span>
              </div>
            )}

            {trackingInfo.estimatedDelivery && (
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Estimated Delivery</p>
                    <p className="text-lg font-semibold">
                      {new Date(trackingInfo.estimatedDelivery).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  {trackingInfo.actualDelivery && (
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Actual Delivery</p>
                      <p className="text-lg font-semibold text-green-600">
                        {new Date(trackingInfo.actualDelivery).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="bg-card border rounded-lg p-6">
            <h3 className="text-xl font-bold mb-6">Tracking History</h3>
            <div className="space-y-6">
              {trackingInfo.events.map((event: any, index: number) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${
                      index === 0 ? 'bg-blue-500' : 'bg-gray-300'
                    }`} />
                    {index < trackingInfo.events.length - 1 && (
                      <div className="w-0.5 flex-1 bg-gray-300 my-1" style={{ minHeight: '40px' }} />
                    )}
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-semibold">{event.description}</p>
                      <p className="text-sm text-muted-foreground whitespace-nowrap ml-4">
                        {event.time}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{event.location}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(event.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-3">📦 Real-Time Tracking Features</h3>
            <ul className="space-y-2 text-blue-800 text-sm">
              <li>✅ Live status updates from carrier</li>
              <li>✅ Detailed event timeline with locations</li>
              <li>✅ Estimated delivery date</li>
              <li>✅ Current package location</li>
              <li>✅ Support for UPS, FedEx, USPS</li>
              <li>✅ Exception and delay notifications</li>
            </ul>
            <div className="mt-4 pt-4 border-t border-blue-200">
              <p className="text-xs text-blue-700">
                <strong>Note:</strong> This demo shows mock tracking data. In production, this connects to real carrier APIs
                (UPS Tracking API, FedEx Track Service, USPS Tracking) for live shipment updates.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!trackingInfo && !error && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-card border rounded-lg p-12 text-center">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Track Your Shipment</h3>
            <p className="text-muted-foreground mb-6">
              Enter a tracking number above or try a demo to see real-time tracking in action
            </p>
            <div className="flex gap-4 justify-center">
              {(['UPS', 'FEDEX', 'USPS'] as const).map((c) => (
                <Button
                  key={c}
                  variant="outline"
                  onClick={() => {
                    setCarrier(c)
                    setTimeout(() => useDemoTracking(), 100)
                  }}
                >
                  Demo {c} Tracking
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="max-w-4xl mx-auto mt-8">
        <div className="bg-card border rounded-lg p-6">
          <h3 className="font-semibold mb-4">How Real-Time Tracking Works</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <h4 className="font-semibold">Carrier APIs</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Connects to UPS, FedEx, and USPS tracking APIs for real-time data
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                <h4 className="font-semibold">Live Updates</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Receives status updates, location changes, and delivery confirmations
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-bold">3</span>
                </div>
                <h4 className="font-semibold">Customer Notify</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Automatically sends email/SMS notifications to customers
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
