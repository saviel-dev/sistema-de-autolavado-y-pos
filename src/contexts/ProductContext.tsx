import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  image: string;
  category: string;
  stock: number;
  barcode?: string;
}

interface ProductContextType {
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (id: number, updates: Partial<Product>) => void;
  deleteProduct: (id: number) => void;
  updateStock: (productId: number, quantity: number, type: 'add' | 'subtract') => void;
  getProductById: (id: number) => Product | undefined;
  getProductByBarcode: (barcode: string) => Product | undefined;
  checkStockAvailability: (productId: number, quantity: number) => boolean;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const initialProducts: Product[] = [
  {
    id: 1,
    name: "Cera Premium",
    description: "Cera de alta calidad para protección y brillo duradero",
    price: "15",
    image: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=400&h=300&fit=crop",
    category: "Cuidado",
    stock: 25,
    barcode: "7501234567890",
  },
  {
    id: 2,
    name: "Shampoo Automotriz",
    description: "Shampoo concentrado pH neutro para lavado profesional",
    price: "8",
    image: "https://images.unsplash.com/photo-1563298723-dcfebaa392e3?w=400&h=300&fit=crop",
    category: "Limpieza",
    stock: 40,
    barcode: "7501234567906",
  },
  {
    id: 3,
    name: "Microfibra Premium",
    description: "Paños de microfibra ultra absorbentes",
    price: "5",
    image: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=400&h=300&fit=crop",
    category: "Accesorios",
    stock: 60,
    barcode: "7501234567913",
  },
  {
    id: 4,
    name: "Aromatizante",
    description: "Aromatizante de larga duración",
    price: "3",
    image: "https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=400&h=300&fit=crop",
    category: "Accesorios",
    stock: 50,
    barcode: "7501234567920",
  },
];

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    const stored = localStorage.getItem('products');
    return stored ? JSON.parse(stored) : initialProducts;
  });

  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  const addProduct = (product: Product) => {
    setProducts(prev => [...prev, product]);
  };

  const updateProduct = (id: number, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProduct = (id: number) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const updateStock = (productId: number, quantity: number, type: 'add' | 'subtract') => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const newStock = type === 'add' 
          ? p.stock + quantity 
          : Math.max(0, p.stock - quantity);
        return { ...p, stock: newStock };
      }
      return p;
    }));
  };

  const getProductById = (id: number): Product | undefined => {
    return products.find(p => p.id === id);
  };

  const getProductByBarcode = (barcode: string): Product | undefined => {
    return products.find(p => p.barcode === barcode);
  };

  const checkStockAvailability = (productId: number, quantity: number): boolean => {
    const product = getProductById(productId);
    return product ? product.stock >= quantity : false;
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        updateStock,
        getProductById,
        getProductByBarcode,
        checkStockAvailability,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
