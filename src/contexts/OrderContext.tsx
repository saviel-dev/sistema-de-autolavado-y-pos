import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface OrderItem {
  id?: number;
  serviceId: number;
  serviceName?: string;
  price: number;
}

export interface Order {
  id: number;
  customerId: number;
  customerName: string;
  customerImage?: string;
  vehicleId?: number; // New field
  vehiclePlate?: string; // New field
  vehicleType?: string; // New field
  type: 'walk-in' | 'appointment';
  status: 'Pendiente' | 'Confirmada' | 'En Proceso' | 'Completada' | 'Cancelada';
  date?: string; // Scheduled date for appointments
  time?: string; // Scheduled time for appointments
  total: number;
  notes?: string;
  items: OrderItem[];
  createdAt: string;
}

interface CreateOrderDTO {
  customerId: number;
  vehicleId?: number; // New field
  type: 'walk-in' | 'appointment';
  status: Order['status'];
  date?: string;
  time?: string;
  notes?: string;
  items: { serviceId: number; price: number }[];
}

interface OrderContextType {
  orders: Order[];
  loading: boolean;
  refreshOrders: () => Promise<void>;
  createOrder: (order: CreateOrderDTO) => Promise<boolean>;
  updateOrder: (id: number, updates: Partial<Order>) => Promise<boolean>;
  updateOrderStatus: (id: number, status: Order['status']) => Promise<boolean>;

  deleteOrder: (id: number) => Promise<boolean>;
  getOrderByVehicle: (vehicleId: number) => Promise<Order | null>; // New method
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pedidos')
        .select(`
          *,
          clientes (
            nombre,
            imagen_url
          ),
          vehiculos (
            id,
            placa,
            tipo
          ),
          detalle_pedidos (
            id,
            servicio_id,
            precio_unitario,
            servicios (
              nombre
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedOrders: Order[] = data.map((order: any) => ({
          id: order.id,
          customerId: order.cliente_id,
          customerName: order.clientes?.nombre || 'Cliente Desconocido',
          customerImage: order.clientes?.imagen_url,
          vehicleId: order.vehiculo_id || order.vehiculos?.id,
          vehiclePlate: order.vehiculos?.placa,
          vehicleType: order.vehiculos?.tipo,
          type: order.tipo,
          status: order.estado,
          date: order.fecha_programada,
          time: order.hora_programada,
          total: order.total,
          notes: order.notas,
          createdAt: order.created_at,
          items: order.detalle_pedidos.map((detail: any) => ({
            id: detail.id,
            serviceId: detail.servicio_id,
            serviceName: detail.servicios?.nombre || 'Servicio',
            price: detail.precio_unitario,
          }))
        }));
        setOrders(formattedOrders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel('orders_channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pedidos' },
        () => fetchOrders()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const refreshOrders = async () => {
    await fetchOrders();
  };

  const createOrder = async (orderData: CreateOrderDTO): Promise<boolean> => {
    try {
      // Calculate total
      const total = orderData.items.reduce((sum, item) => sum + item.price, 0);

      // 1. Insert Order
      const { data: newOrder, error: orderError } = await supabase
        .from('pedidos')
        .insert([{
          cliente_id: orderData.customerId,
          vehiculo_id: orderData.vehicleId || null, // Create with vehicle
          tipo: orderData.type,
          estado: orderData.status,
          fecha_programada: orderData.date || null,
          hora_programada: orderData.time || null,
          total: total,
          notas: orderData.notes
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Insert Details
      if (orderData.items.length > 0) {
        const details = orderData.items.map(item => ({
          pedido_id: newOrder.id,
          servicio_id: item.serviceId,
          precio_unitario: item.price
        }));

        const { error: detailsError } = await supabase
          .from('detalle_pedidos')
          .insert(details);

        if (detailsError) throw detailsError;
      }

      toast.success('Pedido creado exitosamente');
      return true;
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Error al crear el pedido');
      return false;
    }
  };

  const updateOrder = async (id: number, updates: Partial<Order>): Promise<boolean> => {
    try {
        // Map frontend fields to DB fields if necessary, or just handle status/notes
        // For now simplifying to simple updates on the main table
        const dbUpdates: any = {};
        if (updates.status) dbUpdates.estado = updates.status;
        if (updates.notes) dbUpdates.notas = updates.notes;
        if (updates.date) dbUpdates.fecha_programada = updates.date;
        if (updates.time) dbUpdates.hora_programada = updates.time;
        
        const { error } = await supabase
            .from('pedidos')
            .update(dbUpdates)
            .eq('id', id);

        if (error) throw error;
        toast.success('Pedido actualizado');
        return true;
    } catch (error) {
        console.error("Error updating order", error);
        toast.error("Error al actualizar");
        return false;
    }
  };

  const updateOrderStatus = async (id: number, status: Order['status']): Promise<boolean> => {
      return updateOrder(id, { status });
  };

  const deleteOrder = async (id: number): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('pedidos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Pedido eliminado');
      return true;
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Error al eliminar pedido');
      return false;
    }
  };

  const getOrderByVehicle = async (vehicleId: number): Promise<Order | null> => {
    try {
        const today = new Date().toISOString().split('T')[0];
        
        // Find orders for this vehicle that are active (Pendiente/En Proceso) 
        // AND match today's date (either created_at or schedule date)
        const { data, error } = await supabase
            .from('pedidos')
            .select(`
              *,
              clientes (
                nombre,
                imagen_url
              ),
              vehiculos (
                id,
                placa,
                tipo
              ),
              detalle_pedidos (
                id,
                servicio_id,
                precio_unitario,
                servicios (
                  nombre
                )
              )
            `)
            .eq('vehiculo_id', vehicleId)
            .in('estado', ['Pendiente', 'En Proceso', 'Confirmada']) // Include Confirmada for appointments
            .gte('created_at', `${today}T00:00:00`)
            .lte('created_at', `${today}T23:59:59`)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) throw error;
        
        if (!data) return null;

        // Check if it's an appointment (future date) that matches today
        if (data.tipo === 'appointment' && data.fecha_programada !== today) {
             // If appointment date is not today, we might skip it or handle logic differently.
             // For now simple logic: if it's strictly for today.
             // Usually operations work on current day.
        }

        return {
          id: data.id,
          customerId: data.cliente_id,
          customerName: data.clientes?.nombre || 'Cliente Desconocido',
          customerImage: data.clientes?.imagen_url,
          vehicleId: data.vehiculo_id || data.vehiculos?.id,
          vehiclePlate: data.vehiculos?.placa,
          vehicleType: data.vehiculos?.tipo,
          type: data.tipo,
          status: data.estado,
          date: data.fecha_programada,
          time: data.hora_programada,
          total: data.total,
          notes: data.notas,
          createdAt: data.created_at,
          items: data.detalle_pedidos.map((detail: any) => ({
            id: detail.id,
            serviceId: detail.servicio_id,
            serviceName: detail.servicios?.nombre || 'Servicio',
            price: detail.precio_unitario,
          }))
        };
    } catch (error) {
        console.error("Error getting order by vehicle", error);
        return null;
    }
  };

  return (
    <OrderContext.Provider value={{ 
      orders, 
      loading, 
      refreshOrders, 
      createOrder, 
      updateOrder, 
      updateOrderStatus,

      deleteOrder,
      getOrderByVehicle // Export method
    }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};
