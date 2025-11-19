'use client'

import Link from 'next/link'
import { ShoppingCart, Search, Menu, User, Database } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { useCartStore } from '@/lib/store'
import { useState } from 'react'

export function Header() {
  const totalItems = useCartStore((state) => state.getTotalItems())
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-primary">
              Nationwide Floorcovering
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/products" className="text-sm font-medium transition-colors hover:text-primary">
              Products
            </Link>
            <Link href="/odoo-products" className="text-sm font-medium transition-colors hover:text-primary">
              Odoo Inventory
            </Link>
            <Link href="/tracking" className="text-sm font-medium transition-colors hover:text-primary">
              Track Package
            </Link>
            <Link href="/shipping-workflow" className="text-sm font-medium transition-colors hover:text-primary">
              Shipping
            </Link>
            <Link href="/edi-demo" className="text-sm font-medium transition-colors hover:text-primary">
              EDI Demo
            </Link>
            <Link href="/edi-documents" className="text-sm font-medium transition-colors hover:text-primary">
              EDI Docs
            </Link>
            <Link href="/admin/odoo" className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-1">
              <Database className="h-4 w-4" />
              Admin
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-sm mx-8">
            <div className="relative w-full">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-8"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            <Input placeholder="Search products..." />
            <nav className="flex flex-col space-y-4">
              <Link href="/products" className="text-sm font-medium">
                Products
              </Link>
              <Link href="/visualizer" className="text-sm font-medium">
                Room Visualizer
              </Link>
              <Link href="/installers" className="text-sm font-medium">
                Find Installers
              </Link>
              <Link href="/admin/odoo" className="text-sm font-medium flex items-center gap-1">
                <Database className="h-4 w-4" />
                Odoo ERP Admin
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
