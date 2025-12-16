import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface Vehicle {
  id: number;
  cliente_id: number;
  tipo: string;
  placa: string;
  imagenes: string[];
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phones: string[]; // Changed from single phone to array (max 3)
  status: "VIP" | "Regular" | "Normal";
  visits: number;
  image?: string;
  vehicles?: Vehicle[]; // Changed from individual vehicle fields to array
}

interface CustomerContextType {
  customers: Customer[];
  loading: boolean;
  addCustomer: (customer: Omit<Customer, 'id' | 'visits' | 'vehicles'>) => Promise<number | null>; // Returns ID
  updateCustomer: (id: number, updates: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: number) => Promise<void>;
  refreshCustomers: () => Promise<void>;
  uploadImage: (file: File) => Promise<string>;
  // Vehicle operations
  addVehicle: (clienteId: number, vehicle: Omit<Vehicle, 'id' | 'cliente_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateVehicle: (vehicleId: number, updates: Partial<Omit<Vehicle, 'id' | 'cliente_id' | 'created_at' | 'updated_at'>>) => Promise<void>;
  deleteVehicle: (vehicleId: number) => Promise<void>;
  uploadVehicleImage: (file: File) => Promise<string>;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export const CustomerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const mapSupabaseToCustomer = (data: any, vehicles: Vehicle[]): Customer => ({
    id: data.id,
    name: data.nombre,
    email: data.email,
    phones: data.telefonos || [],
    status: data.estado,
    visits: data.visitas,
    image: data.imagen_url,
    vehicles: vehicles.filter(v => v.cliente_id === data.id)
  });

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      
      // Fetch customers and vehicles separately, then combine
      const [customersResult, vehiclesResult] = await Promise.all([
        supabase
          .from('clientes')
          .select('*')
          .order('id', { ascending: false }),
        supabase
          .from('vehiculos')
          .select('*')
          .order('cliente_id', { ascending: false })
      ]);

      if (customersResult.error) throw customersResult.error;
      if (vehiclesResult.error) throw vehiclesResult.error;

      const vehicles: Vehicle[] = (vehiclesResult.data || []).map((v: any) => ({
        id: v.id,
        cliente_id: v.cliente_id,
        tipo: v.tipo,
        placa: v.placa,
        imagenes: v.imagenes || [],
        created_at: v.created_at,
        updated_at: v.updated_at
      }));

      setCustomers(customersResult.data?.map(data => mapSupabaseToCustomer(data, vehicles)) || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const uploadImage = async (file: File): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('clientes')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('clientes')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error('Error al subir imagen: ' + error.message);
      throw error;
    }
  };

  const addCustomer = async (customerData: Omit<Customer, 'id' | 'visits' | 'vehicles'>): Promise<number | null> => {
    try {
      const dbData = {
        nombre: customerData.name,
        email: customerData.email,
        telefonos: customerData.phones || [],
        estado: customerData.status,
        imagen_url: customerData.image,
        visitas: 0
      };

      const { data, error } = await supabase.from('clientes').insert([dbData]).select().single();

      if (error) throw error;

      toast.success('Cliente agregado correctamente');
      await fetchCustomers();
      return data.id;
    } catch (error: any) {
      console.error('Error adding customer:', error);
      toast.error('Error al agregar cliente: ' + error.message);
      return null;
    }
  };

  const updateCustomer = async (id: number, updates: Partial<Customer>) => {
    try {
      const dbUpdates: any = {};
      if (updates.name) dbUpdates.nombre = updates.name;
      if (updates.email) dbUpdates.email = updates.email;
      if (updates.phones) dbUpdates.telefonos = updates.phones;
      if (updates.status) dbUpdates.estado = updates.status;
      if (updates.image) dbUpdates.imagen_url = updates.image;
      if (updates.visits !== undefined) dbUpdates.visitas = updates.visits;

      const { error } = await supabase
        .from('clientes')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;

      toast.success('Cliente actualizado correctamente');
      await fetchCustomers();
    } catch (error: any) {
      console.error('Error updating customer:', error);
      toast.error('Error al actualizar cliente: ' + error.message);
      throw error;
    }
  };

  const deleteCustomer = async (id: number) => {
    try {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Cliente eliminado correctamente');
      await fetchCustomers();
    } catch (error: any) {
      console.error('Error deleting customer:', error);
      toast.error('Error al eliminar cliente: ' + error.message);
      throw error;
    }
  };

  // =====================================================
  // VEHICLE CRUD OPERATIONS
  // =====================================================
  
  const uploadVehicleImage = async (file: File): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('vehiculos')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('vehiculos')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error: any) {
      console.error('Error uploading vehicle image:', error);
      toast.error('Error al subir imagen del vehículo: ' + error.message);
      throw error;
    }
  };

  const addVehicle = async (
    clienteId: number,
    vehicle: Omit<Vehicle, 'id' | 'cliente_id' | 'created_at' | 'updated_at'>
  ) => {
    try {
      const dbData = {
        cliente_id: clienteId,
        tipo: vehicle.tipo,
        placa: vehicle.placa,
        imagenes: vehicle.imagenes || []
      };

      const { error } = await supabase.from('vehiculos').insert([dbData]);

      if (error) throw error;

      toast.success('Vehículo agregado correctamente');
      await fetchCustomers();
    } catch (error: any) {
      console.error('Error adding vehicle:', error);
      toast.error('Error al agregar vehículo: ' + error.message);
      throw error;
    }
  };

  const updateVehicle = async (
    vehicleId: number,
    updates: Partial<Omit<Vehicle, 'id' | 'cliente_id' | 'created_at' | 'updated_at'>>
  ) => {
    try {
      const dbUpdates: any = {};
      if (updates.tipo) dbUpdates.tipo = updates.tipo;
      if (updates.placa) dbUpdates.placa = updates.placa;
      if (updates.imagenes) dbUpdates.imagenes = updates.imagenes;

      const { error } = await supabase
        .from('vehiculos')
        .update(dbUpdates)
        .eq('id', vehicleId);

      if (error) throw error;

      toast.success('Vehículo actualizado correctamente');
      await fetchCustomers();
    } catch (error: any) {
      console.error('Error updating vehicle:', error);
      toast.error('Error al actualizar vehículo: ' + error.message);
      throw error;
    }
  };

  const deleteVehicle = async (vehicleId: number) => {
    try {
      const { error } = await supabase
        .from('vehiculos')
        .delete()
        .eq('id', vehicleId);

      if (error) throw error;

      toast.success('Vehículo eliminado correctamente');
      await fetchCustomers();
    } catch (error: any) {
      console.error('Error deleting vehicle:', error);
      toast.error('Error al eliminar vehículo: ' + error.message);
      throw error;
    }
  };

  return (
    <CustomerContext.Provider
      value={{
        customers,
        loading,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        refreshCustomers: fetchCustomers,
        uploadImage,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        uploadVehicleImage
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomers = () => {
  const context = useContext(CustomerContext);
  if (context === undefined) {
    throw new Error('useCustomers must be used within a CustomerProvider');
  }
  return context;
};
