# Odoo ERP EDI Integration Guide

This document explains the Odoo ERP integration implementation in the Nationwide Floorcovering e-commerce PoC.

## Overview

The application includes a complete Electronic Data Interchange (EDI) integration with Odoo ERP, enabling:

- **Real-time product synchronization** from Odoo catalog
- **Automatic order creation** in Odoo when customers checkout
- **Customer data synchronization** between e-commerce and ERP
- **Inventory management** with live stock updates
- **EDI standards support** (850 Purchase Orders, 810 Invoices)

## Architecture

### Components

```
lib/odoo/
├── types.ts           # TypeScript interfaces for Odoo data structures
├── client.ts          # Odoo API client (XML-RPC/JSON-RPC)
├── mock-service.ts    # Mock Odoo service for demo/testing
└── sync-helper.ts     # Helper functions for data conversion

app/api/odoo/
├── products/route.ts  # Product catalog endpoints
├── orders/route.ts    # Order management endpoints
├── partners/route.ts  # Customer/partner endpoints
└── sync/route.ts      # Synchronization status endpoints

app/admin/odoo/
└── page.tsx          # Admin dashboard for monitoring integration
```

## Features

### 1. Product Catalog Sync

Products are synchronized from Odoo's `product.product` model:

- SKU/Product codes
- Pricing (list price, cost)
- Inventory levels (available, virtual)
- Product specifications
- Categories and attributes

**API Endpoint:** `GET /api/odoo/products`

### 2. Automatic Order Creation

When customers complete checkout, orders are automatically sent to Odoo:

```typescript
// Order flow:
1. Customer completes checkout
2. Cart data converted to EDI format
3. API call to Odoo creates sale.order
4. Customer created/updated in res.partner
5. Order lines created with products
6. Order reference returned to e-commerce
```

**API Endpoint:** `POST /api/odoo/orders`

### 3. Customer Management

Customer data is synchronized bi-directionally:

- Contact information
- Shipping addresses
- Billing addresses
- Order history
- Customer ranking

**API Endpoint:** `GET /api/odoo/partners`

### 4. Real-time Inventory

Inventory levels are checked before order placement:

- Available quantity
- Virtual/forecasted quantity
- Location-based stock
- Automatic reservations

**API Endpoint:** `PATCH /api/odoo/products`

### 5. Admin Dashboard

Monitor integration status at `/admin/odoo`:

- Sync status and health
- Product catalog from Odoo
- Sales orders overview
- Customer database
- Error logs and diagnostics

## Demo Mode

The PoC includes a **mock Odoo service** that simulates a real Odoo ERP system:

### Features:
- Simulated API responses with realistic data
- No Odoo installation required
- Perfect for demos and testing
- Configurable delays to simulate network latency

### Usage:
```typescript
import { getMockOdooService } from '@/lib/odoo/mock-service'

const odooService = getMockOdooService()
const products = await odooService.getProducts()
```

## Connecting to Real Odoo

### Prerequisites:
1. Odoo 14+ installation
2. Credentials with API access
3. Required Odoo modules:
   - `sale_management`
   - `stock`
   - `product`
   - `contacts`

### Configuration:

1. Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

2. Configure Odoo connection:
```env
ODOO_URL=https://your-odoo-instance.com
ODOO_DB=your_database
ODOO_USERNAME=api_user
ODOO_PASSWORD=api_password
```

3. Update the service to use real client:
```typescript
// In API routes, replace:
import { getMockOdooService } from '@/lib/odoo/mock-service'

// With:
import { getOdooClient } from '@/lib/odoo/client'
```

## EDI Standards

### Supported EDI Transaction Sets:

#### EDI 850 - Purchase Order
Created when customer places an order:
- Order header (customer, dates, totals)
- Line items (products, quantities, prices)
- Shipping information
- Payment terms

#### EDI 810 - Invoice
Generated from Odoo after order fulfillment:
- Invoice header
- Line item details
- Tax calculations
- Payment information

### Data Mapping

#### E-commerce Cart → Odoo Sale Order
```typescript
{
  // E-commerce                → Odoo
  orderNumber                  → client_order_ref
  customerEmail                → partner_id.email
  items[].sku                  → order_line.product_id.default_code
  items[].quantity             → order_line.product_uom_qty
  items[].unitPrice            → order_line.price_unit
  total                        → amount_total
}
```

## API Reference

### Products

#### List Products
```http
GET /api/odoo/products?limit=50
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1001,
      "name": "Premium Oak Hardwood Flooring",
      "default_code": "SKU-000001",
      "list_price": 8.99,
      "qty_available": 450,
      "categ_id": [1, "Floorcovering / hardwood"]
    }
  ],
  "count": 6
}
```

#### Update Inventory
```http
PATCH /api/odoo/products
Content-Type: application/json

{
  "productId": 1001,
  "quantity": 500
}
```

### Orders

#### List Orders
```http
GET /api/odoo/orders?limit=50
```

#### Create Order
```http
POST /api/odoo/orders
Content-Type: application/json

{
  "orderNumber": "WEB-123456",
  "customerName": "John Smith",
  "customerEmail": "john@example.com",
  "items": [...],
  "total": 1247.50
}
```

Response:
```json
{
  "success": true,
  "message": "Order created successfully in Odoo",
  "data": {
    "odooOrderId": 2004,
    "orderNumber": "WEB-123456"
  }
}
```

#### Confirm Order
```http
POST /api/odoo/orders/2004/confirm
```

### Sync Status

#### Get Status
```http
GET /api/odoo/sync
```

Response:
```json
{
  "success": true,
  "data": {
    "lastSync": "2024-11-18T12:00:00Z",
    "nextSync": "2024-11-18T13:00:00Z",
    "status": "idle",
    "recordsSynced": {
      "products": 6,
      "orders": 3,
      "customers": 3,
      "inventory": 1850
    }
  }
}
```

#### Trigger Sync
```http
POST /api/odoo/sync
```

## Testing

### Demo Flow

1. **Browse Products**: Products sourced from mock Odoo
2. **Add to Cart**: Check inventory availability
3. **Checkout**: 
   - Enable "Sync to Odoo" option
   - Complete order form
   - Submit order
4. **Confirmation**: See Odoo Order ID
5. **Admin Dashboard**: View order in `/admin/odoo`

### Test Customer Data
```javascript
{
  name: "John Demo Customer",
  email: "demo@example.com",
  phone: "+1 555-0100",
  street: "123 Demo Street",
  city: "New York",
  state: "NY",
  zip: "10001"
}
```

## Security Considerations

### For Production:

1. **Secure Credentials**: Use environment variables, never commit credentials
2. **API Rate Limiting**: Implement rate limiting on Odoo API calls
3. **Authentication**: Use Odoo API keys instead of username/password
4. **HTTPS Only**: Ensure all Odoo communication uses HTTPS
5. **Data Validation**: Validate all data before syncing to Odoo
6. **Error Handling**: Implement proper error logging and monitoring
7. **Webhooks**: Set up Odoo webhooks for real-time updates

## Troubleshooting

### Common Issues

#### Connection Errors
- Verify Odoo URL is accessible
- Check firewall/network settings
- Confirm credentials are correct

#### Authentication Failures
- Verify username/password
- Check API user permissions in Odoo
- Ensure database name is correct

#### Data Sync Issues
- Check Odoo logs: `/var/log/odoo/odoo.log`
- Verify product SKUs match
- Confirm required fields are populated

## Performance

### Optimization Tips

1. **Batch Operations**: Sync products in batches
2. **Caching**: Cache product data with TTL
3. **Async Processing**: Use background jobs for syncing
4. **Webhook Events**: React to Odoo changes vs polling
5. **Indexed Fields**: Ensure SKU/email fields are indexed

## Future Enhancements

### Planned Features:

- [ ] Inventory webhooks for real-time updates
- [ ] Customer portal integration
- [ ] Advanced pricing rules sync
- [ ] Multi-warehouse support
- [ ] Return/refund management
- [ ] Shipment tracking integration
- [ ] B2B customer portal with Odoo login
- [ ] Custom EDI formats (856, 997, etc.)

## Support

For Odoo-related questions:
- Odoo Documentation: https://www.odoo.com/documentation
- Odoo API Reference: https://www.odoo.com/documentation/16.0/developer/reference/external_api.html

For integration support:
- Check `/app/api/odoo/` API routes
- Review error logs in browser console
- Visit admin dashboard at `/admin/odoo`
