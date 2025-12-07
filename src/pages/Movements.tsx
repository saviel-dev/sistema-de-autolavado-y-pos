import { useState } from "react";
import { motion, Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { 
  IoAddOutline, 
  IoArrowUpOutline,
  IoArrowDownOutline,
  IoSwapHorizontalOutline,
  IoScanOutline,
  IoBarcodeOutline
} from "react-icons/io5";
import BarcodeScanner from "@/components/BarcodeScanner";
import { formatBarcode } from "@/lib/barcodeUtils";
import { useProducts } from "@/contexts/ProductContext";
import { useMovements } from "@/contexts/MovementContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Toaster } from "@/components/ui/toaster";

interface Movement {
  id: number;
  type: "entry" | "exit";
  productId: number;
  productName: string;
  quantity: number;
  date: string;
  reason: string;
}

// Datos de ejemplo
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

const Movements = () => {
  const { products, updateStock } = useProducts();
  const { movements, addMovement } = useMovements();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: "entry" as "entry" | "exit",
    productId: "",
    productName: "",
    quantity: "",
    reason: "",
  });
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === "productId") {
      const selectedProduct = products.find(p => p.id === parseInt(value));
      setFormData(prev => ({
        ...prev,
        productId: value,
        productName: selectedProduct?.name || ""
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSaveMovement = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.productId || !formData.quantity || !formData.reason) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos obligatorios.",
        variant: "destructive",
      });
      return;
    }

    const quantity = parseInt(formData.quantity);
    if (quantity <= 0) {
      toast({
        title: "Error",
        description: "La cantidad debe ser mayor a cero.",
        variant: "destructive",
      });
      return;
    }

    // Registrar movimiento
    addMovement({
      type: formData.type,
      productId: parseInt(formData.productId),
      productName: formData.productName,
      quantity: quantity,
      reason: formData.reason,
    });

    // Actualizar stock
    updateStock(
      parseInt(formData.productId),
      quantity,
      formData.type === 'entry' ? 'add' : 'subtract'
    );
    
    toast({
      title: formData.type === "entry" ? "Entrada registrada" : "Salida registrada",
      description: `Se ha registrado ${formData.type === "entry" ? "la entrada" : "la salida"} exitosamente.`,
    });

    setFormData({
      type: "entry",
      productId: "",
      productName: "",
      quantity: "",
      reason: "",
    });
    setIsDialogOpen(false);
  };

  const handleAddNewClick = () => {
    setFormData({
      type: "entry",
      productId: "",
      productName: "",
      quantity: "",
      reason: "",
    });
    setIsDialogOpen(true);
  };

  const handleBarcodeScanned = (barcode: string) => {
    // Buscar producto por código de barras
    const product = products.find(p => p.barcode === barcode);
    
    if (product) {
      setFormData(prev => ({
        ...prev,
        productId: product.id.toString(),
        productName: product.name
      }));
      toast({
        title: "Producto encontrado",
        description: `${product.name} seleccionado`,
      });
    } else {
      toast({
        title: "Producto no encontrado",
        description: "No existe un producto con ese código de barras",
        variant: "destructive",
      });
    }
  };

  // Filter movements
  const filteredMovements = movements.filter(movement => {
    if (filterType === "all") return true;
    return movement.type === filterType;
  });

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number = 0) => ({
      opacity: 1,
      y: 0,
      transition: { 
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
        delay: i * 0.1
      }
    })
  };

  return (
    <div className="p-4 md:p-6">
      <Toaster />
      <motion.div 
        className="space-y-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Movimientos</h1>
            <p className="text-sm md:text-base text-muted-foreground">Registra entradas y salidas de inventario</p>
          </div>
          <motion.div variants={itemVariants}>
            <Button 
              onClick={handleAddNewClick} 
              className="gap-2 w-full md:w-auto"
            >
              <IoAddOutline className="h-5 w-5" />
              Nuevo Movimiento
            </Button>
          </motion.div>
        </div>

        <motion.div 
          className="flex flex-col md:flex-row gap-4"
          variants={itemVariants}
        >
          <div className="w-full md:w-64">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="all">Todos los movimientos</option>
              <option value="entry">Solo entradas</option>
              <option value="exit">Solo salidas</option>
            </select>
          </div>
        </motion.div>

        {/* Vista de tabla para desktop */}
        <motion.div 
          className="hidden lg:block rounded-md border overflow-hidden shadow-sm"
          variants={itemVariants}
        >
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  <th className="h-12 px-4 text-center align-middle font-medium">Tipo</th>
                  <th className="h-12 px-4 text-center align-middle font-medium">Producto</th>
                  <th className="h-12 px-4 text-center align-middle font-medium">Cantidad</th>
                  <th className="h-12 px-4 text-center align-middle font-medium">Fecha</th>
                  <th className="h-12 px-4 text-center align-middle font-medium">Motivo</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {filteredMovements.map((movement, index) => (
                  <motion.tr 
                    key={movement.id} 
                    className="border-b transition-colors hover:bg-muted/50"
                    custom={index}
                    variants={itemVariants}
                  >
                    <td className="p-4 text-center align-middle">
                      <Badge 
                        className={`gap-1 ${
                          movement.type === "entry" 
                            ? "bg-green-100 text-green-800 hover:bg-green-100" 
                            : "bg-red-100 text-red-800 hover:bg-red-100"
                        }`}
                      >
                        {movement.type === "entry" ? (
                          <>
                            <IoArrowUpOutline className="h-3 w-3" />
                            Entrada
                          </>
                        ) : (
                          <>
                            <IoArrowDownOutline className="h-3 w-3" />
                            Salida
                          </>
                        )}
                      </Badge>
                    </td>
                    <td className="p-4 text-center align-middle font-medium">
                      <div className="flex items-center justify-center gap-2">
                        <IoSwapHorizontalOutline className="h-5 w-5 text-primary" />
                        <span>{movement.productName}</span>
                      </div>
                    </td>
                    <td className="p-4 text-center align-middle font-semibold">
                      {movement.type === "entry" ? "+" : "-"}{movement.quantity}
                    </td>
                    <td className="p-4 text-center align-middle text-muted-foreground">
                      {new Date(movement.date).toLocaleDateString('es-ES')}
                    </td>
                    <td className="p-4 text-center align-middle text-muted-foreground">
                      {movement.reason}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Vista de cards para móvil y tablet */}
        <motion.div className="lg:hidden space-y-4" variants={itemVariants}>
          {filteredMovements.map((movement, index) => (
            <motion.div
              key={movement.id}
              custom={index}
              variants={itemVariants}
              className="bg-card border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-1">
                    <IoSwapHorizontalOutline className="h-5 w-5 text-primary flex-shrink-0" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-base break-words">{movement.productName}</h3>
                      <Badge 
                        className={`gap-1 ${
                          movement.type === "entry" 
                            ? "bg-green-100 text-green-800 hover:bg-green-100" 
                            : "bg-red-100 text-red-800 hover:bg-red-100"
                        }`}
                      >
                        {movement.type === "entry" ? (
                          <>
                            <IoArrowUpOutline className="h-3 w-3" />
                            Entrada
                          </>
                        ) : (
                          <>
                            <IoArrowDownOutline className="h-3 w-3" />
                            Salida
                          </>
                        )}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {movement.reason}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t">
                <div className="space-y-1">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Cantidad: </span>
                    <span className={`font-bold ${movement.type === "entry" ? "text-green-600" : "text-red-600"}`}>
                      {movement.type === "entry" ? "+" : "-"}{movement.quantity}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(movement.date).toLocaleDateString('es-ES')}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => !open && setIsDialogOpen(false)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Nuevo Movimiento</DialogTitle>
              <DialogDescription>
                Registra una entrada o salida de inventario.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Tipo <span className="text-destructive">*</span>
                </Label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="col-span-3 h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="entry">Entrada</option>
                  <option value="exit">Salida</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="productId" className="text-right">
                  Producto <span className="text-destructive">*</span>
                </Label>
                <div className="col-span-3 space-y-2">
                  <div className="flex gap-2">
                    <select
                      id="productId"
                      name="productId"
                      value={formData.productId}
                      onChange={handleInputChange}
                      className="flex-1 h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="">Seleccionar producto...</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                          {product.barcode && ` - ${formatBarcode(product.barcode)}`}
                        </option>
                      ))}
                    </select>
                    <Button 
                      type="button" 
                      variant="outline"
                      size="icon"
                      onClick={() => setIsScannerOpen(true)}
                    >
                      <IoScanOutline className="h-4 w-4" />
                    </Button>
                  </div>
                  {formData.productId && products.find(p => p.id === parseInt(formData.productId))?.barcode && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <IoBarcodeOutline className="h-4 w-4" />
                      <span className="font-mono">
                        {formatBarcode(products.find(p => p.id === parseInt(formData.productId))?.barcode || "")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quantity" className="text-right">
                  Cantidad <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="0"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="reason" className="text-right">
                  Motivo <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="Ej. Compra de inventario, Venta, Ajuste..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" onClick={(e) => handleSaveMovement(e)}>
                Guardar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <BarcodeScanner
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          onScan={handleBarcodeScanned}
          title="Escanear Producto"
        />
      </motion.div>
    </div>
  );
};

export default Movements;
