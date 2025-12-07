import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Movement {
  id: number;
  type: "entry" | "exit";
  productId: number;
  productName: string;
  quantity: number;
  date: string;
  reason: string;
}

interface CartItem {
  id: string;
  type: "service" | "product";
  itemId: number;
  name: string;
  price: number;
  quantity: number;
}

interface MovementContextType {
  movements: Movement[];
  addMovement: (movement: Omit<Movement, 'id' | 'date'>) => void;
  registerSaleMovements: (saleId: string, cartItems: CartItem[]) => void;
}

const MovementContext = createContext<MovementContextType | undefined>(undefined);

const initialMovements: Movement[] = [
  {
    id: 1,
    type: "entry",
    productId: 1,
    productName: "Cera Premium",
    quantity: 50,
    date: "2024-12-01",
    reason: "Compra inicial de inventario",
  },
  {
    id: 2,
    type: "exit",
    productId: 2,
    productName: "Shampoo Automotriz",
    quantity: 10,
    date: "2024-12-01",
    reason: "Venta a cliente mayorista",
  },
];

export const MovementProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [movements, setMovements] = useState<Movement[]>(() => {
    const stored = localStorage.getItem('movements');
    return stored ? JSON.parse(stored) : initialMovements;
  });

  useEffect(() => {
    localStorage.setItem('movements', JSON.stringify(movements));
  }, [movements]);

  const addMovement = (movement: Omit<Movement, 'id' | 'date'>) => {
    const newMovement: Movement = {
      ...movement,
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
    };
    setMovements(prev => [newMovement, ...prev]);
  };

  const registerSaleMovements = (saleId: string, cartItems: CartItem[]) => {
    const productItems = cartItems.filter(item => item.type === "product");
    
    const newMovements = productItems.map(item => ({
      id: Date.now() + Math.random(), // Ensure unique IDs
      type: "exit" as const,
      productId: item.itemId,
      productName: item.name,
      quantity: item.quantity,
      date: new Date().toISOString().split('T')[0],
      reason: `Venta ${saleId}`,
    }));

    setMovements(prev => [...newMovements, ...prev]);
  };

  return (
    <MovementContext.Provider
      value={{
        movements,
        addMovement,
        registerSaleMovements,
      }}
    >
      {children}
    </MovementContext.Provider>
  );
};

export const useMovements = () => {
  const context = useContext(MovementContext);
  if (context === undefined) {
    throw new Error('useMovements must be used within a MovementProvider');
  }
  return context;
};
