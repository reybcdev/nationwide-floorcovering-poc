import { NextResponse } from 'next/server'

/**
 * GET /api/odoo/test-env
 * Test endpoint to verify Odoo environment variables are loaded
 * (WITHOUT exposing sensitive values)
 */
export async function GET() {
  const config = {
    url: process.env.ODOO_URL ? '✓ Set' : '✗ Missing',
    db: process.env.ODOO_DB ? '✓ Set' : '✗ Missing',
    username: process.env.ODOO_USERNAME ? '✓ Set' : '✗ Missing',
    password: process.env.ODOO_PASSWORD ? '✓ Set' : '✗ Missing',
    // Show masked values for debugging
    urlValue: process.env.ODOO_URL?.replace(/https?:\/\/([^\/]+).*/, 'https://$1'),
    dbValue: process.env.ODOO_DB,
  }

  return NextResponse.json({
    success: true,
    environment: {
      nodeEnv: process.env.NODE_ENV,
      hasEnvLocal: config.url !== '✗ Missing',
    },
    config,
  })
}
