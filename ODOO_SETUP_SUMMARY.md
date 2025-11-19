# Odoo Trial Integration - Setup Summary

Your PoC is fully equipped with Odoo ERP integration! Here's everything you need to connect to your Odoo trial instance.

## 🎯 What's Included

Your application has a complete Odoo EDI integration that supports:

✅ **Real-time product synchronization** from Odoo catalog  
✅ **Automatic order creation** in Odoo when customers checkout  
✅ **Customer data synchronization** between e-commerce and ERP  
✅ **Inventory management** with live stock updates  
✅ **EDI standards support** (850 Purchase Orders, 810 Invoices)  
✅ **Admin dashboard** for monitoring integration  
✅ **Mock service** for demos without Odoo connection  

## 🚀 Quick Start (5 Minutes)

Follow **`QUICKSTART_ODOO.md`** for the fastest setup:

```bash
# 1. Install dependencies
npm install

# 2. Create environment config
cp .env.example .env.local
# Edit .env.local with your Odoo trial credentials

# 3. Test connection
npm run test:odoo

# 4. Switch to real Odoo
bash scripts/switch-to-real-odoo.sh

# 5. Start app
npm run dev
```

Visit: http://localhost:3000/admin/odoo

## 📁 New Files Created for You

I've created several resources to help you:

### Documentation

| File | Purpose |
|------|---------|
| `QUICKSTART_ODOO.md` | ⚡ 5-minute setup guide |
| `CONNECT_TO_ODOO_TRIAL.md` | 📖 Detailed connection instructions |
| `ODOO_INTEGRATION.md` | 📚 Complete integration documentation (already existed) |
| `ODOO_SETUP_SUMMARY.md` | 📋 This summary document |

### Scripts

| File | Purpose |
|------|---------|
| `scripts/switch-to-real-odoo.sh` | 🔄 Switch to your Odoo trial |
| `scripts/switch-to-mock-odoo.sh` | 🔙 Switch back to demo mode |
| `scripts/test-odoo-connection.ts` | 🧪 Test Odoo connection |
| `scripts/README.md` | 📖 Scripts documentation |

### Configuration

| File | Purpose |
|------|---------|
| `.env.example` | 📝 Environment variables template (already existed) |
| `.env.local` | 🔐 Your Odoo credentials (create this) |

## 🔧 Your Odoo Trial Information

You'll need these details from your Odoo trial:

```env
ODOO_URL=https://yourcompany.odoo.com
ODOO_DB=yourcompany
ODOO_USERNAME=your-email@example.com
ODOO_PASSWORD=your-password
```

### How to Find These Values:

**ODOO_URL**: The web address you use to access Odoo
- Example: `https://demo123.odoo.com`
- Find it: Look at your browser's address bar when logged into Odoo

**ODOO_DB**: Your database name
- Usually your company name
- Find it: Visible during Odoo login, or in Settings → Technical → Database Structure

**ODOO_USERNAME**: Your Odoo login email
- Example: `admin@yourcompany.com`

**ODOO_PASSWORD**: Your Odoo account password
- The password you use to log into Odoo web interface

## 🛠️ Setup Steps

### Step 1: Verify Your Odoo Trial

Before connecting, ensure your Odoo trial has:

1. ✅ Active subscription (not expired)
2. ✅ **Sales Management** module installed
3. ✅ **Inventory** module installed
4. ✅ At least one product created with:
   - Name
   - SKU/Internal Reference
   - Sales Price
   - "Can be Sold" enabled

### Step 2: Install Dependencies

```bash
cd /media/Store/DEV/NTSprint/Nationwide\ Floorcovering/nationwide-floorcovering-poc
npm install
```

This installs:
- Existing dependencies (Next.js, React, etc.)
- New dev dependencies: `tsx`, `dotenv`

### Step 3: Configure Environment

```bash
# Copy template
cp .env.example .env.local

# Edit with your credentials
nano .env.local  # or use your preferred editor
```

Add your Odoo trial details:
```env
ODOO_URL=https://yourcompany.odoo.com
ODOO_DB=yourcompany
ODOO_USERNAME=your-email@example.com
ODOO_PASSWORD=your-password
```

**Important:** 
- Remove the `#` comment symbols
- Use exact URL (include `https://`)
- Database name is case-sensitive

### Step 4: Test Connection

```bash
npm run test:odoo
```

Expected output:
```
✅ Authentication successful!
✅ Product fetch successful!
   Found X products
```

### Step 5: Switch to Real Odoo

```bash
bash scripts/switch-to-real-odoo.sh
```

This updates your API routes to use the real Odoo client.

### Step 6: Start Development Server

```bash
npm run dev
```

### Step 7: Verify Integration

Visit these URLs:

1. **Homepage**: http://localhost:3000
   - Products should load from Odoo
   
2. **Admin Dashboard**: http://localhost:3000/admin/odoo
   - View connection status
   - See Odoo products
   - Monitor orders and customers

## ✅ Testing the Full Flow

1. **Browse Products**: Homepage shows products from Odoo
2. **Add to Cart**: Add products and check quantities
3. **Checkout**: Fill out customer form and complete order
4. **Verify in Odoo**: Go to Sales → Orders in Odoo to see the new order

## 🔄 Switching Between Mock and Real

### Use Real Odoo (Connected)
```bash
bash scripts/switch-to-real-odoo.sh
npm run dev
```

### Use Mock Data (Demo Mode)
```bash
bash scripts/switch-to-mock-odoo.sh
npm run dev
```

## 🐛 Troubleshooting

### "Cannot find module 'dotenv'" Error

**Solution**: Run `npm install` to install new dependencies.

### Authentication Failed

**Symptoms**: `Authentication failed: No UID returned`

**Solutions**:
1. Verify credentials in `.env.local`
2. Check database name (case-sensitive)
3. Test login on Odoo web interface
4. Ensure no extra spaces in `.env.local`

### Connection Refused

**Symptoms**: `ECONNREFUSED` or network error

**Solutions**:
1. Verify Odoo URL is accessible in browser
2. Check if trial subscription is active
3. Test: `curl https://yourcompany.odoo.com`
4. Check firewall settings

### No Products Found

**Symptoms**: `Found 0 products`

**Solutions**:
1. Add products in Odoo: Sales → Products → Create
2. Ensure products have "Can be Sold" enabled
3. Set sales price for products
4. Add SKU/Internal Reference

### Products Not Showing on Homepage

**Solutions**:
1. Check browser console for errors
2. Verify `npm run test:odoo` passes
3. Confirm you ran `switch-to-real-odoo.sh`
4. Restart dev server: `npm run dev`

## 📊 Current Architecture

### Before Connection (Demo Mode)
```
E-commerce App → Mock Odoo Service → Simulated Data
```

### After Connection (Production)
```
E-commerce App → Odoo Client → Your Odoo Trial → Real Data
```

### API Routes
All routes support both modes:
- `GET /api/odoo/products` - Fetch products
- `POST /api/odoo/orders` - Create orders
- `GET /api/odoo/partners` - Get customers
- `GET /api/odoo/sync` - Sync status

## 🔐 Security Best Practices

✅ **Never commit `.env.local` to git** (already in `.gitignore`)  
✅ **Use strong passwords** for Odoo account  
✅ **Enable 2FA** on your Odoo account  
✅ **Create dedicated API user** for production (optional)  
✅ **Regularly rotate credentials**  

## 📚 Documentation Reference

### For Quick Setup
👉 **`QUICKSTART_ODOO.md`** - Follow this first!

### For Detailed Information
- `CONNECT_TO_ODOO_TRIAL.md` - Step-by-step connection guide
- `ODOO_INTEGRATION.md` - Complete technical documentation
- `scripts/README.md` - Scripts usage guide

### For API Details
- `lib/odoo/client.ts` - Odoo API client implementation
- `lib/odoo/types.ts` - TypeScript interfaces
- `app/api/odoo/*/route.ts` - API endpoints

## 🎯 Next Steps

1. **Now**: Follow `QUICKSTART_ODOO.md` to connect
2. **Soon**: Test the complete checkout flow
3. **Later**: Customize product sync and order flow
4. **Production**: Set up webhooks for real-time updates

## 🆘 Getting Help

If you encounter issues:

1. ✅ Run: `npm run test:odoo`
2. ✅ Check browser console (F12)
3. ✅ Check terminal output
4. ✅ Review error messages in admin dashboard
5. ✅ Verify `.env.local` settings
6. ✅ Try switching to mock mode to isolate issue

## 💡 Pro Tips

**Tip 1**: Test with mock mode first to understand the flow
```bash
bash scripts/switch-to-mock-odoo.sh
npm run dev
```

**Tip 2**: Keep both modes for flexibility
- Use real Odoo for client demos with live data
- Use mock mode for offline demos or development

**Tip 3**: Check admin dashboard regularly
- http://localhost:3000/admin/odoo
- Monitor integration health
- View sync status

**Tip 4**: Add sample products in Odoo
- Create 3-5 floorcovering products
- Add realistic prices and inventory
- Use descriptive SKUs (e.g., "OAK-001")

## 📦 Dependencies Added

In `package.json`, I added:

```json
{
  "scripts": {
    "test:odoo": "tsx scripts/test-odoo-connection.ts"
  },
  "devDependencies": {
    "tsx": "^4.7.0",
    "dotenv": "^16.4.5"
  }
}
```

Run `npm install` to install these.

## ✨ Ready to Connect?

**Start here**: Open `QUICKSTART_ODOO.md` and follow the steps!

```bash
# Quick command reference
npm install                              # Install dependencies
cp .env.example .env.local              # Create config
npm run test:odoo                        # Test connection
bash scripts/switch-to-real-odoo.sh     # Switch to real
npm run dev                              # Start app
```

Good luck! 🚀
