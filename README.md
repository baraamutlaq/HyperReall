<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# HyperReall - 3D Product Marketplace

A modern web application that enables buyers and sellers to interact with 3D product models before making purchase decisions. Users can view detailed 3D visualizations of products, read AI-generated product analyses, and manage their marketplace presence.

## Features

- **3D Product Visualization**: Interactive 3D models using Three.js with support for multiple shapes (box, cylinder, sphere, plane, custom)
- **AI-Powered Product Analysis**: Leverages Google Gemini API to automatically analyze products, determine categories, estimate pricing, and assess materials
- **Multi-Role User System**: Support for Buyers, Sellers, and Admins with tailored dashboards
- **Buyer Catalog**: Browse and filter products with detailed views and shopping cart functionality
- **Seller Dashboard**: Manage product listings with AI assistance for product insights
- **Real-time 3D Material Analysis**: View texture-mapped models and AI-generated material/structure analysis

## Tech Stack

- **Frontend**: React 18.3 + TypeScript + Vite
- **3D Rendering**: Three.js with @react-three/fiber
- **AI Integration**: Google Genai API
- **Routing**: React Router DOM
- **UI Components**: Lucide React Icons

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Google Gemini API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/baraa0abd/HyperReall.git
   cd HyperReall
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure your Gemini API key:
   - Create a `.env.local` file in the project root
   - Add your API key: `VITE_GEMINI_API_KEY=your_api_key_here`

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the app for production
- `npm run preview` - Preview the production build

## Project Structure

```
src/
├── components/       # React components
│   ├── BuyerCatalog.tsx
│   ├── SellerDashboard.tsx
│   ├── ProductDetail.tsx
│   ├── ThreeViewer.tsx
│   ├── ProductCard.tsx
│   └── Navbar.tsx
├── services/        # API and external service integrations
│   └── geminiService.ts
├── types.ts        # TypeScript type definitions
├── App.tsx         # Main app component
└── index.tsx       # Entry point
```

## License

MIT
