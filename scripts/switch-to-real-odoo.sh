#!/bin/bash

# Script to switch from mock Odoo service to real Odoo client
# Usage: bash scripts/switch-to-real-odoo.sh

echo "🔄 Switching API routes from Mock Odoo to Real Odoo Client..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${YELLOW}⚠️  Warning: .env.local not found${NC}"
    echo "Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo -e "${GREEN}✓ Created .env.local${NC}"
    echo ""
    echo "Please edit .env.local with your Odoo trial credentials:"
    echo "  ODOO_URL=https://yourcompany.odoo.com"
    echo "  ODOO_DB=yourcompany"
    echo "  ODOO_USERNAME=your-email@example.com"
    echo "  ODOO_PASSWORD=your-password"
    echo ""
fi

# Update products route
echo "📝 Updating app/api/odoo/products/route.ts..."
sed -i "s/import { getMockOdooService } from '@\/lib\/odoo\/mock-service'/import { getOdooClient } from '@\/lib\/odoo\/client'/g" app/api/odoo/products/route.ts
sed -i 's/const odooService = getMockOdooService()/const odooClient = getOdooClient()/g' app/api/odoo/products/route.ts
sed -i 's/odooService\./odooClient./g' app/api/odoo/products/route.ts
echo -e "${GREEN}✓ Updated products route${NC}"

# Update orders route
echo "📝 Updating app/api/odoo/orders/route.ts..."
sed -i "s/import { getMockOdooService } from '@\/lib\/odoo\/mock-service'/import { getOdooClient } from '@\/lib\/odoo\/client'/g" app/api/odoo/orders/route.ts
sed -i 's/const odooService = getMockOdooService()/const odooClient = getOdooClient()/g' app/api/odoo/orders/route.ts
sed -i 's/odooService\./odooClient./g' app/api/odoo/orders/route.ts
echo -e "${GREEN}✓ Updated orders route${NC}"

# Update partners route
echo "📝 Updating app/api/odoo/partners/route.ts..."
sed -i "s/import { getMockOdooService } from '@\/lib\/odoo\/mock-service'/import { getOdooClient } from '@\/lib\/odoo\/client'/g" app/api/odoo/partners/route.ts
sed -i 's/const odooService = getMockOdooService()/const odooClient = getOdooClient()/g' app/api/odoo/partners/route.ts
sed -i 's/odooService\./odooClient./g' app/api/odoo/partners/route.ts
echo -e "${GREEN}✓ Updated partners route${NC}"

# Update sync route if it exists
if [ -f app/api/odoo/sync/route.ts ]; then
    echo "📝 Updating app/api/odoo/sync/route.ts..."
    sed -i "s/import { getMockOdooService } from '@\/lib\/odoo\/mock-service'/import { getOdooClient } from '@\/lib\/odoo\/client'/g" app/api/odoo/sync/route.ts
    sed -i 's/const odooService = getMockOdooService()/const odooClient = getOdooClient()/g' app/api/odoo/sync/route.ts
    sed -i 's/odooService\./odooClient./g' app/api/odoo/sync/route.ts
    echo -e "${GREEN}✓ Updated sync route${NC}"
fi

echo ""
echo -e "${GREEN}✅ Successfully switched to Real Odoo Client!${NC}"
echo ""
echo "Next steps:"
echo "1. Edit .env.local with your Odoo trial credentials"
echo "2. Restart your development server: npm run dev"
echo "3. Test the connection at: http://localhost:3000/admin/odoo"
echo ""
echo "To switch back to mock service, run: bash scripts/switch-to-mock-odoo.sh"
