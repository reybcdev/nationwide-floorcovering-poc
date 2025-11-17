'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { products, reviews } from '@/lib/mock-data'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCartStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'
import { Star, ShoppingCart, Check, ArrowLeft, Truck, Shield } from 'lucide-react'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const product = products.find(p => p.id === params.id)
  const productReviews = reviews.filter(r => r.productId === params.id)
  const addItem = useCartStore(state => state.addItem)
  
  const [selectedImage, setSelectedImage] = useState(0)
  const [sqFeet, setSqFeet] = useState(100)
  const [addedToCart, setAddedToCart] = useState(false)

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Product not found</h1>
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

        {/* Reviews */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Reviews ({productReviews.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {productReviews.length > 0 ? (
              <div className="space-y-6">
                {productReviews.map((review) => (
                  <div key={review.id} className="border-b last:border-0 pb-6 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-semibold">{review.userName}</div>
                        {review.verifiedPurchase && (
                          <Badge variant="secondary" className="text-xs mt-1">Verified Purchase</Badge>
                        )}
                      </div>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= review.overallRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <h4 className="font-medium mb-2">{review.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{review.content}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                      <span>{review.helpfulVotes} people found this helpful</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
