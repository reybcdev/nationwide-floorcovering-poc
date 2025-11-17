import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/ProductCard'
import { products } from '@/lib/mock-data'
import { ArrowRight, Star, Shield, Truck, Sparkles } from 'lucide-react'

export default function HomePage() {
  const featuredProducts = products.slice(0, 3)

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-32 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&h=1080&fit=crop&q=80"
            alt="Beautiful modern living room with premium hardwood flooring"
            fill
            className="object-cover"
            priority
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight text-white">
              Transform Your Space with Premium Flooring
            </h1>
            <p className="text-xl mb-8 text-white/90">
              Discover our extensive collection of hardwood, carpet, and vinyl flooring. 
              Visualize your perfect floor with our cutting-edge 3D room visualizer.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/products">
                <Button size="lg" className="text-lg">
                  Browse Products
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/visualizer">
                <Button size="lg" variant="secondary" className="text-lg">
                  Try Virtual Visualizer
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Virtual Visualizer</h3>
              <p className="text-sm text-muted-foreground">
                See how flooring looks in your space before you buy
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Star className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Premium Quality</h3>
              <p className="text-sm text-muted-foreground">
                Top-rated products from trusted manufacturers
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Truck className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Fast Delivery</h3>
              <p className="text-sm text-muted-foreground">
                Reliable freight options with real-time tracking
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Professional Install</h3>
              <p className="text-sm text-muted-foreground">
                Find certified installers in your area
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Products</h2>
              <p className="text-muted-foreground">Discover our most popular flooring options</p>
            </div>
            <Link href="/products">
              <Button variant="outline">
                View All Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Shop by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/products?category=hardwood" className="group relative overflow-hidden rounded-lg aspect-[4/3]">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20 z-10" />
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=800&h=600&fit=crop')] bg-cover bg-center transition-transform group-hover:scale-110" />
              <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                <h3 className="text-white text-2xl font-bold mb-2">Hardwood Flooring</h3>
                <p className="text-white/90 text-sm">Timeless elegance and durability</p>
              </div>
            </Link>
            
            <Link href="/products?category=carpet" className="group relative overflow-hidden rounded-lg aspect-[4/3]">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20 z-10" />
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=800&h=600&fit=crop')] bg-cover bg-center transition-transform group-hover:scale-110" />
              <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                <h3 className="text-white text-2xl font-bold mb-2">Carpet</h3>
                <p className="text-white/90 text-sm">Soft comfort for every room</p>
              </div>
            </Link>
            
            <Link href="/products?category=vinyl" className="group relative overflow-hidden rounded-lg aspect-[4/3]">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20 z-10" />
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800&h=600&fit=crop')] bg-cover bg-center transition-transform group-hover:scale-110" />
              <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                <h3 className="text-white text-2xl font-bold mb-2">Vinyl Flooring</h3>
                <p className="text-white/90 text-sm">Waterproof and low-maintenance</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Space?</h2>
          <p className="text-lg mb-8 opacity-90">
            Use our virtual room visualizer to see how different flooring options look in your home
          </p>
          <Link href="/visualizer">
            <Button size="lg" variant="secondary" className="text-lg">
              Launch Room Visualizer
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
