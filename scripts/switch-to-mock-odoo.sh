#!/bin/bash

# Script to switch from real Odoo client back to mock service
# Usage: bash scripts/switch-to-mock-odoo.sh

echo "🔄 Switching API routes from Real Odoo to Mock Service..."

# Colors for output
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Update products route
echo "📝 Updating app/api/odoo/products/route.ts..."
sed -i "s/import { getOdooClient } from '@\/lib\/odoo\/client'/import { getMockOdooService } from '@\/lib\/odoo\/mock-service'/g" app/api/odoo/products/route.ts
sed -i 's/const odooClient = getOdooClient()/const odooService = getMockOdooService()/g' app/api/odoo/products/route.ts
sed -i 's/odooClient\./odooService./g' app/api/odoo/products/route.ts
echo -e "${GREEN}✓ Updated products route${NC}"

# Update orders route
echo "📝 Updating app/api/odoo/orders/route.ts..."
sed -i "s/import { getOdooClient } from '@\/lib\/odoo\/client'/import { getMockOdooService } from '@\/lib\/odoo\/mock-service'/g" app/api/odoo/orders/route.ts
sed -i 's/const odooClient = getOdooClient()/const odooService = getMockOdooService()/g' app/api/odoo/orders/route.ts
sed -i 's/odooClient\./odooService./g' app/api/odoo/orders/route.ts
echo -e "${GREEN}✓ Updated orders route${NC}"

# Update partners route
echo "📝 Updating app/api/odoo/partners/route.ts..."
sed -i "s/import { getOdooClient } from '@\/lib\/odoo\/client'/import { getMockOdooService } from '@\/lib\/odoo\/mock-service'/g" app/api/odoo/partners/route.ts
sed -i 's/const odooClient = getOdooClient()/const odooService = getMockOdooService()/g' app/api/odoo/partners/route.ts
sed -i 's/odooClient\./odooService./g' app/api/odoo/partners/route.ts
echo -e "${GREEN}✓ Updated partners route${NC}"

# Update sync route if it exists
if [ -f app/api/odoo/sync/route.ts ]; then
    echo "📝 Updating app/api/odoo/sync/route.ts..."
    sed -i "s/import { getOdooClient } from '@\/lib\/odoo\/client'/import { getMockOdooService } from '@\/lib\/odoo\/mock-service'/g" app/api/odoo/sync/route.ts
    sed -i 's/const odooClient = getOdooClient()/const odooService = getMockOdooService()/g' app/api/odoo/sync/route.ts
    sed -i 's/odooClient\./odooService./g' app/api/odoo/sync/route.ts
    echo -e "${GREEN}✓ Updated sync route${NC}"
fi

echo ""
echo -e "${GREEN}✅ Successfully switched to Mock Odoo Service!${NC}"
echo ""
echo "The app will now use simulated Odoo data for demos/testing."
echo "To connect to real Odoo, run: bash scripts/switch-to-real-odoo.sh"
