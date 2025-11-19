#!/bin/bash

# Test EDI 856 (Advance Ship Notice) Generation
echo "🚚 Testing EDI 856 Generation..."
echo ""

curl -X POST http://localhost:3000/api/shipping/notify \
  -H "Content-Type: application/json" \
  -d '{
    "shipmentId": "SHP-TEST-001",
    "purchaseOrderNumber": "WEB-1234567890",
    "invoiceNumber": "INV-1234567890",
    "carrier": "FEDEX",
    "trackingNumber": "7ABC123456789",
    "serviceLevel": "FedEx Ground",
    "shipDate": "2024-11-19",
    "shipFrom": {
      "name": "Nationwide Floorcovering",
      "address": "123 Flooring Street",
      "city": "New York",
      "state": "NY",
      "zip": "10001"
    },
    "shipTo": {
      "name": "John Smith",
      "address": "456 Oak Avenue",
      "city": "Los Angeles",
      "state": "CA",
      "zip": "90001"
    },
    "packages": [
      {
        "packageNumber": "PKG-001",
        "trackingNumber": "7ABC123456789",
        "weight": 120,
        "dimensions": {
          "length": 48,
          "width": 12,
          "height": 6
        }
      }
    ],
    "items": [
      {
        "sku": "VINEYARD-PINOT",
        "name": "VINEYARD - PINOT Hardwood Floor",
        "quantity": 100
      }
    ]
  }' | jq .

echo ""
echo "✅ Check the response above for EDI 856 document!"
echo "📄 Look for 'edi856X12' field with X12 formatted EDI"
