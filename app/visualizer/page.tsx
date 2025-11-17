'use client'

import { useState } from 'react'
import Image from 'next/image'
import { products } from '@/lib/mock-data'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'
import { Upload, RotateCcw, Save, Eye } from 'lucide-react'

export default function VisualizerPage() {
  const [selectedProduct, setSelectedProduct] = useState(products[0])
  const [roomTemplate, setRoomTemplate] = useState('living-room')

  const roomTemplates = [
    { id: 'living-room', name: 'Living Room', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop' },
    { id: 'kitchen', name: 'Kitchen', image: 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=800&h=600&fit=crop' },
    { id: 'bedroom', name: 'Bedroom', image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&h=600&fit=crop' },
  ]

  const currentRoom = roomTemplates.find(r => r.id === roomTemplate)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Virtual Room Visualizer</h1>
        <p className="text-muted-foreground">
          Visualize how different flooring products will look in your space with our interactive 3D room visualizer.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Visualizer Canvas */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              <div className="relative aspect-video bg-muted rounded-t-lg overflow-hidden">
                {/* Mock 3D Room Visualization */}
                <div className="relative w-full h-full">
                  <Image
                    src={currentRoom?.image || ''}
                    alt="Room Preview"
                    fill
                    className="object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <p className="text-white text-sm font-medium">
                      {selectedProduct.name} - {currentRoom?.name}
                    </p>
                    <p className="text-white/80 text-xs mt-1">
                      Click and drag to rotate • Scroll to zoom
                    </p>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="p-4 flex gap-2 border-t">
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Room Photo
                </Button>
                <Button variant="outline" size="sm">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset View
                </Button>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Compare
                </Button>
                <Button variant="outline" size="sm" className="ml-auto">
                  <Save className="h-4 w-4 mr-2" />
                  Save Design
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Room Templates */}
          <div className="mt-6">
            <h3 className="font-semibold mb-4">Room Templates</h3>
            <div className="grid grid-cols-3 gap-4">
              {roomTemplates.map((room) => (
                <button
                  key={room.id}
                  onClick={() => setRoomTemplate(room.id)}
                  className={`relative aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all ${
                    roomTemplate === room.id ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-muted'
                  }`}
                >
                  <div className="relative w-full h-full">
                    <Image src={room.image} alt={room.name} fill className="object-cover" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-white text-center">
                    <p className="text-sm font-medium">{room.name}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Selection Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Selected Product</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden">
                  <Image
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <Badge variant="secondary" className="mb-2">
                    {selectedProduct.category}
                  </Badge>
                  <h4 className="font-semibold mb-1">{selectedProduct.name}</h4>
                  <p className="text-2xl font-bold">{formatPrice(selectedProduct.pricePerSqFt)}</p>
                  <p className="text-xs text-muted-foreground">per square foot</p>
                </div>
                <Button className="w-full">Change Product</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {products.slice(0, 3).map((product) => (
                <button
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                    selectedProduct.id === product.id ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{formatPrice(product.pricePerSqFt)}/sq ft</p>
                    </div>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>360° Room Rotation</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>Real-time Product Swapping</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>Upload Custom Room Photos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>Save & Share Designs</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
