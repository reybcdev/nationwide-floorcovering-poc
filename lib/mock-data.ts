// Mock data for Nationwide Floorcovering POC

export interface Product {
  id: string
  name: string
  category: 'hardwood' | 'carpet' | 'vinyl' | 'other'
  price: number
  pricePerSqFt: number
  image: string
  images: string[]
  description: string
  specifications: {
    material?: string
    thickness?: string
    width?: string
    length?: string
    finish?: string
    color: string
    durabilityRating?: number
    moistureResistance?: string
    scratchResistance?: string
    roomSuitability?: string[]
    installation?: string
    warranty?: string
  }
  inStock: boolean
  rating: number
  reviewCount: number
  brand: string
  certifications: string[]
}

export interface Review {
  id: string
  productId: string
  userId: string
  userName: string
  verifiedPurchase: boolean
  overallRating: number
  detailedRatings: {
    durability: number
    appearance: number
    value: number
    installationEase: number
  }
  title: string
  content: string
  photos: string[]
  helpfulVotes: number
  createdAt: string
}

export interface Installer {
  id: string
  name: string
  rating: number
  reviewCount: number
  certifications: string[]
  location: string
  zipCode: string
  distance: number
  specialties: string[]
  yearsExperience: number
  phone: string
  email: string
}

export const products: Product[] = [
  {
    id: '1',
    name: 'Premium Oak Hardwood Flooring',
    category: 'hardwood',
    price: 8.99,
    pricePerSqFt: 8.99,
    image: 'https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=800&h=600&fit=crop',
    ],
    description: 'Beautiful premium oak hardwood flooring perfect for high-traffic areas. Features a natural grain pattern and exceptional durability.',
    specifications: {
      material: 'Solid Oak',
      thickness: '3/4 inch',
      width: '5 inch',
      length: 'Random lengths up to 8 feet',
      finish: 'Matte',
      color: 'Natural Oak',
      durabilityRating: 5,
      moistureResistance: 'Medium',
      scratchResistance: 'High',
      roomSuitability: ['Living Room', 'Dining Room', 'Bedroom', 'Office'],
      installation: 'Nail-down or glue-down',
      warranty: '50 years',
    },
    inStock: true,
    rating: 4.8,
    reviewCount: 127,
    brand: 'Premier Hardwoods',
    certifications: ['FSC Certified', 'FloorScore'],
  },
  {
    id: '2',
    name: 'Luxury Plush Carpet - Beige',
    category: 'carpet',
    price: 3.99,
    pricePerSqFt: 3.99,
    image: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1615529182904-14819c35db37?w=800&h=600&fit=crop',
    ],
    description: 'Ultra-soft luxury plush carpet that adds warmth and comfort to any room. Stain-resistant and perfect for bedrooms.',
    specifications: {
      material: 'Nylon',
      thickness: '1/2 inch',
      color: 'Warm Beige',
      durabilityRating: 4,
      moistureResistance: 'Low',
      scratchResistance: 'N/A',
      roomSuitability: ['Bedroom', 'Living Room', 'Basement'],
      installation: 'Stretch-in',
      warranty: '20 years',
    },
    inStock: true,
    rating: 4.6,
    reviewCount: 89,
    brand: 'SoftStep Carpets',
    certifications: ['Green Label Plus', 'CRI Certified'],
  },
  {
    id: '3',
    name: 'Waterproof Luxury Vinyl Plank - Gray Oak',
    category: 'vinyl',
    price: 4.49,
    pricePerSqFt: 4.49,
    image: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop',
    ],
    description: '100% waterproof luxury vinyl plank with realistic wood grain texture. Perfect for kitchens and bathrooms.',
    specifications: {
      material: 'Rigid Core LVP',
      thickness: '8mm',
      width: '7 inch',
      length: '48 inch',
      finish: 'Textured',
      color: 'Gray Oak',
      durabilityRating: 5,
      moistureResistance: 'Waterproof',
      scratchResistance: 'Very High',
      roomSuitability: ['Kitchen', 'Bathroom', 'Basement', 'Laundry Room'],
      installation: 'Click-lock floating',
      warranty: '25 years residential',
    },
    inStock: true,
    rating: 4.9,
    reviewCount: 203,
    brand: 'AquaCore',
    certifications: ['FloorScore', 'Phthalate-Free'],
  },
  {
    id: '4',
    name: 'Walnut Engineered Hardwood',
    category: 'hardwood',
    price: 7.49,
    pricePerSqFt: 7.49,
    image: 'https://images.unsplash.com/photo-1615876234886-fd9a39fda97f?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1615876234886-fd9a39fda97f?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=800&h=600&fit=crop',
    ],
    description: 'Rich walnut engineered hardwood with multi-layer construction for enhanced stability.',
    specifications: {
      material: 'Engineered Walnut',
      thickness: '1/2 inch',
      width: '6 inch',
      length: 'Random lengths',
      finish: 'Semi-gloss',
      color: 'Dark Walnut',
      durabilityRating: 4,
      moistureResistance: 'Medium-High',
      scratchResistance: 'High',
      roomSuitability: ['Living Room', 'Dining Room', 'Office', 'Bedroom'],
      installation: 'Float, glue, or nail',
      warranty: '35 years',
    },
    inStock: true,
    rating: 4.7,
    reviewCount: 156,
    brand: 'Premier Hardwoods',
    certifications: ['FSC Certified', 'CARB2 Compliant'],
  },
  {
    id: '5',
    name: 'Commercial Grade Loop Carpet - Charcoal',
    category: 'carpet',
    price: 2.99,
    pricePerSqFt: 2.99,
    image: 'https://images.unsplash.com/photo-1634712282287-14ed57b9cc89?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1634712282287-14ed57b9cc89?w=800&h=600&fit=crop',
    ],
    description: 'Durable commercial-grade loop carpet perfect for high-traffic areas. Stain and fade resistant.',
    specifications: {
      material: 'Solution-dyed Nylon',
      thickness: '3/8 inch',
      color: 'Charcoal Gray',
      durabilityRating: 5,
      moistureResistance: 'Low',
      scratchResistance: 'N/A',
      roomSuitability: ['Office', 'Commercial', 'Basement', 'Hallways'],
      installation: 'Glue-down',
      warranty: '15 years',
    },
    inStock: true,
    rating: 4.5,
    reviewCount: 67,
    brand: 'ToughTraffic',
    certifications: ['Green Label Plus'],
  },
  {
    id: '6',
    name: 'Stone Look Luxury Vinyl Tile',
    category: 'vinyl',
    price: 5.29,
    pricePerSqFt: 5.29,
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop',
    ],
    description: 'Realistic stone-look luxury vinyl tile with excellent water resistance. Ideal for modern interiors.',
    specifications: {
      material: 'WPC Vinyl',
      thickness: '6mm',
      width: '12 inch',
      length: '24 inch',
      finish: 'Matte',
      color: 'Gray Stone',
      durabilityRating: 4,
      moistureResistance: 'Waterproof',
      scratchResistance: 'High',
      roomSuitability: ['Kitchen', 'Bathroom', 'Entryway', 'Living Room'],
      installation: 'Click-lock or glue-down',
      warranty: '20 years',
    },
    inStock: false,
    rating: 4.4,
    reviewCount: 43,
    brand: 'StoneCore',
    certifications: ['FloorScore', 'Low VOC'],
  },
]

export const reviews: Review[] = [
  {
    id: 'r1',
    productId: '1',
    userId: 'u1',
    userName: 'Sarah Johnson',
    verifiedPurchase: true,
    overallRating: 5,
    detailedRatings: {
      durability: 5,
      appearance: 5,
      value: 4,
      installationEase: 4,
    },
    title: 'Beautiful flooring, exceeded expectations',
    content: 'Installed this oak flooring in our living room and dining room. The natural grain is stunning and it has held up perfectly with two dogs and three kids. Professional installer said it was high quality material.',
    photos: [],
    helpfulVotes: 24,
    createdAt: '2024-09-15',
  },
  {
    id: 'r2',
    productId: '1',
    userId: 'u2',
    userName: 'Mike Davidson',
    verifiedPurchase: true,
    overallRating: 4,
    detailedRatings: {
      durability: 5,
      appearance: 5,
      value: 3,
      installationEase: 3,
    },
    title: 'Great quality but pricey',
    content: 'The flooring itself is excellent quality. Installation was straightforward for my contractor. Only downside is the price, but you get what you pay for.',
    photos: [],
    helpfulVotes: 12,
    createdAt: '2024-08-22',
  },
  {
    id: 'r3',
    productId: '3',
    userId: 'u3',
    userName: 'Jennifer Lee',
    verifiedPurchase: true,
    overallRating: 5,
    detailedRatings: {
      durability: 5,
      appearance: 5,
      value: 5,
      installationEase: 5,
    },
    title: 'Perfect for bathroom renovation',
    content: 'We installed this in our bathroom and it looks amazing! Completely waterproof and the click-lock system made installation easy. Looks just like real wood.',
    photos: [],
    helpfulVotes: 45,
    createdAt: '2024-10-01',
  },
]

export const installers: Installer[] = [
  {
    id: 'i1',
    name: 'Professional Flooring Solutions',
    rating: 4.9,
    reviewCount: 342,
    certifications: ['NWFA Certified', 'Master Installer'],
    location: 'Downtown Area',
    zipCode: '10001',
    distance: 2.5,
    specialties: ['Hardwood', 'Vinyl', 'Refinishing'],
    yearsExperience: 15,
    phone: '(555) 123-4567',
    email: 'info@proflooringsolutions.com',
  },
  {
    id: 'i2',
    name: 'Elite Carpet & Flooring',
    rating: 4.7,
    reviewCount: 198,
    certifications: ['CRI Certified', 'CFI Master'],
    location: 'North Side',
    zipCode: '10002',
    distance: 5.2,
    specialties: ['Carpet', 'Hardwood', 'Commercial'],
    yearsExperience: 12,
    phone: '(555) 234-5678',
    email: 'contact@elitecarpet.com',
  },
  {
    id: 'i3',
    name: 'Waterproof Flooring Experts',
    rating: 4.8,
    reviewCount: 156,
    certifications: ['LVT Specialist', 'Waterproofing Pro'],
    location: 'West End',
    zipCode: '10003',
    distance: 7.8,
    specialties: ['Vinyl', 'LVT', 'Waterproofing'],
    yearsExperience: 8,
    phone: '(555) 345-6789',
    email: 'hello@waterprooffloor.com',
  },
]
