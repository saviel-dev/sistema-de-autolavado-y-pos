import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface WorkerProfile {
  id: string;
  nombre: string;
  email: string;
  role: 'admin' | 'worker';
  created_at?: string;
}

interface WorkerContextType {
  workers: WorkerProfile[];
  loading: boolean;
  refreshWorkers: () => Promise<void>;
  updateWorker: (id: string, updates: Partial<WorkerProfile>) => Promise<void>;
  deleteWorker: (id: string) => Promise<void>;
}

const WorkerContext = createContext<WorkerContextType | undefined>(undefined);

export const WorkerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [workers, setWorkers] = useState<WorkerProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'worker')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setWorkers(data || []);
    } catch (error) {
      console.error('Error fetching workers:', error);
      toast.error('Error al cargar trabajadores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const updateWorker = async (id: string, updates: Partial<WorkerProfile>) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast.success('Trabajador actualizado');
      fetchWorkers();
    } catch (error) {
      console.error('Error updating worker:', error);
      toast.error('Error al actualizar trabajador');
      throw error;
    }
  };

  const deleteWorker = async (id: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Trabajador eliminado');
      fetchWorkers();
    } catch (error) {
      console.error('Error deleting worker:', error);
      toast.error('Error al eliminar trabajador');
      throw error;
    }
  };

  return (
    <WorkerContext.Provider value={{ workers, loading, refreshWorkers: fetchWorkers, updateWorker, deleteWorker }}>
      {children}
    </WorkerContext.Provider>
  );
};

export const useWorkers = () => {
  const context = useContext(WorkerContext);
  if (context === undefined) {
    throw new Error('useWorkers must be used within a WorkerProvider');
  }
  return context;
};
