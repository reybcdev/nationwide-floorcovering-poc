'use client'

import Link from 'next/link'
import { ShoppingCart, Search, Menu, User, Database, ChevronDown, Package, FileText, Truck } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { useCartStore } from '@/lib/store'
import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

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
          <nav className="hidden lg:flex items-center space-x-6 ml-12">
            <Link href="/products" className="text-sm font-medium transition-colors hover:text-primary">
              Products
            </Link>
            <Link href="/odoo-products" className="text-sm font-medium transition-colors hover:text-primary">
              Inventory
            </Link>
            
            {/* Shipping & Tracking Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary">
                <Truck className="h-4 w-4" />
                Shipping
                <ChevronDown className="h-3 w-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem asChild>
                  <Link href="/tracking" className="cursor-pointer">
                    <Package className="h-4 w-4 mr-2" />
                    Track Package
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/shipping-workflow" className="cursor-pointer">
                    <Truck className="h-4 w-4 mr-2" />
                    Shipping Workflow
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* EDI & Integration Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary">
                <FileText className="h-4 w-4" />
                EDI
                <ChevronDown className="h-3 w-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem asChild>
                  <Link href="/edi-demo" className="cursor-pointer">
                    <FileText className="h-4 w-4 mr-2" />
                    EDI Demo
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/edi-documents" className="cursor-pointer">
                    <FileText className="h-4 w-4 mr-2" />
                    EDI Documents
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/admin/odoo" className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-1">
              <Database className="h-4 w-4" />
              Admin
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-xs ml-auto mr-4">
            <div className="relative w-full">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-8 h-9"
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
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 space-y-4 border-t">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search products..." className="pl-8" />
            </div>
            <nav className="flex flex-col space-y-3">
              <Link 
                href="/products" 
                className="text-sm font-medium py-2 hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Products
              </Link>
              <Link 
                href="/odoo-products" 
                className="text-sm font-medium py-2 hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Odoo Inventory
              </Link>
              
              <div className="border-t pt-3">
                <p className="text-xs font-semibold text-muted-foreground mb-2">SHIPPING</p>
                <Link 
                  href="/tracking" 
                  className="text-sm font-medium py-2 hover:text-primary transition-colors block"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Track Package
                </Link>
                <Link 
                  href="/shipping-workflow" 
                  className="text-sm font-medium py-2 hover:text-primary transition-colors block"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Shipping Workflow
                </Link>
              </div>

              <div className="border-t pt-3">
                <p className="text-xs font-semibold text-muted-foreground mb-2">EDI INTEGRATION</p>
                <Link 
                  href="/edi-demo" 
                  className="text-sm font-medium py-2 hover:text-primary transition-colors block"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  EDI Demo
                </Link>
                <Link 
                  href="/edi-documents" 
                  className="text-sm font-medium py-2 hover:text-primary transition-colors block"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  EDI Documents
                </Link>
              </div>

              <div className="border-t pt-3">
                <Link 
                  href="/admin/odoo" 
                  className="text-sm font-medium py-2 hover:text-primary transition-colors flex items-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Database className="h-4 w-4" />
                  Odoo ERP Admin
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
