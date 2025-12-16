import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

export interface AppConfig {
  id?: number;
  nombre_negocio: string;
  rif: string;
  telefono: string;
  email: string;
  direccion: string;
  instagram: string;
  facebook: string;
  whatsapp: string;
  hora_apertura: string;
  hora_cierre: string;
  dias_laborables: string[];
}

interface SettingsContextType {
  config: AppConfig;
  loading: boolean;
  updateConfig: (updates: Partial<AppConfig>) => Promise<void>;
  refreshConfig: () => Promise<void>;
}

const defaultSettings: AppConfig = {
    nombre_negocio: '',
    rif: '',
    telefono: '',
    email: '',
    direccion: '',
    instagram: '',
    facebook: '',
    whatsapp: '',
    hora_apertura: '08:00',
    hora_cierre: '18:00',
    dias_laborables: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<AppConfig>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('configuracion')
        .select('*')
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setConfig({
          ...data,
          dias_laborables: data.dias_laborables || []
        });
      }
    } catch (error) {
      console.error('Error fetching config:', error);
      // Silent error or generic toast? POS usually loads on mount, don't spam toast on every reload 
      // barring critical failures. 'Settings' page handled it with a toast.
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const updateConfig = async (updates: Partial<AppConfig>) => {
    try {
      const newConfig = { ...config, ...updates };
      
      // Optimistic update
      setConfig(newConfig);

      const { error } = await supabase
        .from('configuracion')
        .upsert({
          id: 1, // Force ID 1 for singleton config
          ...newConfig,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Configuración guardada",
        description: "Los cambios han sido aplicados correctamente.",
      });
      
      // No need to refetch if we trusted the optimistic update, but good for consistency
      // await fetchConfig(); 
    } catch (error) {
      console.error('Error saving config:', error);
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios.",
        variant: "destructive",
      });
      // Revert on error? For now simple implementation.
      await fetchConfig(); 
      throw error;
    }
  };

  return (
    <SettingsContext.Provider value={{ config, loading, updateConfig, refreshConfig: fetchConfig }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
