import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface Movement {
  id: number;
  created_at: string;
  item_id: number;
  item_type: 'product' | 'consumable';
  item_name: string;
  type: 'entrada' | 'salida';
  quantity: number;
  reason: string;
  user_id?: string;
}

interface MovementContextType {
  movements: Movement[];
  loading: boolean;
  addMovement: (movement: Omit<Movement, 'id' | 'created_at'>) => Promise<void>;
  refreshMovements: () => Promise<void>;
}

const MovementContext = createContext<MovementContextType | undefined>(undefined);

export const MovementProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMovements = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('movimientos')
        .select(`
          *,
          productos (
            nombre
          )
        `)
        .order('fecha', { ascending: false });

      if (error) {
        console.warn('Error fetching movements:', error);
        return;
      }

      const mappedMovements: Movement[] = data.map((m: any) => ({
        id: m.id,
        created_at: m.fecha,
        item_id: m.producto_id,
        item_type: 'product', // Currently table only supports products
        item_name: m.productos?.nombre || 'Producto desconocido',
        type: m.tipo,
        quantity: m.cantidad,
        reason: m.motivo,
      }));

      setMovements(mappedMovements);
    } catch (error) {
      console.error('Error fetching movements:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, []);

  const addMovement = async (movement: Omit<Movement, 'id' | 'created_at'>) => {
    try {
      const { error } = await supabase
        .from('movimientos')
        .insert([movement]);

      if (error) throw error;

      toast.success('Movimiento registrado exitosamente');
      await fetchMovements();
    } catch (error) {
      console.error('Error adding movement:', error);
      toast.error('Error al registrar movimiento');
      throw error;
    }
  };

  return (
    <MovementContext.Provider value={{ movements, loading, addMovement, refreshMovements: fetchMovements }}>
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
