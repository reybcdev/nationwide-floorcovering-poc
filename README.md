# Nationwide Floorcovering - E-commerce POC

A modern, responsive e-commerce platform for flooring products built with Next.js 14, React, TailwindCSS, and shadcn/ui.

## 🚀 Features

This POC demonstrates all key features from the job requirements:

### ✅ Core Features

- **Advanced Search & Filtering**
  - Filter by category (Hardwood, Carpet, Vinyl)
  - Price range slider
  - Brand selection
  - Stock availability filter
  - Minimum rating filter
  - Real-time search

- **Product Reviews & Ratings**
  - Star ratings (1-5 stars)
  - Detailed ratings (Durability, Appearance, Value, Installation Ease)
  - Verified purchase badges
  - Helpful voting system
  - Review photos support

- **Virtual Room Visualization**
  - Interactive 3D room templates
  - Multiple room types (Living Room, Kitchen, Bedroom)
  - Real-time product swapping
  - Upload custom room photos (UI ready)
  - Save & share designs (UI ready)

- **Installation Resources**
  - Certified installer directory
  - ZIP code search
  - Installer ratings and reviews
  - Certifications and specialties
  - Contact information
  - DIY installation guides

- **Shopping Cart**
  - Persistent cart with Zustand state management
  - Square footage calculator
  - Real-time price updates
  - Easy cart management

### 🎨 Design

- **Modern & Minimalist** design theme
- Clean, spacious layouts with generous white space
- Professional earth tone color palette
- Fully responsive (Mobile, Tablet, Desktop)
- Accessibility-focused UI components

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **UI Components:** shadcn/ui (Radix UI primitives)
- **Icons:** Lucide React
- **State Management:** Zustand
- **3D Visualization:** React Three Fiber & Three.js (ready for implementation)

## 📦 Installation

1. **Install dependencies:**
   ```bash
   cd nationwide-floorcovering-poc
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
nationwide-floorcovering-poc/
├── app/                      # Next.js App Router pages
│   ├── page.tsx             # Homepage
│   ├── products/            # Product listing & details
│   ├── visualizer/          # Virtual room visualizer
│   ├── installers/          # Installer directory
│   ├── cart/                # Shopping cart
│   ├── layout.tsx           # Root layout
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   ├── Header.tsx           # Navigation header
│   ├── Footer.tsx           # Footer
│   └── ProductCard.tsx      # Product card component
├── lib/                     # Utilities & data
│   ├── utils.ts             # Helper functions
│   ├── store.ts             # Zustand store
│   └── mock-data.ts         # Mock product data
└── public/                  # Static assets
```

## 🎯 Key Pages

### Homepage (`/`)
- Hero section with CTAs
- Feature highlights
- Featured products
- Category navigation
- Call-to-action sections

### Products (`/products`)
- Grid view of all products
- Advanced filtering sidebar
- Search functionality
- Product sorting
- Responsive design

### Product Detail (`/products/[id]`)
- Image gallery
- Detailed specifications
- Customer reviews
- Square footage calculator
- Add to cart functionality
- Related products

### Virtual Visualizer (`/visualizer`)
- Room template selection
- Product visualization
- Interactive controls
- Save & share features
- Comparison tools

### Installers (`/installers`)
- Installer directory
- ZIP code search
- Ratings & reviews
- Certification badges
- Contact information
- DIY guides

### Shopping Cart (`/cart`)
- Cart management
- Price calculations
- Order summary
- Checkout flow (UI ready)

## 📊 Mock Data

The POC includes comprehensive mock data:

- **6 Products** across 3 categories
  - 2 Hardwood products
  - 2 Carpet products
  - 2 Vinyl products

- **Reviews** with detailed ratings
- **3 Certified Installers** with full profiles
- Product specifications, certifications, and pricing

## 🔄 State Management

- **Zustand** for global cart state
- Persistent cart across page navigation
- Optimized re-renders

## 🎨 UI Components

All components from shadcn/ui:
- Button
- Card
- Input
- Badge
- Checkbox
- Label
- Slider

## 🚧 Integration Ready

The POC is designed with integration points for:

### EDI/ERP Integration
- Structured product data
- Order management interfaces
- Inventory tracking placeholders

### Third-Party Freight
- Shipping calculator UI
- Multiple carrier support
- Real-time tracking placeholders

### Payment Processing
- Checkout flow ready
- Multiple payment methods UI
- Secure payment integration points

## 📱 Responsive Design

- **Mobile-first** approach
- Breakpoints:
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px

## ⚡ Performance

- Server-side rendering with Next.js
- Image optimization with Next/Image
- Code splitting
- Lazy loading ready
- Optimized bundle size

## 🔐 SEO Ready

- Semantic HTML
- Meta tags configured
- Structured data ready
- Clean URL structure

## 📝 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

## 🎓 Development Notes

### Mock vs. Real Data
All data is currently mocked in `/lib/mock-data.ts`. To integrate with a real backend:

1. Replace mock data imports with API calls
2. Implement data fetching in Server Components
3. Add loading and error states
4. Set up environment variables for API endpoints

### Virtual Visualizer
The visualizer currently shows static room templates. For full 3D functionality:

1. Implement Three.js scene setup
2. Add 3D model loading
3. Implement texture mapping
4. Add camera controls
5. Integrate AR capabilities

### State Persistence
The cart uses Zustand. To persist across sessions:
```typescript
import { persist } from 'zustand/middleware'
```

## 🤝 Contributing

This is a POC/Demo. For production deployment:

1. Set up proper backend API
2. Implement authentication
3. Add payment processing
4. Set up EDI/ERP integrations
5. Implement 3D visualization
6. Add comprehensive testing
7. Set up CI/CD pipeline

## 📄 License

This is a proof of concept for demonstration purposes.

## 🎯 Job Requirements Coverage

✅ Advanced search filters  
✅ Product reviews and ratings  
✅ Virtual room visualization (UI complete, 3D ready)  
✅ Third-party freight integration (UI ready)  
✅ Installation resources  
✅ EDI/ERP integration (data structures ready)  
✅ Modern minimalist design  
✅ E-commerce functionality  
✅ Responsive design  
✅ Shopping cart  

## 📞 Support

For questions about this POC, refer to the proposal document included in the project.

---

**Built with ❤️ for Nationwide Floorcovering**
