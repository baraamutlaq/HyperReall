export enum UserRole {
  BUYER = 'BUYER',
  SELLER = 'SELLER',
  ADMIN = 'ADMIN'
}

export type ProductShape = 'box' | 'cylinder' | 'sphere' | 'plane' | 'custom';

export interface Product {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[]; // Base64 strings
  modelData: {
    shape: ProductShape;
    textureMap: string; // Usually the first image
    generatedAt: string;
    analysis?: string; // AI analysis of the material/structure
    objData?: string; // URL or DataURI of the .obj file
  };
  createdAt: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
}

export interface AIAnalysisResult {
  title: string;
  description: string;
  category: string;
  estimatedPrice: number;
  shape: ProductShape;
  materialAnalysis: string;
}