import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  IoSaveOutline,
  IoBusinessOutline,
  IoShareSocialOutline
} from "react-icons/io5";
import { Toaster } from "@/components/ui/toaster";

import { useSettings, AppConfig } from "@/contexts/SettingsContext";

const Settings = () => {
  const { config, loading: fetching, updateConfig } = useSettings();
  const [saving, setSaving] = useState(false);
  
  const [localConfig, setLocalConfig] = useState<AppConfig>(config);

  // Sync local config when context config loads
  useEffect(() => {
    if (config) {
        setLocalConfig(config);
    }
  }, [config]);

  const handleChange = (field: keyof AppConfig, value: any) => {
    setLocalConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateConfig(localConfig);
    } catch (error) {
      // Toast already handled in context
    } finally {
      setSaving(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  if (fetching) {
     return <div className="p-8 text-center">Cargando configuración...</div>;
  }

  return (
    <motion.div 
      className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <Toaster />
      
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
          Configuración
        </h1>
        <p className="text-muted-foreground text-lg">
          Personaliza y administra tu negocio
        </p>
      </div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <IoBusinessOutline className="text-primary" />
              Información del Negocio
            </CardTitle>
            <CardDescription>
              Datos principales de tu autolavado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre_negocio">Nombre del Negocio</Label>
              <Input 
                id="nombre_negocio" 
                value={localConfig.nombre_negocio || ''} 
                onChange={(e) => handleChange('nombre_negocio', e.target.value)}
                placeholder="Ej. Autolavado Gochi"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rif">RIF / Identificación</Label>
              <Input 
                id="rif" 
                value={localConfig.rif || ''} 
                onChange={(e) => handleChange('rif', e.target.value)}
                placeholder="J-12345678-9"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Input 
                id="direccion" 
                value={localConfig.direccion || ''} 
                onChange={(e) => handleChange('direccion', e.target.value)}
                placeholder="Dirección del local"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <IoShareSocialOutline className="text-primary" />
              Contacto
            </CardTitle>
            <CardDescription>
              Información de contacto para tus clientes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input 
                id="telefono" 
                value={localConfig.telefono || ''} 
                onChange={(e) => handleChange('telefono', e.target.value)}
                placeholder="0412-1234567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input 
                id="email" 
                type="email"
                value={localConfig.email || ''} 
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="contacto@ejemplo.com"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div 
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
      >
        <Button 
          onClick={handleSave} 
          disabled={saving}
          size="lg"
          className="rounded-full h-14 px-8 gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-xl shadow-primary/30 transition-all duration-300 hover:scale-105"
        >
          <IoSaveOutline className="h-6 w-6" />
          {saving ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </motion.div>
      
      {/* Spacer for FAB */}
      <div className="h-20"></div>
    </motion.div>
  );
};

export default Settings;
