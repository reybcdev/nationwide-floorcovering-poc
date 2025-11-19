'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw, Package, DollarSign, Database } from 'lucide-react'

interface SyncedProduct {
  id: string
  odooId: number
  name: string
  sku: string
  category: string
  price: number
  stockQuantity: number
  inStock: boolean
}

export default function OdooProductsPage() {
  const [products, setProducts] = useState<SyncedProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastSync, setLastSync] = useState<string | null>(null)

  const fetchProducts = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/sync/products?limit=50')
      const data = await response.json()
      
      if (data.success) {
        setProducts(data.data.products)
        setLastSync(new Date().toLocaleString())
      } else {
        setError(data.message || 'Failed to fetch products')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }

  const syncProducts = async () => {
    setSyncing(true)
    setError(null)
    
    try {
      const response = await fetch('/api/sync/products?limit=100')
      const data = await response.json()
      
      if (data.success) {
        setProducts(data.data.products)
        setLastSync(new Date().toLocaleString())
        alert(`Successfully synced ${data.data.productsImported} products from Odoo!`)
      } else {
        setError(data.message || 'Failed to sync products')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync products')
    } finally {
      setSyncing(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold mb-2">Odoo Product Inventory</h1>
            <p className="text-muted-foreground">
              Products synced from Odoo ERP system in real-time
            </p>
            {lastSync && (
              <p className="text-sm text-muted-foreground mt-2">
                Last synced: {lastSync}
              </p>
            )}
          </div>
          <Button 
            onClick={syncProducts} 
            disabled={syncing}
            size="lg"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync from Odoo'}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Products</p>
              <p className="text-3xl font-bold">{products.length}</p>
            </div>
            <Package className="h-12 w-12 text-primary opacity-20" />
          </div>
        </div>
        
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">In Stock</p>
              <p className="text-3xl font-bold">
                {products.filter(p => p.inStock).length}
              </p>
            </div>
            <Database className="h-12 w-12 text-green-500 opacity-20" />
          </div>
        </div>
        
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Price</p>
              <p className="text-3xl font-bold">
                ${products.length > 0 
                  ? (products.reduce((sum, p) => sum + p.price, 0) / products.length).toFixed(2)
                  : '0.00'}
              </p>
            </div>
            <DollarSign className="h-12 w-12 text-blue-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
          <p className="font-semibold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
          <p className="text-lg text-muted-foreground">Loading products from Odoo...</p>
        </div>
      )}

      {/* Products Table */}
      {!loading && products.length > 0 && (
        <div className="bg-card border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-4 font-semibold">Odoo ID</th>
                  <th className="text-left p-4 font-semibold">SKU</th>
                  <th className="text-left p-4 font-semibold">Product Name</th>
                  <th className="text-left p-4 font-semibold">Category</th>
                  <th className="text-right p-4 font-semibold">Price</th>
                  <th className="text-right p-4 font-semibold">Stock</th>
                  <th className="text-center p-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => (
                  <tr 
                    key={product.id} 
                    className={index % 2 === 0 ? 'bg-background' : 'bg-muted/50'}
                  >
                    <td className="p-4 font-mono text-sm">{product.odooId}</td>
                    <td className="p-4 font-mono text-sm">{product.sku}</td>
                    <td className="p-4">{product.name}</td>
                    <td className="p-4 capitalize">{product.category}</td>
                    <td className="p-4 text-right font-semibold">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="p-4 text-right">{product.stockQuantity}</td>
                    <td className="p-4 text-center">
                      {product.inStock ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          In Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Out of Stock
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && products.length === 0 && !error && (
        <div className="text-center py-12 bg-card border rounded-lg">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-semibold mb-2">No products found</p>
          <p className="text-muted-foreground mb-4">
            Click "Sync from Odoo" to import products from your Odoo ERP system
          </p>
          <Button onClick={syncProducts} disabled={syncing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            Sync Products Now
          </Button>
        </div>
      )}

      {/* Integration Info */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">📊 Odoo Integration Features</h3>
        <ul className="space-y-2 text-blue-800 text-sm">
          <li>✅ Real-time product synchronization from Odoo ERP</li>
          <li>✅ Automatic inventory level updates</li>
          <li>✅ SKU and pricing management</li>
          <li>✅ Category mapping (Hardwood, Carpet, Vinyl)</li>
          <li>✅ Stock availability tracking</li>
        </ul>
      </div>
    </div>
  )
}
