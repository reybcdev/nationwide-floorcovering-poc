# Quick Start: Connect to Odoo Trial in 5 Minutes

This guide gets you connected to your Odoo trial instance in just a few steps.

## ⚡ Quick Steps

### 1. Install Dependencies (if needed)

```bash
cd /media/Store/DEV/NTSprint/Nationwide\ Floorcovering/nationwide-floorcovering-poc
npm install
```

### 2. Create Environment Configuration

```bash
# Copy the example environment file
cp .env.example .env.local
```

### 3. Edit .env.local

Open `.env.local` and add your Odoo trial credentials:

```env
ODOO_URL=https://yourcompany.odoo.com
ODOO_DB=yourcompany
ODOO_USERNAME=your-email@example.com
ODOO_PASSWORD=your-password
```

**How to find these values:**

| Variable | Where to Find |
|----------|---------------|
| `ODOO_URL` | The web address you use to access Odoo (e.g., `https://demo123.odoo.com`) |
| `ODOO_DB` | Usually your company name, visible during Odoo login |
| `ODOO_USERNAME` | Your Odoo login email |
| `ODOO_PASSWORD` | Your Odoo account password |

### 4. Test the Connection

```bash
npm run test:odoo
```

Expected output:
```
🧪 Odoo Connection Test Suite
==================================================
🔐 Testing authentication...
   URL: https://yourcompany.odoo.com
   Database: yourcompany
   Username: your-email@example.com
✅ Authentication successful!
   User ID: 2

📦 Testing product fetch...
✅ Product fetch successful!
   Found 5 products
```

### 5. Switch to Real Odoo

```bash
bash scripts/switch-to-real-odoo.sh
```

This automatically updates all API routes to use your real Odoo instance.

### 6. Start the App

```bash
npm run dev
```

Visit: **http://localhost:3000**

### 7. Verify Integration

Go to the admin dashboard: **http://localhost:3000/admin/odoo**

You should see:
- ✅ Connection status
- ✅ Your Odoo products
- ✅ Sales orders (if any)
- ✅ Customers (if any)

## 🎉 You're Connected!

Try the full flow:

1. **Browse products** on homepage (loaded from Odoo)
2. **Add to cart**
3. **Checkout** and complete order
4. **Check Odoo** → Sales → Orders to see the new order

## 🔄 Switch Back to Demo Mode

If you want to demo without Odoo:

```bash
bash scripts/switch-to-mock-odoo.sh
npm run dev
```

## ⚠️ Troubleshooting

### Authentication Failed

**Error**: `Authentication failed: No UID returned`

**Fix**:
1. Double-check credentials in `.env.local`
2. Try logging into Odoo web interface with same credentials
3. Ensure no extra spaces in `.env.local`
4. Verify database name is correct (case-sensitive)

### Connection Refused

**Error**: `ECONNREFUSED` or `Cannot connect to Odoo`

**Fix**:
1. Check if Odoo URL is correct
2. Ensure trial hasn't expired
3. Try accessing Odoo URL in browser
4. Check firewall/network settings

### No Products Found

**Error**: `Found 0 products`

**Fix**:
1. Add products in Odoo: **Sales → Products → Create**
2. Ensure products have:
   - ✓ "Can be Sold" enabled
   - ✓ Sales Price set
   - ✓ SKU/Internal Reference
3. Refresh the test: `npm run test:odoo`

## 📚 Additional Resources

- **Full Integration Guide**: See `ODOO_INTEGRATION.md`
- **Detailed Setup**: See `CONNECT_TO_ODOO_TRIAL.md`
- **API Documentation**: See API routes in `app/api/odoo/`

## 🆘 Need Help?

1. Run connection test: `npm run test:odoo`
2. Check browser console for errors
3. Check terminal for API errors
4. Review Odoo logs (if accessible)

## 🔐 Security Reminder

- ✓ Never commit `.env.local` to git
- ✓ Use strong passwords
- ✓ Enable 2FA on Odoo account
- ✓ Create dedicated API user for production

---

**Ready?** Start with Step 1 above! 🚀
