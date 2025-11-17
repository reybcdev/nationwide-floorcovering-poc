import Link from 'next/link'
import Image from 'next/image'
import { Star, ShoppingCart } from 'lucide-react'
import { Product } from '@/lib/mock-data'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { formatPrice } from '@/lib/utils'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-lg border bg-card transition-all hover:shadow-lg">
      <Link href={`/products/${product.id}`}>
        <div className="aspect-[4/3] overflow-hidden bg-muted">
          <Image
            src={product.image}
            alt={product.name}
            width={400}
            height={300}
            className="object-cover w-full h-full transition-transform group-hover:scale-105"
          />
        </div>
      </Link>
      
      {!product.inStock && (
        <Badge variant="destructive" className="absolute top-2 right-2">
          Out of Stock
        </Badge>
      )}
      
      <div className="p-4">
        <div className="mb-2">
          <Badge variant="secondary" className="text-xs">
            {product.category}
          </Badge>
        </div>
        
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-lg mb-1 line-clamp-2 hover:text-primary">
            {product.name}
          </h3>
        </Link>
        
        <p className="text-sm text-muted-foreground mb-2">{product.brand}</p>
        
        <div className="flex items-center mb-3">
          <div className="flex items-center">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="ml-1 text-sm font-medium">{product.rating}</span>
          </div>
          <span className="text-sm text-muted-foreground ml-2">
            ({product.reviewCount} reviews)
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold">{formatPrice(product.pricePerSqFt)}</p>
            <p className="text-xs text-muted-foreground">per sq ft</p>
          </div>
          
          <Link href={`/products/${product.id}`}>
            <Button size="sm">
              <ShoppingCart className="h-4 w-4 mr-2" />
              View
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
