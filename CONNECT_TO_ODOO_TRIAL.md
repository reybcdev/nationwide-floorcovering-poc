# Connecting PoC to Your Odoo Trial Instance

This guide will walk you through connecting your e-commerce PoC to your live Odoo trial account.

## Step 1: Get Your Odoo Trial Credentials

From your Odoo trial instance, you'll need:

1. **URL**: Your Odoo instance URL (e.g., `https://yourcompany.odoo.com`)
2. **Database**: Usually your company name or email prefix
3. **Username**: Your login email
4. **Password**: Your Odoo password

### Finding These Values:

- **URL**: This is the address you use to access Odoo (the browser URL)
- **Database**: Often auto-filled during login, or visible in Settings → Technical → Database Structure
- **Username**: The email you use to log into Odoo
- **Password**: Your Odoo account password

## Step 2: Create Environment Configuration

1. Create a `.env.local` file in the project root:

```bash
cd /media/Store/DEV/NTSprint/Nationwide\ Floorcovering/nationwide-floorcovering-poc
cp .env.example .env.local
```

2. Edit `.env.local` with your Odoo trial credentials:

```env
# Replace these with your actual Odoo trial details
ODOO_URL=https://yourcompany.odoo.com
ODOO_DB=yourcompany
ODOO_USERNAME=your-email@example.com
ODOO_PASSWORD=your-odoo-password
```

**Important**: 
- Remove the `#` comments to activate these variables
- Use your exact Odoo trial URL (include `https://`)
- Database name is case-sensitive

## Step 3: Update API Routes to Use Real Odoo Client

You need to switch from the mock service to the real Odoo client in your API routes.

### Files to Update:

1. **`app/api/odoo/products/route.ts`**
2. **`app/api/odoo/orders/route.ts`**
3. **`app/api/odoo/partners/route.ts`**

### Example Change (for products route):

**Before:**
```typescript
import { getMockOdooService } from '@/lib/odoo/mock-service'

export async function GET(request: NextRequest) {
  const odooService = getMockOdooService()
  const products = await odooService.getProducts(limit)
  // ...
}
```

**After:**
```typescript
import { getOdooClient } from '@/lib/odoo/client'

export async function GET(request: NextRequest) {
  const odooClient = getOdooClient()
  const products = await odooClient.getProducts(limit)
  // ...
}
```

## Step 4: Verify Odoo Modules Are Installed

Your Odoo trial should have these modules installed:

- ✓ **Sales** (`sale_management`) - For sales orders
- ✓ **Inventory** (`stock`) - For stock management
- ✓ **eCommerce** (optional) - For product catalog
- ✓ **Contacts** (`contacts`) - For customer management

Most Odoo trials come with these pre-installed, but you can verify:
1. Go to Odoo → Apps
2. Search for each module
3. Ensure they show "Installed"

## Step 5: Test the Connection

### Option A: Quick Connection Test

Create a test script:

```bash
# Test Odoo connection
curl http://localhost:3000/api/odoo/products?limit=5
```

### Option B: Use the Admin Dashboard

1. Start your Next.js app:
```bash
npm run dev
```

2. Visit: `http://localhost:3000/admin/odoo`

3. The dashboard will show:
   - Connection status
   - Products from your Odoo trial
   - Recent orders
   - Customer data

## Step 6: Prepare Your Odoo Trial Data

For the best demo experience, add some products to your Odoo trial:

1. Go to **Sales → Products → Products**
2. Create a few products with:
   - Name (e.g., "Oak Hardwood Flooring")
   - Internal Reference/SKU (e.g., "SKU-001")
   - Sales Price (e.g., $8.99)
   - Available Quantity
   - Mark "Can be Sold" ✓

## Troubleshooting

### Connection Refused Error

**Symptoms**: `ECONNREFUSED` or `Network Error`

**Solutions**:
- Verify your Odoo trial URL is correct
- Ensure your trial hasn't expired
- Check if your firewall allows outbound HTTPS
- Try accessing the Odoo URL in a browser first

### Authentication Failed Error

**Symptoms**: `Authentication failed: No UID returned`

**Solutions**:
- Double-check username and password (case-sensitive)
- Verify database name is correct
- Try logging into Odoo web interface with same credentials
- Check for extra spaces in `.env.local`

### CORS Errors

**Symptoms**: Cross-Origin Request Blocked

**Solutions**:
- Odoo trials should allow CORS by default
- If needed, contact Odoo support to whitelist your domain
- For local dev, this usually isn't an issue

### No Products Returned

**Symptoms**: Empty product list but no errors

**Solutions**:
- Ensure products exist in Odoo (Sales → Products)
- Check products have "Can be Sold" enabled
- Verify products have a sales price set
- Check API user has permission to read products

## API User Permissions (Optional but Recommended)

For production, create a dedicated API user in Odoo:

1. Go to **Settings → Users & Companies → Users**
2. Create new user: `api_user`
3. Assign groups:
   - Sales / User: Own Documents Only
   - Inventory / User
   - Contacts / User
4. Use this user's credentials in `.env.local`

## Testing the Full Flow

Once connected, test the complete integration:

1. **Browse Products**: 
   - Visit homepage
   - Products should load from your Odoo trial
   - Check SKUs match Odoo

2. **Add to Cart**:
   - Add products to cart
   - Verify quantities are checked against Odoo inventory

3. **Checkout**:
   - Fill out customer information
   - Complete order
   - Note the Order ID returned

4. **Verify in Odoo**:
   - Go to Sales → Orders in Odoo
   - Find the newly created order
   - Verify customer and order lines match

## Next Steps

After successful connection:

- [ ] Test product synchronization
- [ ] Test order creation flow
- [ ] Verify customer creation in Odoo
- [ ] Test inventory updates
- [ ] Configure webhooks (for real-time updates)
- [ ] Set up scheduled sync jobs
- [ ] Add error monitoring

## Security Reminders

🔒 **Important**:
- Never commit `.env.local` to git
- Use strong passwords for API users
- Consider using API keys instead of passwords
- Enable 2FA on your Odoo account
- Regularly rotate API credentials

## Need Help?

If you encounter issues:

1. Check the browser console for errors
2. Check Next.js terminal for API errors
3. Review Odoo logs (if accessible)
4. Verify all credentials in `.env.local`
5. Test Odoo API manually using tools like Postman

## Quick Reference

**Environment Variables**:
```env
ODOO_URL=https://yourcompany.odoo.com
ODOO_DB=yourcompany  
ODOO_USERNAME=your-email@example.com
ODOO_PASSWORD=your-password
```

**Key API Endpoints**:
- `GET /api/odoo/products` - Fetch products
- `POST /api/odoo/orders` - Create order
- `GET /api/odoo/partners` - Get customers
- `GET /api/odoo/sync` - Sync status

**Admin Dashboard**: `/admin/odoo`

---

**Ready to connect?** Follow Step 2 to create your `.env.local` file!
