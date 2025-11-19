/**
 * Test Odoo Connection Script
 * 
 * This script tests your Odoo trial connection before running the full app.
 * 
 * Usage:
 *   npm run test:odoo
 * 
 * Or directly:
 *   npx tsx scripts/test-odoo-connection.ts
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

interface OdooConfig {
  url: string
  db: string
  username: string
  password: string
}

class OdooConnectionTester {
  private config: OdooConfig

  constructor(config: OdooConfig) {
    this.config = config
  }

  /**
   * Test authentication with Odoo
   */
  async testAuthentication(): Promise<{ success: boolean; uid?: number; error?: string }> {
    try {
      console.log('🔐 Testing authentication...')
      console.log(`   URL: ${this.config.url}`)
      console.log(`   Database: ${this.config.db}`)
      console.log(`   Username: ${this.config.username}`)

      const response = await fetch(`${this.config.url}/web/session/authenticate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'call',
          params: {
            db: this.config.db,
            login: this.config.username,
            password: this.config.password,
          },
          id: Math.floor(Math.random() * 1000000),
        }),
      })

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
        }
      }

      const data = await response.json()

      if (data.error) {
        return {
          success: false,
          error: data.error.data?.message || data.error.message || 'Unknown error',
        }
      }

      if (data.result?.uid) {
        return {
          success: true,
          uid: data.result.uid,
        }
      }

      return {
        success: false,
        error: 'No UID returned from authentication',
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Test fetching products
   */
  async testProductsFetch(sessionId: string): Promise<{ success: boolean; count?: number; error?: string }> {
    try {
      console.log('\n📦 Testing product fetch...')

      const response = await fetch(`${this.config.url}/web/dataset/search_read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `session_id=${sessionId}`,
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'call',
          params: {
            model: 'product.product',
            domain: [['sale_ok', '=', true]],
            fields: ['name', 'default_code', 'list_price', 'qty_available'],
            limit: 10,
          },
          id: Math.floor(Math.random() * 1000000),
        }),
      })

      const data = await response.json()

      if (data.error) {
        return {
          success: false,
          error: data.error.data?.message || data.error.message || 'Unknown error',
        }
      }

      const products = data.result?.records || []
      return {
        success: true,
        count: products.length,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Run all tests
   */
  async runTests() {
    console.log('\n🧪 Odoo Connection Test Suite\n')
    console.log('='.repeat(50))

    // Test 1: Authentication
    const authResult = await this.testAuthentication()
    
    if (authResult.success) {
      console.log(`✅ Authentication successful!`)
      console.log(`   User ID: ${authResult.uid}`)
    } else {
      console.log(`❌ Authentication failed!`)
      console.log(`   Error: ${authResult.error}`)
      console.log('\n💡 Troubleshooting tips:')
      console.log('   1. Check your .env.local file exists')
      console.log('   2. Verify ODOO_URL, ODOO_DB, ODOO_USERNAME, ODOO_PASSWORD')
      console.log('   3. Try logging into Odoo web interface with same credentials')
      console.log('   4. Ensure your Odoo trial is still active')
      return
    }

    // Test 2: Fetch Products (we need session_id from auth)
    // For simplicity, we'll re-authenticate to get session_id
    const authResponse = await fetch(`${this.config.url}/web/session/authenticate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'call',
        params: {
          db: this.config.db,
          login: this.config.username,
          password: this.config.password,
        },
        id: 1,
      }),
    })

    const authData = await authResponse.json()
    const sessionId = authData.result?.session_id

    if (sessionId) {
      const productsResult = await this.testProductsFetch(sessionId)
      
      if (productsResult.success) {
        console.log(`✅ Product fetch successful!`)
        console.log(`   Found ${productsResult.count} products`)
        
        if (productsResult.count === 0) {
          console.log('\n⚠️  No products found in Odoo')
          console.log('   Add some products in Odoo: Sales → Products → Create')
        }
      } else {
        console.log(`❌ Product fetch failed!`)
        console.log(`   Error: ${productsResult.error}`)
      }
    }

    console.log('\n' + '='.repeat(50))
    console.log('\n✨ Test complete!')
    console.log('\nNext steps:')
    console.log('   1. Run: bash scripts/switch-to-real-odoo.sh')
    console.log('   2. Start app: npm run dev')
    console.log('   3. Visit: http://localhost:3000/admin/odoo')
    console.log('')
  }
}

// Main execution
async function main() {
  // Check if environment variables are set
  const config: OdooConfig = {
    url: process.env.ODOO_URL || '',
    db: process.env.ODOO_DB || '',
    username: process.env.ODOO_USERNAME || '',
    password: process.env.ODOO_PASSWORD || '',
  }

  // Validate config
  const missing: string[] = []
  if (!config.url) missing.push('ODOO_URL')
  if (!config.db) missing.push('ODOO_DB')
  if (!config.username) missing.push('ODOO_USERNAME')
  if (!config.password) missing.push('ODOO_PASSWORD')

  if (missing.length > 0) {
    console.error('❌ Missing environment variables:', missing.join(', '))
    console.error('\nPlease create .env.local with your Odoo trial credentials:')
    console.error('  ODOO_URL=https://yourcompany.odoo.com')
    console.error('  ODOO_DB=yourcompany')
    console.error('  ODOO_USERNAME=your-email@example.com')
    console.error('  ODOO_PASSWORD=your-password')
    process.exit(1)
  }

  const tester = new OdooConnectionTester(config)
  await tester.runTests()
}

main().catch(console.error)
