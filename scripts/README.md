# Odoo Integration Scripts

This folder contains utility scripts to help you connect and manage your Odoo ERP integration.

## Available Scripts

### 🔄 switch-to-real-odoo.sh

Switches all API routes from the mock Odoo service to your real Odoo trial instance.

**Usage:**
```bash
bash scripts/switch-to-real-odoo.sh
```

**What it does:**
- Updates `app/api/odoo/products/route.ts`
- Updates `app/api/odoo/orders/route.ts`
- Updates `app/api/odoo/partners/route.ts`
- Updates `app/api/odoo/sync/route.ts`
- Changes imports from `mock-service` to `client`
- Changes variable names from `odooService` to `odooClient`

**Prerequisites:**
- `.env.local` file with Odoo credentials must exist
- See `QUICKSTART_ODOO.md` for setup

---

### 🔙 switch-to-mock-odoo.sh

Switches all API routes back to the mock Odoo service for demos/testing.

**Usage:**
```bash
bash scripts/switch-to-mock-odoo.sh
```

**What it does:**
- Reverts all changes made by `switch-to-real-odoo.sh`
- Returns app to demo mode with simulated data
- No Odoo connection required

**Use when:**
- Demoing without internet connection
- Testing without affecting real Odoo data
- Odoo trial has expired
- Developing new features

---

### 🧪 test-odoo-connection.ts

Tests your Odoo trial connection before running the full application.

**Usage:**
```bash
npm run test:odoo
```

Or directly:
```bash
npx tsx scripts/test-odoo-connection.ts
```

**What it tests:**
1. ✅ Authentication with Odoo
2. ✅ Product data fetch
3. ✅ API permissions

**Sample output:**
```
🧪 Odoo Connection Test Suite
==================================================
🔐 Testing authentication...
   URL: https://demo.odoo.com
   Database: demo
   Username: admin@example.com
✅ Authentication successful!
   User ID: 2

📦 Testing product fetch...
✅ Product fetch successful!
   Found 5 products
==================================================

✨ Test complete!
```

**Troubleshooting tips included in output**

---

## Workflow

### First Time Setup

1. **Create environment file:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Odoo credentials
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Test connection:**
   ```bash
   npm run test:odoo
   ```

4. **Switch to real Odoo:**
   ```bash
   bash scripts/switch-to-real-odoo.sh
   ```

5. **Start app:**
   ```bash
   npm run dev
   ```

### Switching Between Mock and Real

**To use real Odoo:**
```bash
bash scripts/switch-to-real-odoo.sh
npm run dev
```

**To use mock data:**
```bash
bash scripts/switch-to-mock-odoo.sh
npm run dev
```

## Common Tasks

### Check if connected to real Odoo

Look for this import in `app/api/odoo/products/route.ts`:

**Real Odoo:**
```typescript
import { getOdooClient } from '@/lib/odoo/client'
```

**Mock Odoo:**
```typescript
import { getMockOdooService } from '@/lib/odoo/mock-service'
```

### Verify Odoo credentials

```bash
npm run test:odoo
```

### Reset to demo mode

```bash
bash scripts/switch-to-mock-odoo.sh
```

## Files Modified by Scripts

The switch scripts modify these files:

- `app/api/odoo/products/route.ts`
- `app/api/odoo/orders/route.ts`
- `app/api/odoo/partners/route.ts`
- `app/api/odoo/sync/route.ts` (if exists)

**Note:** These are search-and-replace operations, so:
- ✓ Safe to run multiple times
- ✓ Reversible
- ✓ No data loss
- ⚠️ Requires consistent naming in route files

## Environment Variables

Required in `.env.local` for real Odoo:

```env
ODOO_URL=https://yourcompany.odoo.com
ODOO_DB=yourcompany
ODOO_USERNAME=your-email@example.com
ODOO_PASSWORD=your-password
```

See `QUICKSTART_ODOO.md` for detailed setup instructions.

## Dependencies

The test script requires:
- `tsx` - TypeScript execution
- `dotenv` - Environment variable loading

Install with:
```bash
npm install
```

These are already added to `package.json` as dev dependencies.

## Tips

💡 **Quick verification:**
```bash
# Test connection
npm run test:odoo

# Switch to real
bash scripts/switch-to-real-odoo.sh

# Start dev server
npm run dev

# Visit admin dashboard
# http://localhost:3000/admin/odoo
```

💡 **Before demo:**
```bash
# Use mock data for offline demos
bash scripts/switch-to-mock-odoo.sh
npm run dev
```

💡 **Debugging:**
- Check `.env.local` exists and has correct values
- Look for TypeScript errors in IDE
- Check browser console for API errors
- Check terminal for server-side errors

## See Also

- `QUICKSTART_ODOO.md` - 5-minute setup guide
- `CONNECT_TO_ODOO_TRIAL.md` - Detailed connection guide
- `ODOO_INTEGRATION.md` - Complete integration documentation
