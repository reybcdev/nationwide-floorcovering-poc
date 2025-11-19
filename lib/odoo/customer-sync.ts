/**
 * Customer Synchronization Service
 * Syncs customers between e-commerce and Odoo ERP
 */

import { getOdooClient } from './client'
import type { OdooPartner } from './types'

export interface Customer {
  id: string
  odooId?: number
  name: string
  email: string
  phone?: string
  address: {
    street: string
    city: string
    state: string
    zip: string
    country: string
  }
  customerType: 'individual' | 'business'
  taxId?: string
  notes?: string
  lastSyncedAt: string
}

export interface CustomerSyncResult {
  success: boolean
  customerId: number
  message: string
}

/**
 * Create or update customer in Odoo
 */
export async function syncCustomerToOdoo(customer: Customer): Promise<CustomerSyncResult> {
  try {
    const odooClient = getOdooClient()
    
    const partnerData = {
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      street: customer.address.street,
      city: customer.address.city,
      zip: customer.address.zip,
      country_id: customer.address.country === 'US' ? 233 : undefined, // US country ID in Odoo
    }
    
    // Create or get existing partner
    const partnerId = await odooClient.getOrCreatePartner(partnerData)
    
    return {
      success: true,
      customerId: partnerId,
      message: `Customer synced successfully with Odoo ID: ${partnerId}`,
    }
  } catch (error) {
    console.error('Failed to sync customer to Odoo:', error)
    return {
      success: false,
      customerId: 0,
      message: `Failed to sync customer: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}

/**
 * Fetch customer from Odoo by email
 */
export async function getCustomerFromOdoo(email: string): Promise<Customer | null> {
  try {
    const odooClient = getOdooClient()
    
    const partners = await odooClient.searchRead<OdooPartner>({
      model: 'res.partner',
      domain: [['email', '=', email]],
      fields: ['name', 'email', 'phone', 'street', 'city', 'zip', 'country_id', 'vat'],
      limit: 1,
    })
    
    if (partners.length === 0) {
      return null
    }
    
    const partner = partners[0]
    
    return {
      id: `odoo-${partner.id}`,
      odooId: partner.id,
      name: partner.name || '',
      email: partner.email || '',
      phone: partner.phone || undefined,
      address: {
        street: partner.street || '',
        city: partner.city || '',
        state: partner.state_id?.[1] || '',
        zip: partner.zip || '',
        country: partner.country_id?.[1] || 'US',
      },
      customerType: 'individual',
      taxId: partner.vat || undefined,
      lastSyncedAt: new Date().toISOString(),
    }
  } catch (error) {
    console.error('Failed to fetch customer from Odoo:', error)
    return null
  }
}

/**
 * Fetch all customers from Odoo
 */
export async function getAllCustomersFromOdoo(limit = 50): Promise<Customer[]> {
  try {
    const odooClient = getOdooClient()
    
    const partners = await odooClient.searchRead<OdooPartner>({
      model: 'res.partner',
      domain: [['customer_rank', '>', 0]],
      fields: ['name', 'email', 'phone', 'street', 'city', 'zip', 'country_id'],
      limit,
    })
    
    return partners.map(partner => ({
      id: `odoo-${partner.id}`,
      odooId: partner.id,
      name: partner.name || '',
      email: partner.email || '',
      phone: partner.phone || undefined,
      address: {
        street: partner.street || '',
        city: partner.city || '',
        state: partner.state_id?.[1] || '',
        zip: partner.zip || '',
        country: partner.country_id?.[1] || 'US',
      },
      customerType: 'individual',
      lastSyncedAt: new Date().toISOString(),
    }))
  } catch (error) {
    console.error('Failed to fetch customers from Odoo:', error)
    return []
  }
}
