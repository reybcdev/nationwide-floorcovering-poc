'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { SyncedProduct } from '@/lib/odoo/product-sync'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCartStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'
import { Star, ShoppingCart, Check, ArrowLeft, Truck, Shield, RefreshCw } from 'lucide-react'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<SyncedProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const addItem = useCartStore(state => state.addItem)
  
  const [selectedImage, setSelectedImage] = useState(0)
  const [sqFeet, setSqFeet] = useState(100)
  const [addedToCart, setAddedToCart] = useState(false)

  // Fetch product from Odoo
  useEffect(() => {
    if (!params.id) return
    
    const abortController = new AbortController()
    let mounted = true
    
    const fetchProduct = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/sync/products/${params.id}`, {
          signal: abortController.signal
        })
        const data = await response.json()
        
        // Only update state if component is still mounted
        if (!mounted) return
        
        if (data.success) {
          setProduct(data.data)
        } else {
          setError(data.message || 'Failed to load product')
        }
      } catch (err) {
        // Ignore abort errors
        if (err instanceof Error && err.name === 'AbortError') {
          return
        }
        
        if (!mounted) return
        setError(err instanceof Error ? err.message : 'Failed to load product')
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }
    
    fetchProduct()
    
    // Cleanup function
    return () => {
      mounted = false
      abortController.abort()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <RefreshCw className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading product...</p>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">{error || 'Product not found'}</h1>
        <Link href="/products">
          <Button>Back to Products</Button>
        </Link>
      </div>
    )
  }

  const totalPrice = product.pricePerSqFt * sqFeet

  const handleAddToCart = () => {
    addItem(product, sqFeet)
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/products" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Products
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Images */}
        <div>
          <div className="aspect-[4/3] bg-muted rounded-lg overflow-hidden mb-4">
            <Image
              src={product.images[selectedImage]}
              alt={product.name}
              width={800}
              height={600}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`aspect-[4/3] bg-muted rounded-lg overflow-hidden border-2 ${
                  selectedImage === idx ? 'border-primary' : 'border-transparent'
                }`}
              >
                <Image src={img} alt={`View ${idx + 1}`} width={200} height={150} className="object-cover w-full h-full" />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div>
          <Badge variant="secondary" className="mb-2">
            {product.category}
          </Badge>
          <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
          <p className="text-lg text-muted-foreground mb-4">{product.brand}</p>

          {/* Rating */}
          <div className="flex items-center mb-6">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    star <= Math.round(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="ml-2 text-sm font-medium">{product.rating}</span>
            <span className="ml-2 text-sm text-muted-foreground">({product.reviewCount} reviews)</span>
          </div>

          {/* Price */}
          <div className="mb-6">
            <div className="text-4xl font-bold mb-1">{formatPrice(product.pricePerSqFt)}</div>
            <div className="text-sm text-muted-foreground">per square foot</div>
          </div>

          {/* Stock Status */}
          <div className="mb-6">
            {product.inStock ? (
              <div className="flex items-center text-green-600">
                <Check className="h-5 w-5 mr-2" />
                <span className="font-medium">In Stock</span>
              </div>
            ) : (
              <div className="text-red-600 font-medium">Out of Stock</div>
            )}
          </div>

          {/* Square Feet Calculator */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Calculate Your Needs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Square Feet</label>
                  <Input
                    type="number"
                    min="1"
                    value={sqFeet}
                    onChange={(e) => setSqFeet(parseInt(e.target.value) || 0)}
                    className="w-full"
                  />
                </div>
                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="font-medium">Total Price:</span>
                  <span className="text-2xl font-bold">{formatPrice(totalPrice)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Add to Cart */}
          <div className="flex gap-4 mb-6">
            <Button size="lg" className="flex-1" onClick={handleAddToCart} disabled={!product.inStock}>
              <ShoppingCart className="h-5 w-5 mr-2" />
              {addedToCart ? 'Added to Cart!' : 'Add to Cart'}
            </Button>
            <Link href="/visualizer" className="flex-1">
              <Button size="lg" variant="outline" className="w-full">
                Visualize in Room
              </Button>
            </Link>
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t">
            <div className="flex items-center text-sm">
              <Truck className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>Fast Delivery Available</span>
            </div>
            <div className="flex items-center text-sm">
              <Shield className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{product.specifications.warranty} Warranty</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="space-y-8">
        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{product.description}</p>
          </CardContent>
        </Card>

        {/* Specifications */}
        <Card>
          <CardHeader>
            <CardTitle>Specifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="flex justify-between py-2 border-b">
                  <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                  <span className="text-muted-foreground">{Array.isArray(value) ? value.join(', ') : value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Reviews - Coming Soon */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-30" />
              <p className="text-muted-foreground mb-2">Customer reviews coming soon!</p>
              <p className="text-sm text-muted-foreground">
                We&apos;re working on integrating a review system with Odoo.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
