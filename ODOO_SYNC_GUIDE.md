# Odoo ERP Integration - Complete Sync Guide

This guide explains how the e-commerce PoC integrates with Odoo ERP for product inventory, customer management, and EDI transaction processing.

## 🎯 Features Implemented

### 1. Product Inventory Sync ✅
- Real-time synchronization of products from Odoo to e-commerce
- Automatic inventory level updates
- SKU and pricing management
- Category mapping (Hardwood, Carpet, Vinyl)
- Stock availability tracking

### 2. Customer Sync ✅
- Bi-directional customer data sync
- Auto-create/update customers in Odoo
- Address and contact information management
- Customer ranking and categorization

### 3. EDI Integration ✅
- **EDI 850**: Purchase Order generation
- **EDI 810**: Invoice generation
- X12 format output
- Automated document generation on order submission

## 📁 New Files Created

### Backend Services

| File | Purpose |
|------|---------|
| `lib/odoo/product-sync.ts` | Product synchronization logic |
| `lib/odoo/customer-sync.ts` | Customer synchronization logic |
| `lib/odoo/edi-service.ts` | EDI document generation (850, 810) |

### API Routes

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/sync/products` | GET | Sync products from Odoo |
| `/api/sync/customers` | GET | Fetch customers from Odoo |
| `/api/orders/submit` | POST | Submit order with EDI generation |

### Frontend Pages

| Page | URL | Purpose |
|------|-----|---------|
| Odoo Products | `/odoo-products` | View synced inventory |
| EDI Demo | `/edi-demo` | Test EDI generation |

## 🚀 Quick Start Guide

### Step 1: Ensure Odoo Connection

Your `.env.local` should already have:
```env
ODOO_URL=https://floorcovering.odoo.com
ODOO_DB=floorcovering
ODOO_USERNAME=reynier.bc@gmail.com
ODOO_PASSWORD=your-password
```

### Step 2: Sync Products from Odoo

**Option A: Use the UI**
1. Visit: http://localhost:3000/odoo-products
2. Click "Sync from Odoo" button
3. View your synced inventory

**Option B: Use the API**
```bash
curl http://localhost:3000/api/sync/products?limit=50
```

### Step 3: Test Customer Sync

```bash
curl http://localhost:3000/api/sync/customers?limit=20
```

### Step 4: Test EDI Integration

1. Visit: http://localhost:3000/edi-demo
2. Fill out the customer form
3. Click "Submit Order & Generate EDI"
4. Download EDI 850 and 810 documents

## 📊 Integration Flow

### Product Sync Flow

```
Odoo ERP (product.product)
    ↓ API Call
Product Sync Service (product-sync.ts)
    ↓ Transform
E-commerce Database/State
    ↓ Display
Frontend (odoo-products page)
```

### Order Flow with EDI

```
1. Customer places order → E-commerce Frontend
2. Submit to API → /api/orders/submit
3. Sync customer → Odoo (res.partner)
4. Create order → Odoo (sale.order)
5. Generate EDI 850 → Purchase Order
6. Generate EDI 810 → Invoice
7. Return documents → Customer
```

## 🔧 API Documentation

### Sync Products

**GET** `/api/sync/products?limit=100`

**Response:**
```json
{
  "success": true,
  "message": "Successfully synced 6 products from Odoo",
  "data": {
    "productsImported": 6,
    "products": [
      {
        "id": "odoo-3",
        "odooId": 3,
        "name": "VINEYARD - PINOT",
        "sku": "VINEYARD-PINOT",
        "category": "hardwood",
        "price": 7.68,
        "stockQuantity": 100,
        "inStock": true
      }
    ],
    "errors": []
  }
}
```

### Sync Customers

**GET** `/api/sync/customers?limit=50`

**Response:**
```json
{
  "success": true,
  "message": "Successfully fetched 3 customers from Odoo",
  "data": {
    "count": 3,
    "customers": [
      {
        "id": "odoo-7",
        "odooId": 7,
        "name": "John Smith",
        "email": "john@example.com",
        "phone": "555-0123",
        "address": {...}
      }
    ]
  }
}
```

### Submit Order with EDI

**POST** `/api/orders/submit`

**Request Body:**
```json
{
  "customer": {
    "name": "John Smith",
    "email": "john@example.com",
    "phone": "555-0123",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip": "10001",
    "country": "US"
  },
  "items": [
    {
      "odooId": 3,
      "sku": "VINEYARD-PINOT",
      "name": "VINEYARD - PINOT Hardwood Floor",
      "quantity": 100,
      "unitPrice": 7.68
    }
  ],
  "total": 768.00
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order submitted successfully with EDI generation",
  "data": {
    "orderNumber": "WEB-1732015234567",
    "odooOrderId": 42,
    "partnerId": 7,
    "edi": {
      "edi850": {...},
      "edi850X12": "ISA*00*...",
      "edi810": {...},
      "edi810X12": "ISA*00*..."
    }
  }
}
```

## 📦 Data Transformation

### Odoo Product → E-commerce Product

```typescript
// Odoo Structure
{
  id: 3,
  name: "VINEYARD - PINOT",
  default_code: "VINEYARD-PINOT",
  list_price: 7.68,
  qty_available: 100,
  categ_id: [5, "Hardwood floors"]
}

// E-commerce Structure
{
  id: "odoo-3",
  odooId: 3,
  name: "VINEYARD - PINOT",
  sku: "VINEYARD-PINOT",
  category: "hardwood",
  price: 7.68,
  pricePerSqFt: 7.68,
  stockQuantity: 100,
  inStock: true,
  brand: "Odoo Floorcovering"
}
```

### Category Mapping

| Odoo Category | E-commerce Category |
|---------------|---------------------|
| Contains "hardwood", "oak", "wood" | `hardwood` |
| Contains "carpet" | `carpet` |
| Contains "vinyl", "lvp", "lvt" | `vinyl` |
| Other | `other` |

## 🔄 EDI Transaction Sets

### EDI 850 - Purchase Order

**Purpose**: Sent from buyer to seller to initiate a purchase

**Key Segments**:
- `ISA`: Interchange Control Header
- `GS`: Functional Group Header
- `ST`: Transaction Set Header (850)
- `BEG`: Beginning Segment
- `N1`: Name/Address
- `PO1`: Purchase Order Line Items
- `SE/GE/IEA`: Trailers

**Sample Output**:
```
ISA*00*          *00*          *ZZ*SENDER         *ZZ*RECEIVER       *20241119*1230*U*00401*000000001*0*P*>~
GS*PO*SENDER*RECEIVER*20241119*1230*1*X*004010~
ST*850*0001~
BEG*00*SA*WEB-123456*20241119~
N1*BY*John Smith~
N3*123 Main Street~
N4*New York*NY*10001~
PO1*1*100*SQ FT*7.68**BP*VINEYARD-PINOT~
PID*F****VINEYARD - PINOT Hardwood Floor~
SE*10*0001~
GE*1*1~
IEA*1*000000001~
```

### EDI 810 - Invoice

**Purpose**: Sent from seller to buyer for payment

**Key Segments**:
- `ST`: Transaction Set Header (810)
- `BIG`: Beginning Segment for Invoice
- `IT1`: Invoice Line Items
- `TDS`: Total Monetary Value
- `CAD`: Payment Terms

**Sample Output**:
```
ST*810*0001~
BIG*20241119*INV-WEB-123456**WEB-123456~
N1*BT*John Smith~
IT1*1*100*EA*7.68**BP*VINEYARD-PINOT~
TDS*76800~
CAD*****Net 30~
SE*8*0001~
```

## 🎨 Frontend Pages

### Odoo Products Page (`/odoo-products`)

**Features**:
- Real-time product sync button
- Product inventory table with:
  - Odoo ID
  - SKU
  - Product name
  - Category
  - Price
  - Stock quantity
  - Status (In Stock / Out of Stock)
- Statistics dashboard:
  - Total products
  - In stock count
  - Average price
- Automatic sync on page load

### EDI Demo Page (`/edi-demo`)

**Features**:
- Customer information form
- Demo order with sample products
- One-click order submission
- Live EDI document generation
- Download EDI 850 and 810 as text files
- Visual display of X12 formatted documents
- Integration workflow explanation

## 🔐 Security Considerations

1. **API Authentication**: Currently using session-based auth from Odoo
2. **Customer Data**: Sensitive info properly handled in Odoo
3. **EDI Documents**: Generated server-side for security
4. **Environment Variables**: Credentials stored in `.env.local`

## 🧪 Testing the Integration

### Test 1: Product Sync

```bash
# Fetch products from Odoo
curl http://localhost:3000/api/sync/products?limit=10 | jq

# Verify response contains your Odoo products
```

### Test 2: Customer Sync

```bash
# Fetch customers
curl http://localhost:3000/api/sync/customers | jq

# Should return existing Odoo customers
```

### Test 3: Complete Order Flow

1. Visit `/edi-demo`
2. Fill out customer form
3. Submit order
4. Verify:
   - ✅ Order created in Odoo
   - ✅ Customer created/updated in Odoo
   - ✅ EDI 850 generated
   - ✅ EDI 810 generated
5. Check Odoo UI:
   - Go to Sales → Orders
   - Find your order
   - Verify customer and line items

## 📈 Monitoring & Logs

### Server Logs

Check terminal for detailed logs:
```
Starting product sync from Odoo (limit: 50)...
Fetched 6 products from Odoo
Processing order submission...
Successfully created customer in Odoo: ID 7
Created sale order in Odoo: ID 42
```

### Admin Dashboard

Visit `/admin/odoo` to monitor:
- Product catalog from Odoo
- Sales orders
- Customer database
- Sync status

## 🐛 Troubleshooting

### Products not syncing?

1. Check Odoo connection: `npm run test:odoo`
2. Verify products exist in Odoo with "Can be Sold" enabled
3. Check console logs for errors

### Customer creation fails?

1. Ensure all required fields are provided (name, email)
2. Check Odoo user permissions
3. Verify email format is valid

### EDI documents not generating?

1. Check order submission succeeded
2. Verify all item data includes SKU and pricing
3. Check server logs for EDI generation errors

## 🚀 Production Deployment

### Checklist:

- [ ] Use Odoo API keys instead of username/password
- [ ] Implement rate limiting on sync endpoints
- [ ] Add caching for product data
- [ ] Set up webhooks for real-time updates
- [ ] Implement EDI transmission to trading partners
- [ ] Add monitoring and alerts
- [ ] Configure HTTPS for all API calls
- [ ] Implement proper error handling and retry logic

## 📚 Additional Resources

- **Odoo API Docs**: https://www.odoo.com/documentation/16.0/developer/reference/external_api.html
- **EDI Standards**: https://www.edibasics.com/
- **X12 Format Guide**: https://www.stedi.com/edi/x12

## 🎉 Summary

Your PoC now has complete Odoo ERP integration with:

✅ **Product Inventory Sync**: Real-time product data from Odoo  
✅ **Customer Management**: Bi-directional customer sync  
✅ **Order Processing**: Automatic order creation in Odoo  
✅ **EDI Integration**: EDI 850 (PO) and 810 (Invoice) generation  
✅ **Admin Dashboard**: Monitor all integration activities  
✅ **Demo Pages**: Test and showcase all features  

**Next Steps**:
1. Add more products to Odoo
2. Test the complete checkout flow
3. Customize EDI documents for your business rules
4. Set up automated sync schedules
5. Implement webhooks for real-time updates

---

**Need help?** Check the logs, test endpoints, or review the API documentation above!
