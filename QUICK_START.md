# Quick Start - Odoo ERP Integration Demo

## 🚀 Run the Demo (No Odoo Required!)

```bash
cd nationwide-floorcovering-poc
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🎯 Testing the Odoo Integration

### Step 1: Browse Products
- Navigate to **Products** page
- Products are sourced from mock Odoo ERP
- Note the SKU codes and inventory levels

### Step 2: Add to Cart
- Click on any product
- Enter square footage
- Click "Add to Cart"

### Step 3: Checkout with Odoo Sync
1. Go to **Cart** page
2. Click "Proceed to Checkout"
3. Fill in customer information (pre-filled with demo data)
4. **Important:** Keep the "Sync to Odoo ERP" checkbox **CHECKED** ✅
5. Click "Place Order"

### Step 4: See Order in Odoo
- After successful order, note the **Odoo Order ID** shown
- Click "View in Odoo Admin" button OR
- Navigate to **Odoo ERP** in the header menu

### Step 5: Explore Admin Dashboard
Visit `/admin/odoo` to see:
- **Overview Tab:** Integration status and features
- **Products Tab:** Product catalog from Odoo
- **Orders Tab:** Your order should appear here with status
- **Customers Tab:** Customer/partner database
- Click **"Sync Now"** to trigger a manual sync

## 📊 What You'll See

### Order Confirmation Page
```
✅ Order Placed Successfully!

🗄️ Odoo ERP Integration
Order successfully synchronized with Odoo ERP
Odoo Order ID: #2004
```

### Odoo Admin Dashboard
- Live sync status
- 6 products synchronized
- 3+ orders (including yours)
- 3+ customers
- Real-time metrics

## 🔧 Key Features Demonstrated

1. **Product Sync** - Products catalog from Odoo
2. **Order Creation** - Automatic order creation in Odoo
3. **Customer Management** - Customer data synchronized
4. **Inventory Tracking** - Stock levels displayed
5. **Admin Monitoring** - Full integration dashboard
6. **EDI Support** - Electronic Data Interchange standards

## 📝 Demo Data

### Pre-configured Customer
- Name: John Demo Customer
- Email: demo@example.com
- Address: 123 Demo Street, New York, NY 10001

### Available Products (from Mock Odoo)
- Premium Oak Hardwood (SKU-000001) - $8.99/sq ft
- Luxury Plush Carpet (SKU-000002) - $3.99/sq ft
- Waterproof Luxury Vinyl Plank (SKU-000003) - $4.49/sq ft
- And 3 more...

### Existing Orders in Odoo
- SO001 - John Smith - $1,247.50
- SO002 - ABC Construction LLC - $5,620.00
- SO003 - Jane Doe - $673.50

## 🎬 Demo Flow

**Perfect for presentations:**

1. **Show Products Page** → "These products come from Odoo ERP"
2. **Add to Cart** → "Let's place an order"
3. **Checkout** → "Notice the Odoo sync option - this is unique"
4. **Place Order** → "Order is being created in Odoo in real-time"
5. **Confirmation** → "Here's the Odoo Order ID"
6. **Admin Dashboard** → "Let's verify in the ERP system"
7. **Orders Tab** → "Here's our order in Odoo"

## 🔄 Mock vs Real Odoo

### Current Setup (Mock):
- ✅ No Odoo installation needed
- ✅ Instant demo
- ✅ All features work
- ✅ Simulated API responses

### Connecting Real Odoo:
```bash
# 1. Create .env.local
cp .env.example .env.local

# 2. Add your Odoo credentials
ODOO_URL=https://your-odoo-instance.com
ODOO_DB=your_database
ODOO_USERNAME=admin
ODOO_PASSWORD=admin

# 3. Restart the app
npm run dev
```

See [ODOO_INTEGRATION.md](./ODOO_INTEGRATION.md) for detailed setup.

## 🐛 Troubleshooting

### Orders Not Showing in Admin?
- Refresh the page
- Click "Sync Now" button
- Make sure you enabled "Sync to Odoo" during checkout

### TypeScript Errors?
- Run: `npm install`
- Ensure all dependencies are installed

### Build Errors?
- Check Node version: `node --version` (should be 18+)
- Clear cache: `rm -rf .next`
- Rebuild: `npm run build`

## 📚 Documentation

- **Full Integration Guide:** [ODOO_INTEGRATION.md](./ODOO_INTEGRATION.md)
- **Main README:** [README.md](./README.md)
- **API Documentation:** See ODOO_INTEGRATION.md → API Reference section

## 💡 Tips for Demos

1. **Open two browser windows:**
   - Window 1: E-commerce site (place order)
   - Window 2: Admin dashboard (watch it appear)

2. **Highlight unique features:**
   - Real-time sync checkbox on checkout
   - Odoo Order ID on confirmation
   - Live admin dashboard

3. **Explain EDI:**
   - "This follows industry-standard EDI formats"
   - "Orders are sent as EDI 850 Purchase Orders"
   - "Invoices can be generated as EDI 810"

4. **Show scalability:**
   - "This is a demo, but connects to real Odoo"
   - "Handles products, orders, customers, inventory"
   - "Can scale to thousands of SKUs"

## 🎯 Next Steps

After the demo:
1. Review the code in `/lib/odoo/`
2. Check API routes in `/app/api/odoo/`
3. Explore admin dashboard code in `/app/admin/odoo/`
4. Read full integration guide

---

**Questions?** Check [ODOO_INTEGRATION.md](./ODOO_INTEGRATION.md) for comprehensive documentation.
