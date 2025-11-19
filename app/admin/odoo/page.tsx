'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Database,
  RefreshCw,
  Package,
  ShoppingCart,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  ArrowUpRight,
} from 'lucide-react'
import type { OdooProduct, OdooSaleOrder, OdooPartner, EDISyncStatus } from '@/lib/odoo/types'

export default function OdooAdminPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [products, setProducts] = useState<OdooProduct[]>([])
  const [orders, setOrders] = useState<OdooSaleOrder[]>([])
  const [partners, setPartners] = useState<OdooPartner[]>([])
  const [syncStatus, setSyncStatus] = useState<EDISyncStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        loadProducts(),
        loadOrders(),
        loadPartners(),
        loadSyncStatus(),
      ])
    } finally {
      setLoading(false)
    }
  }

  const loadProducts = async () => {
    try {
      const res = await fetch('/api/odoo/products?limit=20')
      const data = await res.json()
      if (data.success) {
        setProducts(data.data)
      }
    } catch (error) {
      console.error('Error loading products:', error)
    }
  }

  const loadOrders = async () => {
    try {
      const res = await fetch('/api/odoo/orders?limit=20')
      const data = await res.json()
      if (data.success) {
        setOrders(data.data)
      }
    } catch (error) {
      console.error('Error loading orders:', error)
    }
  }

  const loadPartners = async () => {
    try {
      const res = await fetch('/api/odoo/partners?limit=20')
      const data = await res.json()
      if (data.success) {
        setPartners(data.data)
      }
    } catch (error) {
      console.error('Error loading partners:', error)
    }
  }

  const loadSyncStatus = async () => {
    try {
      const res = await fetch('/api/odoo/sync')
      const data = await res.json()
      if (data.success) {
        setSyncStatus(data.data)
      }
    } catch (error) {
      console.error('Error loading sync status:', error)
    }
  }

  const handleSync = async () => {
    setSyncing(true)
    try {
      const res = await fetch('/api/odoo/sync', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setSyncStatus(data.data)
        await loadData()
      }
    } catch (error) {
      console.error('Error syncing:', error)
    } finally {
      setSyncing(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getStateColor = (state: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-500',
      sent: 'bg-blue-500',
      sale: 'bg-green-500',
      done: 'bg-emerald-500',
      cancel: 'bg-red-500',
    }
    return colors[state] || 'bg-gray-500'
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <Database className="w-10 h-10 text-purple-600" />
              Odoo ERP Integration
            </h1>
            <p className="text-muted-foreground mt-2">
              Real-time synchronization with Odoo ERP system via EDI
            </p>
          </div>
          <Button
            onClick={handleSync}
            disabled={syncing}
            size="lg"
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync Now'}
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      {syncStatus && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                Products
                <Package className="w-4 h-4 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{syncStatus.recordsSynced.products}</div>
              <p className="text-xs text-muted-foreground">Synced from Odoo</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                Orders
                <ShoppingCart className="w-4 h-4 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{syncStatus.recordsSynced.orders}</div>
              <p className="text-xs text-muted-foreground">Total in ERP</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                Customers
                <Users className="w-4 h-4 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{syncStatus.recordsSynced.customers}</div>
              <p className="text-xs text-muted-foreground">Active partners</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                Sync Status
                <Activity className="w-4 h-4 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {syncStatus.status === 'idle' && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
                {syncStatus.status === 'syncing' && (
                  <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
                )}
                {syncStatus.status === 'error' && (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <span className="text-sm font-medium capitalize">{syncStatus.status}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Last: {formatDate(syncStatus.lastSync)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>EDI Integration Status</CardTitle>
              <CardDescription>
                Electronic Data Interchange connection with Odoo ERP
              </CardDescription>
            </CardHeader>
            <CardContent>
              {syncStatus && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium mb-1">Last Sync</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(syncStatus.lastSync).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Next Scheduled Sync</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(syncStatus.nextSync).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Integration Features</h4>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Real-time product synchronization
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Automatic order creation in Odoo
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Customer data synchronization
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Inventory level updates
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        EDI 850 (Purchase Order) support
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        EDI 810 (Invoice) generation
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Catalog from Odoo</CardTitle>
              <CardDescription>
                Products synchronized from Odoo ERP system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-mono text-sm">
                        {product.default_code}
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.categ_id[1]}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(product.list_price)}
                      </TableCell>
                      <TableCell className="text-right">
                        {product.qty_available} {product.uom_id[1]}
                      </TableCell>
                      <TableCell>
                        {product.qty_available > 0 ? (
                          <Badge variant="default" className="bg-green-500">
                            In Stock
                          </Badge>
                        ) : (
                          <Badge variant="destructive">Out of Stock</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales Orders from Odoo</CardTitle>
              <CardDescription>
                Orders created and managed in Odoo ERP
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Invoice</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono font-medium">
                        {order.name}
                      </TableCell>
                      <TableCell>{order.partner_id[1]}</TableCell>
                      <TableCell>{formatDate(order.date_order)}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(order.amount_total)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStateColor(order.state)}>
                          {order.state.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {order.invoice_status.replace('_', ' ')}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Database from Odoo</CardTitle>
              <CardDescription>
                Partners and customers synchronized from Odoo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Rank</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partners.map((partner) => (
                    <TableRow key={partner.id}>
                      <TableCell className="font-medium">{partner.name}</TableCell>
                      <TableCell>{partner.email || '-'}</TableCell>
                      <TableCell>
                        {partner.city && partner.state_id
                          ? `${partner.city}, ${partner.state_id[1]}`
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {partner.company_type === 'company' ? 'Business' : 'Individual'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {partner.customer_rank}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
