import { useState } from "react";
import { motion, Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { 
  IoAddOutline, 
  IoTrashOutline, 
  IoPencilOutline, 
  IoCubeOutline,
  IoReloadOutline,
  IoWarningOutline,
  IoImageOutline,
  IoSearchOutline
} from "react-icons/io5";
import { useConsumables, Consumable } from "@/contexts/ConsumablesContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Toaster } from "@/components/ui/toaster";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const Consumables = () => {
  const { consumables, loading, addConsumable, updateConsumable, deleteConsumable, refreshConsumables } = useConsumables();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    stock: "",
    unit: "unidades",
    minStock: "",
    cost: ""
  });
  
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      stock: "",
      unit: "unidades",
      minStock: "",
      cost: ""
    });
    setEditingId(null);
  };

  const handleAddNewClick = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEditClick = (item: Consumable) => {
    setFormData({
      name: item.name,
      description: item.description || "",
      stock: item.stock.toString(),
      unit: item.unit,
      minStock: item.minStock.toString(),
      cost: item.cost.toString()
    });
    setEditingId(item.id);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.stock || !formData.cost) {
      toast({
        title: "Error",
        description: "Por favor complete los campos obligatorios.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const consumableData = {
        name: formData.name,
        description: formData.description,
        stock: parseInt(formData.stock) || 0,
        unit: formData.unit,
        minStock: parseInt(formData.minStock) || 0,
        cost: parseFloat(formData.cost) || 0
      };

      if (editingId !== null) {
        await updateConsumable(editingId, consumableData);
      } else {
        await addConsumable(consumableData);
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      // Error handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if(confirm("¿Estás seguro de que quieres eliminar este insumo?")) {
      await deleteConsumable(id);
    }
  };

  const filteredConsumables = consumables.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLowStock = showLowStockOnly ? item.stock <= item.minStock : true;
    
    return matchesSearch && matchesLowStock;
  });

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Toaster />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold">Insumos</h1>
            <Button variant="ghost" size="icon" onClick={() => refreshConsumables()} disabled={loading}>
              <IoReloadOutline className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <p className="text-sm md:text-base text-muted-foreground">Gestiona el inventario de insumos y materiales</p>
        </div>
        <Button 
          onClick={handleAddNewClick} 
          className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md hover:shadow-lg transition-all"
        >
          <IoAddOutline className="h-5 w-5" />
          Nuevo Insumo
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 w-full md:max-w-md bg-background border rounded-lg px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-primary/20">
          <IoSearchOutline className="text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar insumos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none flex-1 text-sm"
          />
        </div>
        
        <Button
          variant={showLowStockOnly ? "destructive" : "outline"}
          onClick={() => setShowLowStockOnly(!showLowStockOnly)}
          className="gap-2 w-full md:w-auto"
        >
          <IoWarningOutline className={showLowStockOnly ? "animate-pulse" : ""} />
          {showLowStockOnly ? "Mostrar Todos" : "Filtrar Bajo Stock"}
        </Button>
      </div>

      {/* Table Content */}
      <div className="rounded-md border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-purple-600 hover:bg-purple-600">
            <TableRow className="hover:bg-purple-600 border-none">
              <TableHead className="text-white font-semibold">Nombre / Descripción</TableHead>
              <TableHead className="text-center text-white font-semibold">Stock / Unidad</TableHead>
              <TableHead className="text-center text-white font-semibold">Costo</TableHead>
              <TableHead className="text-center text-white font-semibold">Estado</TableHead>
              <TableHead className="text-right text-white font-semibold">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="h-4 w-32 bg-muted animate-pulse mb-2" />
                    <div className="h-3 w-20 bg-muted animate-pulse" />
                  </TableCell>
                  <TableCell><div className="h-4 w-16 bg-muted animate-pulse mx-auto" /></TableCell>
                  <TableCell><div className="h-4 w-12 bg-muted animate-pulse mx-auto" /></TableCell>
                  <TableCell><div className="h-6 w-20 bg-muted animate-pulse rounded-full mx-auto" /></TableCell>
                  <TableCell className="text-right"><div className="h-8 w-8 bg-muted animate-pulse inline-block rounded" /></TableCell>
                </TableRow>
              ))
            ) : filteredConsumables.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No se encontraron insumos.
                </TableCell>
              </TableRow>
            ) : (
              filteredConsumables.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <div className="font-medium text-base">{item.name}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">{item.description}</div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="font-semibold">{item.stock}</div>
                    <div className="text-xs text-muted-foreground">{item.unit}</div>
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    ${item.cost.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      {item.stock <= item.minStock ? (
                        <Badge variant="destructive" className="gap-1">
                          <IoWarningOutline /> Bajo Stock
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200">
                          Normal
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(item)}>
                        <IoPencilOutline className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(item.id)}>
                        <IoTrashOutline className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId !== null ? 'Editar Insumo' : 'Nuevo Insumo'}
            </DialogTitle>
            <DialogDescription>
              Complete la información del insumo a continuación.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2 col-span-2">
                  <Label htmlFor="name">Nombre del Insumo *</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required placeholder="Ej. Champú Automotriz" />
               </div>
               
               <div className="space-y-2 col-span-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} placeholder="Detalles del producto..." />
               </div>

               <div className="space-y-2">
                  <Label htmlFor="stock">Stock Actual *</Label>
                  <Input id="stock" name="stock" type="number" value={formData.stock} onChange={handleInputChange} required min="0" />
               </div>

               <div className="space-y-2">
                  <Label htmlFor="unit">Unidad de Medida</Label>
                  <select
                    id="unit"
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="unidades">Unidades</option>
                    <option value="litros">Litros</option>
                    <option value="mililitros">Mililitros</option>
                    <option value="galones">Galones</option>
                    <option value="gramos">Gramos</option>
                    <option value="kilos">Kilos</option>
                    <option value="cajas">Cajas</option>
                    <option value="paquetes">Paquetes</option>
                  </select>
               </div>

               <div className="space-y-2">
                  <Label htmlFor="minStock">Stock Mínimo</Label>
                  <Input id="minStock" name="minStock" type="number" value={formData.minStock} onChange={handleInputChange} min="0" placeholder="Avisar si baja de..." />
               </div>

               <div className="space-y-2">
                  <Label htmlFor="cost">Costo Unitario ($) *</Label>
                  <Input id="cost" name="cost" type="number" step="0.01" value={formData.cost} onChange={handleInputChange} required min="0" placeholder="0.00" />
               </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
                {isSubmitting ? (
                  <>
                    <IoReloadOutline className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar Insumo'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Consumables;
