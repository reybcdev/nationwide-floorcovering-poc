'use client'

import { useState, useMemo, useEffect } from 'react'
import { ProductCard } from '@/components/ProductCard'
import type { SyncedProduct } from '@/lib/odoo/product-sync'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Search, SlidersHorizontal, RefreshCw } from 'lucide-react'

export default function ProductsPage() {
  const [products, setProducts] = useState<SyncedProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [inStockOnly, setInStockOnly] = useState(false)
  const [minRating, setMinRating] = useState(0)
  const [showFilters, setShowFilters] = useState(true)

  // Fetch products from Odoo on mount
  useEffect(() => {
    const abortController = new AbortController()
    let mounted = true
    
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch('/api/sync/products?limit=100', {
          signal: abortController.signal
        })
        const data = await response.json()
        
        // Only update state if component is still mounted
        if (!mounted) return
        
        if (data.success) {
          setProducts(data.data.products)
        } else {
          const errorMsg = data.message || 'Failed to load products'
          console.error('Failed to load products:', errorMsg, data.errors)
          setError(errorMsg)
        }
      } catch (err) {
        // Ignore abort errors
        if (err instanceof Error && err.name === 'AbortError') {
          return
        }
        
        if (!mounted) return
        
        const errorMsg = err instanceof Error ? err.message : 'Failed to load products'
        console.error('Error fetching products:', err)
        setError(errorMsg)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }
    
    fetchProducts()
    
    // Cleanup function
    return () => {
      mounted = false
      abortController.abort()
    }
  }, [])

  const brands = Array.from(new Set(products.map(p => p.brand)))

  // Calculate actual max price from products
  const maxProductPrice = useMemo(() => {
    if (products.length === 0) return 1000
    return Math.ceil(Math.max(...products.map(p => p.pricePerSqFt)) / 10) * 10
  }, [products])

  // Update price range when products load for the first time
  useEffect(() => {
    if (products.length > 0 && priceRange[1] === 1000) {
      setPriceRange([0, maxProductPrice])
    }
  }, [products.length, maxProductPrice])

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Search filter
      if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !product.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }

      // Category filter
      if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) {
        return false
      }

      // Price filter
      if (product.pricePerSqFt < priceRange[0] || product.pricePerSqFt > priceRange[1]) {
        return false
      }

      // Brand filter
      if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) {
        return false
      }

      // Stock filter
      if (inStockOnly && !product.inStock) {
        return false
      }

      // Rating filter
      if (product.rating < minRating) {
        return false
      }

      return true
    })
  }, [searchQuery, selectedCategories, priceRange, selectedBrands, inStockOnly, minRating])

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand)
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-4">All Products</h1>
            <p className="text-muted-foreground">Browse our complete collection of premium flooring synced from Odoo</p>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
          <p className="font-semibold">Error loading products</p>
          <p>{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline" 
            className="mt-2"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
          <p className="text-lg text-muted-foreground">Loading products from Odoo...</p>
        </div>
      )}

      {/* Main Content - Only show when not loading */}
      {!loading && (
        <>
          {/* Search and Filter Toggle */}
          <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden"
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      <div className="flex gap-8">
        {/* Filters Sidebar */}
        <aside className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-64 space-y-6`}>
          <div className="bg-card border rounded-lg p-4 space-y-6">
            {/* Category Filter */}
            <div>
              <h3 className="font-semibold mb-3">Category</h3>
              <div className="space-y-2">
                {['hardwood', 'carpet', 'vinyl'].map(category => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={category}
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={() => toggleCategory(category)}
                    />
                    <Label htmlFor={category} className="capitalize cursor-pointer">
                      {category}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div>
              <h3 className="font-semibold mb-3">Price Range (per sq ft)</h3>
              <div className="space-y-4">
                <Slider
                  min={0}
                  max={maxProductPrice}
                  step={maxProductPrice > 100 ? 10 : 1}
                  value={priceRange}
                  onValueChange={setPriceRange}
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
              </div>
            </div>

            {/* Brand Filter */}
            <div>
              <h3 className="font-semibold mb-3">Brand</h3>
              <div className="space-y-2">
                {brands.map(brand => (
                  <div key={brand} className="flex items-center space-x-2">
                    <Checkbox
                      id={brand}
                      checked={selectedBrands.includes(brand)}
                      onCheckedChange={() => toggleBrand(brand)}
                    />
                    <Label htmlFor={brand} className="cursor-pointer">
                      {brand}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Availability Filter */}
            <div>
              <h3 className="font-semibold mb-3">Availability</h3>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="inStock"
                  checked={inStockOnly}
                  onCheckedChange={(checked) => setInStockOnly(checked as boolean)}
                />
                <Label htmlFor="inStock" className="cursor-pointer">
                  In Stock Only
                </Label>
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <h3 className="font-semibold mb-3">Minimum Rating</h3>
              <div className="space-y-2">
                {[4, 3, 2, 1].map(rating => (
                  <div key={rating} className="flex items-center space-x-2">
                    <Checkbox
                      id={`rating-${rating}`}
                      checked={minRating === rating}
                      onCheckedChange={() => setMinRating(minRating === rating ? 0 : rating)}
                    />
                    <Label htmlFor={`rating-${rating}`} className="cursor-pointer">
                      {rating}+ Stars
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Reset Filters */}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setSearchQuery('')
                setSelectedCategories([])
                setPriceRange([0, 10])
                setSelectedBrands([])
                setInStockOnly(false)
                setMinRating(0)
              }}
            >
              Reset Filters
            </Button>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {filteredProducts.length} of {products.length} products
          </div>
          
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">No products found matching your filters.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategories([])
                  setPriceRange([0, maxProductPrice])
                  setSelectedBrands([])
                  setInStockOnly(false)
                  setMinRating(0)
                }}
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </div>
        </>
      )}
    </div>
  )
}
