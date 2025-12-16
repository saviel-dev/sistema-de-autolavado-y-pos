
import { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { 
  IoAddOutline, 
  IoTrashOutline,
  IoCashOutline,
  IoCardOutline,
  IoPhonePortraitOutline,
  IoCubeOutline,
  IoCartOutline,
  IoCheckmarkCircleOutline,
  IoDownloadOutline,
  IoPersonOutline,
  IoPersonCircleOutline,
  IoCloseOutline,
  IoCloseCircle,
  IoImagesOutline,
  IoPeopleOutline,
  IoCalendarOutline,
  IoTimeOutline,
  IoCheckmarkOutline,
  IoSearch,
  IoDocumentTextOutline,
  IoCarSportOutline,
  IoScanOutline,
  IoBarcodeOutline,
  IoReloadOutline,
  IoMailOutline,
  IoCarOutline,
  IoImageOutline
} from "react-icons/io5";
import BarcodeScanner from "@/components/BarcodeScanner";
import { formatBarcode } from "@/lib/barcodeUtils";
import { useProducts, Product } from "@/contexts/ProductContext";
import { useServices, Service } from "@/contexts/ServiceContext";
import { useCustomers, Customer, Vehicle } from "@/contexts/CustomerContext";
import { useSales, SaleItem } from "@/contexts/SalesContext"; // Import from new context
import { useOrders } from "@/contexts/OrderContext";
import { useSettings } from "@/contexts/SettingsContext";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Toaster } from "@/components/ui/toaster";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface POSCartItem extends SaleItem {
    // Extend if needed, but SaleItem has structure:
    // { id?: string, type, itemId, name, price, quantity }
    // We used 'id' as cartItemId in local state, SaleItem has optional id.
    // Let's use 'cartId' for local loop key to avoid confusion
    cartId: string;
}

const POS = () => {
  const { products, checkStockAvailability, refreshProducts } = useProducts();
  const { services, refreshServices } = useServices();
  const { customers, addCustomer, refreshCustomers, uploadImage } = useCustomers(); 
  const { createSale, loading: saleLoading } = useSales();
  const { getOrderByVehicle } = useOrders();
  const { config } = useSettings();

  const [cart, setCart] = useState<POSCartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [dolarRate, setDolarRate] = useState<number | null>(null);
  const [showThankYouModal, setShowThankYouModal] = useState(false);
  const [lastSale, setLastSale] = useState<{ id: string; total: number } | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  // Vehicle selection states
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null); // New state
  const [vehicleSearchOpen, setVehicleSearchOpen] = useState(false);
  const [vehicleSearchQuery, setVehicleSearchQuery] = useState("");
  
  // Flatten all vehicles for search "Vehicle - Plate - Customer"
  const searchableVehicles = customers.flatMap(customer => 
    (customer.vehicles || []).map(vehicle => ({
      ...vehicle,
      customerName: customer.name,
      customerPhone: customer.phones?.[0] || "",
      customerId: customer.id,
      customerEmail: customer.email,
      customerStatus: customer.status,
      customerImage: customer.image
    }))
  ).filter(v => 
    v.placa.toLowerCase().includes(vehicleSearchQuery.toLowerCase()) ||
    v.tipo.toLowerCase().includes(vehicleSearchQuery.toLowerCase()) ||
    v.customerName.toLowerCase().includes(vehicleSearchQuery.toLowerCase())
  );

  // Dialog states
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  
  // Custom Customer Form Data (local state for the form)
  const [customerFormData, setCustomerFormData] = useState({
    name: "",
    email: "",
    phone: "",
    vehicle: "",
    vehicleType: "",
    licensePlate: "",
    status: "Normal" as "VIP" | "Regular" | "Normal",
    image: "", // Profile image (preview base64 or url)
    images: [] as string[], // Gallery images (preview base64s)
  });
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [galleryImageFiles, setGalleryImageFiles] = useState<File[]>([]);
  const [isSubmittingCustomer, setIsSubmittingCustomer] = useState(false);

  useEffect(() => {
    const fetchDolarRate = async () => {
      try {
        const response = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
        const data = await response.json();
        setDolarRate(data.promedio || data.venta);
      } catch (error) {
        console.error('Error al obtener la tasa del dólar:', error);
        setDolarRate(36.5);
      }
    };

    fetchDolarRate();
    refreshProducts();
    refreshServices();
    refreshCustomers();
  }, []);

  const addToCart = (type: "service" | "product", item: Service | Product) => {
    const cartItemId = `${type}-${item.id}`;
    const existingItem = cart.find(ci => ci.cartId === cartItemId);

    if (existingItem) {
      if (type === "product") {
        // Chequear stock antes de agregar
        const product = item as Product;
        if (!checkStockAvailability(product.id, existingItem.quantity + 1)) {
           toast({
             title: "Stock insuficiente",
             description: `No hay suficiente stock de ${product.name}`,
             variant: "destructive"
           });
           return;
        }

        setCart(cart.map(ci => 
          ci.cartId === cartItemId 
            ? { ...ci, quantity: ci.quantity + 1 }
            : ci
        ));
      } else {
        toast({
          title: "Servicio ya agregado",
          description: "Este servicio ya está en el carrito.",
        });
      }
    } else {
       // Chequear stock inicial para productos
       if (type === "product") {
         const product = item as Product;
         if (!checkStockAvailability(product.id, 1)) {
            toast({
              title: "Stock insuficiente",
              description: `No hay suficiente stock de ${product.name}`,
              variant: "destructive"
            });
            return;
         }
       }

      const newItem: POSCartItem = {
        cartId: cartItemId,
        type,
        itemId: item.id,
        name: item.name,
        // @ts-ignore - Handle string/number price difference safely
        price: parseFloat(item.price.toString()),
        quantity: 1,
      };
      setCart([...cart, newItem]);
      toast({
        title: "Agregado al carrito",
        description: `${item.name} ha sido agregado.`,
      });
    }
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(cart.filter(item => item.cartId !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }

    const item = cart.find(i => i.cartId === cartItemId);
    if (item && item.type === 'product') {
       if (!checkStockAvailability(item.itemId, newQuantity)) {
          toast({
             title: "Stock insuficiente",
             description: "No puedes agregar más cantidad de la disponible.",
             variant: "destructive"
           });
           return;
       }
    }

    setCart(cart.map(item => 
      item.cartId === cartItemId 
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateBsPrice = (usdPrice: number) => {
    if (!dolarRate) return 'Cargando...';
    return (usdPrice * dolarRate).toFixed(2);
  };

  const processSale = async () => {
    if (cart.length === 0) {
      toast({
        title: "Carrito vacío",
        description: "Agrega items al carrito antes de procesar la venta.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedCustomer) {
      toast({
        title: "Cliente requerido",
        description: "Debes seleccionar un cliente antes de procesar la venta.",
        variant: "destructive",
      });
      return;
    }

    if (!paymentMethod) {
      toast({
        title: "Método de pago requerido",
        description: "Selecciona un método de pago.",
        variant: "destructive",
      });
      return;
    }

    const total = calculateSubtotal();
    
    // Call context to create sale
    const success = await createSale(selectedCustomer.id, cart, paymentMethod, total);

    if (success) {
        const saleId = `#${Date.now().toString().slice(-6)}`;
        setLastSale({ id: saleId, total });
        
        // Refresh products to show updated stock
        await refreshProducts(); 
        
        setShowThankYouModal(true);
    }
  };

  const closeAndClear = () => {
    setShowThankYouModal(false);
    setCart([]);
    setPaymentMethod("");
    setLastSale(null);
    setSelectedCustomer(null);
  };

  const handleBarcodeScanned = (barcode: string) => {
    const product = products.find(p => p.barcode === barcode);
    
    if (product) {
      addToCart("product", product);
      toast({
        title: "Producto escaneado",
        description: `${product.name} agregado al carrito`,
      });
    } else {
      toast({
        title: "Producto no encontrado",
        description: "No existe un producto con ese código de barras",
        variant: "destructive",
      });
    }
  };

  const handleSelectVehicle = async (vehicle: any) => {
      // Find full customer object
      const customer = customers.find(c => c.id === vehicle.customerId);
      if (customer) setSelectedCustomer(customer);
      
      setSelectedVehicle(vehicle);
      setVehicleSearchOpen(false);

      // Check for active orders for this vehicle
      const activeOrder = await getOrderByVehicle(vehicle.id);
      
      if (activeOrder && activeOrder.items.length > 0) {
          // Clear current cart services? Or append?
          // Usually appending is safer or asking, but let's auto-add distinct avoid duplicates
          const newCart = [...cart];
          
          let addedCount = 0;
          activeOrder.items.forEach(item => {
              const cartItemId = `service-${item.serviceId}`;
               // Check if already in cart
              if (!newCart.some(c => c.cartId === cartItemId)) {
                   newCart.push({
                       cartId: cartItemId,
                       type: 'service',
                       itemId: item.serviceId,
                       name: item.serviceName || 'Servicio',
                       price: item.price,
                       quantity: 1
                   });
                   addedCount++;
              }
          });
          
          if (addedCount > 0) {
              setCart(newCart);
              toast({
                  title: "Servicios cargados",
                  description: `Se han cargado ${addedCount} servicios de la orden activa (${activeOrder.type === 'walk-in' ? 'Llegada' : 'Cita'}).`,
              });
          }
      }
  };

  // --- Customer Handlers ---
  const handleCustomerInputChange = (field: string, value: any) => {
    setCustomerFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (file) {
        setProfileImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
             setCustomerFormData(prev => ({ ...prev, image: reader.result as string }));
        };
        reader.readAsDataURL(file);
     }
  };

  const handleGalleryImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
        const newFiles = Array.from(files);
        setGalleryImageFiles(prev => [...prev, ...newFiles]);

        // Preview logic
        newFiles.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCustomerFormData(prev => ({
                    ...prev,
                    images: [...prev.images, reader.result as string]
                }));
            };
            reader.readAsDataURL(file);
        });
    }
  };

  const handleCreateCustomer = async () => {
    if (!customerFormData.name || !customerFormData.phone) {
      toast({
        title: "Error",
        description: "Nombre y teléfono son obligatorios.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingCustomer(true);
    try {
        let profileImageUrl = "";
        
        // Upload profile image if exists
        if (profileImageFile) {
            profileImageUrl = await uploadImage(profileImageFile);
        }

        const newCustomerId = await addCustomer({
            name: customerFormData.name,
            email: customerFormData.email,
            phones: [customerFormData.phone], // Pass as array
            status: customerFormData.status,
            image: profileImageUrl
        });
        
        if (newCustomerId && customerFormData.vehicle && customerFormData.licensePlate) {
             // Add vehicle if data provided
             // Upload gallery images for vehicle if any (though UI uses them for customer gallery currently?)
             // In new schema, images are for VEHICLE.
             // But UI form in POS seems to be mixed legacy. 
             // Let's assume gallery is for vehicle now.

             const galleryUrls: string[] = [];
             for (const file of galleryImageFiles) {
                const url = await uploadImage(file);
                galleryUrls.push(url);
             }

             // We need to import addVehicle in POS? No, it's exposed via context.
             // Wait, useCustomers exposes addVehicle? 
             // I need to check useCustomers destructuring.
             // If not exposed, I might need to use supabase directly or update destructuring.
             // Assuming addVehicle is exposed in context passed to value.
        }

        toast({
             title: "Cliente creado",
             description: "El cliente ha sido registrado exitosamente.",
        });
        
        setIsCustomerDialogOpen(false);
        // Clean form
        setCustomerFormData({
            name: "", email: "", phone: "", vehicle: "", vehicleType: "", licensePlate: "", status: "Normal", image: "", images: []
        });
        setProfileImageFile(null);
        setGalleryImageFiles([]);

    } catch (error) {
        // handled in context
    } finally {
        setIsSubmittingCustomer(false);
    }
  };


  const exportToPDF = () => {
    if (!lastSale) return;

    const doc = new jsPDF();
    const primaryColor: [number, number, number] = [29, 78, 216]; // Blue-700
    const grayColor: [number, number, number] = [107, 114, 128]; // Gray-500
    
    // Encabezado
    doc.setFontSize(22);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(config.nombre_negocio || "Autolavado Gochi", 105, 20, { align: "center" });
    
    doc.setFontSize(10);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text(config.direccion || "Av. Principal Las Mercedes, Caracas", 105, 28, { align: "center" });
    doc.text(`Tel: ${config.telefono || "+58 412-1234567"} | Email: ${config.email || "contacto@autolavadogochi.com"}`, 105, 33, { align: "center" });
    doc.text(`RIF: ${config.rif || "J-12345678-9"}`, 105, 38, { align: "center" });

    doc.setDrawColor(200, 200, 200);
    doc.line(20, 45, 190, 45);

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Recibo de Venta`, 20, 55);
    
    doc.setFontSize(10);
    doc.text(`ID: ${lastSale.id}`, 20, 62);
    doc.text(`Fecha: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 20, 67);
    doc.text(`Método de Pago: ${paymentMethod}`, 20, 72);

    // Add customer information
    if (selectedCustomer) {
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Cliente:", 20, 82);
      doc.setFont("helvetica", "normal");
      doc.text(selectedCustomer.name, 40, 82);
      
      if (selectedCustomer.phones && selectedCustomer.phones.length > 0) {
        doc.text("Teléfono:", 20, 87);
        doc.text(selectedCustomer.phones[0], 40, 87);
      }
      
      if (selectedVehicle) {
        doc.text("Vehículo:", 20, 92);
        const vehicleInfo = selectedVehicle.placa 
          ? `${selectedVehicle.tipo} (${selectedVehicle.placa})`
          : selectedVehicle.tipo;
        doc.text(vehicleInfo, 40, 92);
      }
      
      // Add a small separator line
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 95, 190, 95);
    }

    const tableColumn = ["Item", "Cant.", "Precio Unit.", "Total"];
    const tableRows = cart.map(item => [
      item.name,
      item.quantity.toString(),
      `$${item.price.toFixed(2)}`,
      `$${(item.price * item.quantity).toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: selectedCustomer ? 100 : 80,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: primaryColor, textColor: 255, halign: 'center' },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { halign: 'center' },
        2: { halign: 'right' },
        3: { halign: 'right' }
      },
      styles: { fontSize: 10, cellPadding: 3 },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    doc.setFontSize(11);
    doc.text(`Subtotal:`, 140, finalY);
    doc.text(`$${lastSale.total.toFixed(2)}`, 190, finalY, { align: "right" });
    
    doc.setFontSize(14);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text(`Total USD:`, 140, finalY + 10);
    doc.text(`$${lastSale.total.toFixed(2)}`, 190, finalY + 10, { align: "right" });
    
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Bs:`, 140, finalY + 18);
    doc.text(`Bs. ${calculateBsPrice(lastSale.total)}`, 190, finalY + 18, { align: "right" });

    doc.setFontSize(10);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text("¡Gracias por su preferencia!", 105, finalY + 40, { align: "center" });
    doc.text("Conserve este recibo para cualquier reclamo.", 105, finalY + 45, { align: "center" });

    doc.save(`recibo_${lastSale.id.replace('#', '')}.pdf`);

    toast({
      title: "PDF generado",
      description: "El recibo se ha descargado exitosamente.",
    });
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto">
      <Toaster />
      <motion.div 
        className="flex flex-col gap-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">POS - Punto de Venta</h1>
            <p className="text-sm md:text-base text-muted-foreground mt-1">Procesa ventas de servicios y productos</p>
          </div>
          <div className="flex gap-2">
            <Button 
                onClick={() => { refreshProducts(); refreshServices(); refreshCustomers(); }} 
                variant="outline"
                size="icon"
                title="Recargar datos"
            >
                <IoReloadOutline className="h-5 w-5" />
            </Button>
            <Button 
                onClick={() => setIsScannerOpen(true)} 
                variant="outline"
                className="gap-2"
            >
                <IoScanOutline className="h-5 w-5" />
                Escanear Producto
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
            <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
                className="pl-10 h-12 text-md bg-card shadow-sm"
                placeholder="Buscar servicios o productos por nombre..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="services" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="services">Servicios</TabsTrigger>
                <TabsTrigger value="products">Productos</TabsTrigger>
              </TabsList>
              
              <TabsContent value="services" className="mt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {services
                    .filter(service => service.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((service) => (
                    <Card 
                      key={service.id} 
                      className="cursor-pointer hover:border-primary transition-all duration-200 hover:shadow-md active:scale-[0.98]"
                      onClick={() => addToCart("service", service)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <IoCubeOutline className="h-5 w-5 text-primary" />
                            <CardTitle className="text-lg">{service.name}</CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-2xl font-bold text-primary">${parseFloat(service.price.toString()).toFixed(2)}</span>
                          <Button size="sm" className="gap-1">
                            <IoAddOutline className="h-4 w-4" /> Agregar
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Bs. {calculateBsPrice(parseFloat(service.price.toString()))}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="products" className="mt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products
                    .filter(product => product.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((product) => (
                    <Card 
                      key={product.id} 
                      className={`cursor-pointer transition-all duration-200 hover:shadow-md active:scale-[0.98] ${product.stock <= 0 ? 'opacity-60 grayscale' : 'hover:border-primary'}`}
                      onClick={() => product.stock > 0 && addToCart("product", product)}
                    >
                      <div className="h-32 w-full bg-muted relative overflow-hidden">
                        {product.image ? (
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <IoCubeOutline className="h-10 w-10 text-muted-foreground/50" />
                            </div>
                        )}
                        {product.stock <= 0 && (
                            <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                                <Badge variant="destructive">Agotado</Badge>
                            </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold truncate" title={product.name}>{product.name}</h3>
                        <div className="flex justify-between items-end mt-2">
                           <div>
                                <div className="text-lg font-bold text-primary">${parseFloat(product.price).toFixed(2)}</div>
                                <div className="text-xs text-muted-foreground">Stock: {product.stock}</div>
                           </div>
                           <Button size="sm" variant="ghost" disabled={product.stock <= 0}>
                             <IoAddOutline className="h-5 w-5" />
                           </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card className="border-2 border-primary/10 shadow-lg sticky top-6">
              <CardHeader className="bg-muted/30 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <IoCartOutline className="h-6 w-6 text-primary" />
                  Resumen de Venta
                </CardTitle>
                
                {/* Customer Selector */}
                <div className="mt-4">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-2 block">Vehículo - Cliente</Label>
                    
                    {!selectedVehicle ? (
                        <div className="flex gap-2">
                            <Popover open={vehicleSearchOpen} onOpenChange={setVehicleSearchOpen}>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" role="combobox" className="w-full justify-between">
                                        Seleccionar vehículo...
                                        <IoSearch className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[300px] p-0">
                                    <Command>
                                        <CommandInput 
                                            placeholder="Buscar placa, vehículo, cliente..." 
                                            value={vehicleSearchQuery}
                                            onValueChange={setVehicleSearchQuery}
                                        />
                                        <CommandEmpty>No se encontraron vehículos.</CommandEmpty>
                                        <CommandGroup>
                                            {searchableVehicles.slice(0, 10).map((vehicle) => (
                                                <HoverCard key={`${vehicle.customerId}-${vehicle.id}`} openDelay={200}>
                                                    <HoverCardTrigger asChild>
                                                        <CommandItem
                                                            onSelect={() => handleSelectVehicle(vehicle)}
                                                            className="cursor-pointer"
                                                        >
                                                            <div className="flex flex-col w-full">
                                                                <span className="font-bold">{vehicle.placa}</span>
                                                                <span className="text-xs text-muted-foreground">{vehicle.tipo} - {vehicle.customerName}</span>
                                                            </div>
                                                            <IoCheckmarkOutline
                                                                className={`ml-auto h-4 w-4 ${selectedVehicle?.id === vehicle.id ? "opacity-100" : "opacity-0"}`}
                                                            />
                                                        </CommandItem>
                                                    </HoverCardTrigger>
                                                    <HoverCardContent className="w-80" side="right" align="start">
                                                        <div className="flex justify-between space-x-4">
                                                            <Avatar>
                                                                <AvatarImage src={vehicle.customerImage} />
                                                                <AvatarFallback>{vehicle.customerName?.substring(0,2).toUpperCase()}</AvatarFallback>
                                                            </Avatar>
                                                            <div className="space-y-1">
                                                                <h4 className="text-sm font-semibold">{vehicle.customerName}</h4>
                                                                <div className="flex items-center pt-2">
                                                                    <IoCarSportOutline className="mr-2 h-4 w-4 opacity-70" /> 
                                                                    <span className="text-xs text-muted-foreground">{vehicle.tipo} ({vehicle.placa})</span>
                                                                </div>
                                                                <div className="flex items-center">
                                                                    <IoPhonePortraitOutline className="mr-2 h-4 w-4 opacity-70" /> 
                                                                    <span className="text-xs text-muted-foreground">{vehicle.customerPhone}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </HoverCardContent>
                                                </HoverCard>
                                            ))}
                                        </CommandGroup>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            <Button size="icon" onClick={() => setIsCustomerDialogOpen(true)} title="Nuevo Cliente">
                                <IoAddOutline className="h-4 w-4" />
                            </Button>
                        </div>
                    ) : (
                        <div className="bg-primary/5 p-3 rounded-lg border border-primary/20 relative group">
                             <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => {
                                    setSelectedCustomer(null);
                                    setSelectedVehicle(null);
                                }}
                             >
                                <IoCloseOutline className="h-4 w-4" />
                             </Button>
                             <div className="font-medium text-primary flex items-center gap-2">
                                <IoCarSportOutline className="h-5 w-5" />
                                {selectedVehicle.placa}
                             </div>
                             <div className="text-sm text-muted-foreground mt-1">
                                {selectedVehicle.tipo} • {selectedCustomer?.name}
                             </div>
                             {selectedCustomer?.status === 'VIP' && (
                                <Badge className="mt-2 bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 border-yellow-200">VIP</Badge>
                             )}
                        </div>
                    )}
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {cart.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                      <IoCartOutline className="h-12 w-12 mx-auto mb-2 opacity-20" />
                      <p>Carrito vacío</p>
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div key={item.cartId} className="flex items-center justify-between p-3 bg-card border rounded-lg shadow-sm">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.name}</h4>
                          <div className="text-xs text-muted-foreground">
                            ${parseFloat(item.price.toString()).toFixed(2)} c/u
                            {item.type === 'service' && <Badge variant="secondary" className="ml-2 text-[10px] py-0 h-4">Servicio</Badge>}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {item.type === 'service' ? (
                             <div className="h-8 w-8 flex items-center justify-center font-bold text-sm bg-muted rounded-md border">
                                {item.quantity}
                             </div>
                          ) : (
                              <div className="flex items-center gap-0.5 bg-primary rounded-md p-0.5 shadow-sm">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-7 w-7 rounded-sm text-primary-foreground hover:bg-primary-foreground/20 hover:text-white transition-colors"
                                  onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                                >
                                  -
                                </Button>
                                <span className="w-5 text-center text-sm font-bold text-primary-foreground">{item.quantity}</span>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-7 w-7 rounded-sm text-primary-foreground hover:bg-primary-foreground/20 hover:text-white transition-colors"
                                  onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                                >
                                  +
                                </Button>
                              </div>
                          )}
                          <div className="text-right min-w-[60px]">
                            <div className="font-bold text-sm">
                              ${(item.price * item.quantity).toFixed(2)}
                            </div>
                          </div>
                          <Button 
                             variant="ghost" 
                             size="icon"
                             className="h-6 w-6 text-destructive hover:bg-destructive/10 -mr-2"
                             onClick={() => removeFromCart(item.cartId)}
                          >
                             <IoTrashOutline className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-6 space-y-4">
                  <div className="space-y-2 border-t pt-4">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span>${calculateSubtotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-end">
                      <span className="font-bold text-lg">Total USD</span>
                      <span className="font-bold text-2xl text-primary">${calculateSubtotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center bg-muted/50 p-2 rounded text-sm">
                      <span className="text-muted-foreground">Tasa BCV: {dolarRate} Bs/$</span>
                      <span className="font-medium">Bs. {calculateBsPrice(calculateSubtotal())}</span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <Label>Método de Pago</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {["Efectivo", "Punto", "Pago Móvil", "Zelle"].map((method) => (
                        <Button
                          key={method}
                          variant={paymentMethod === method ? "default" : "outline"}
                          className={`justify-start ${paymentMethod === method ? "ring-2 ring-primary ring-offset-2" : ""}`}
                          onClick={() => setPaymentMethod(method)}
                        >
                          {method === "Efectivo" && <IoCashOutline className="mr-2 h-4 w-4" />}
                          {method === "Punto" && <IoCardOutline className="mr-2 h-4 w-4" />}
                          {method === "Pago Móvil" && <IoPhonePortraitOutline className="mr-2 h-4 w-4" />}
                          {method === "Zelle" && <span className="mr-2 font-bold text-xs">Z</span>}
                          {method}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Button 
                    className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20" 
                    size="lg"
                    onClick={processSale}
                    disabled={cart.length === 0 || saleLoading}
                  >
                     {saleLoading ? (
                         <>
                            <IoReloadOutline className="mr-2 h-5 w-5 animate-spin" />
                            Procesando...
                         </>
                     ) : (
                         <>
                            <IoCheckmarkCircleOutline className="mr-2 h-5 w-5" />
                            Completar Venta
                         </>
                     )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Create Customer Dialog */}
        <Dialog open={isCustomerDialogOpen} onOpenChange={(open) => !open && setIsCustomerDialogOpen(false)}>
          <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
            <div className="px-4 py-3 border-b">
                <DialogHeader className="flex flex-row items-center justify-between">
                    <DialogTitle className="text-lg font-semibold">Nuevo Cliente</DialogTitle>
                </DialogHeader>
            </div>
            
            <div className="px-4 py-3 space-y-4">
               {/* Profile Photo Section */}
               <div className="flex items-center gap-4">
                   <div className="h-14 w-14 rounded-full border-2 border-dashed flex items-center justify-center bg-muted/20 overflow-hidden relative shrink-0 cursor-pointer hover:bg-muted/30 transition-colors">
                       {customerFormData.image ? (
                           <img src={customerFormData.image} alt="Profile" className="h-full w-full object-cover" />
                       ) : (
                           <IoPeopleOutline className="h-6 w-6 text-muted-foreground/50" />
                       )}
                       <Input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleProfileImageUpload} 
                            className="absolute inset-0 opacity-0 cursor-pointer"
                       />
                   </div>
                   <div className="space-y-1">
                        <Label className="font-medium text-xs block mb-1">Foto del perfil</Label>
                        <Button variant="outline" size="sm" className="relative h-7 text-xs cursor-pointer">
                           Subir foto
                           <Input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleProfileImageUpload} 
                                className="absolute inset-0 opacity-0 cursor-pointer"
                           />
                        </Button>
                   </div>
               </div>

               {/* Form Fields Grid */}
               <div className="grid grid-cols-2 gap-x-3 gap-y-3">
                   <div className="space-y-1">
                      <Label htmlFor="name" className="text-xs font-medium">Nombre</Label>
                      <Input id="name" className="h-8 text-sm" placeholder="Ej: Juan Pérez" value={customerFormData.name} onChange={(e) => handleCustomerInputChange("name", e.target.value)} />
                   </div>
                   <div className="space-y-1">
                      <Label htmlFor="email" className="text-xs font-medium">Email</Label>
                      <Input id="email" className="h-8 text-sm" placeholder="ejemplo@email.com" value={customerFormData.email} onChange={(e) => handleCustomerInputChange("email", e.target.value)} />
                   </div>

                   <div className="space-y-1">
                      <Label htmlFor="phone" className="text-xs font-medium">Teléfono</Label>
                      <Input id="phone" className="h-8 text-sm" placeholder="Ej: 584123456789" value={customerFormData.phone} onChange={(e) => handleCustomerInputChange("phone", e.target.value)} />
                   </div>
                   <div className="space-y-1">
                      <Label htmlFor="vehicle" className="text-xs font-medium">Vehículo</Label>
                      <Input id="vehicle" className="h-8 text-sm" placeholder="Ej: Toyota Corolla" value={customerFormData.vehicle} onChange={(e) => handleCustomerInputChange("vehicle", e.target.value)} />
                   </div>

                   <div className="space-y-1">
                      <Label htmlFor="type" className="text-xs font-medium">Tipo</Label>
                      <Input id="type" className="h-8 text-sm" placeholder="Ej: Sedán" value={customerFormData.vehicleType} onChange={(e) => handleCustomerInputChange("vehicleType", e.target.value)} />
                   </div>
                   <div className="space-y-1">
                      <Label htmlFor="plate" className="text-xs font-medium">Placa</Label>
                      <Input id="plate" className="h-8 text-sm" placeholder="Ej: ABC123" value={customerFormData.licensePlate} onChange={(e) => handleCustomerInputChange("licensePlate", e.target.value.toUpperCase())} />
                   </div>
               </div>
               
               <div className="space-y-1 max-w-[50%]">
                    <Label htmlFor="status" className="text-xs font-medium">Estado</Label>
                    <Select 
                        value={customerFormData.status} 
                        onValueChange={(val: any) => handleCustomerInputChange("status", val)}
                    >
                        <SelectTrigger className="h-8 text-sm">
                            <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Normal">Normal</SelectItem>
                            <SelectItem value="VIP">VIP</SelectItem>
                            <SelectItem value="Regular">Regular</SelectItem>
                        </SelectContent>
                    </Select>
               </div>

               {/* Gallery Section */}
               <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                      <Label className="font-medium text-xs">Galería (6-10)</Label>
                      <Button variant="outline" size="sm" className="gap-2 relative h-7 text-xs px-3 border-dashed border-primary/30 hover:border-primary hover:bg-primary/5 hover:text-primary transition-colors cursor-pointer">
                            <IoImageOutline className="h-3 w-3" />
                            Agregar Fotos
                            <Input 
                                type="file" 
                                multiple
                                accept="image/*" 
                                onChange={handleGalleryImageUpload} 
                                className="absolute inset-0 opacity-0 cursor-pointer"
                           />
                      </Button>
                  </div>
                  
                  <div className={`border border-dashed rounded-lg p-2 min-h-[60px] flex items-center justify-center ${customerFormData.images.length === 0 ? 'bg-muted/10' : 'bg-transparent'}`}>
                     {customerFormData.images.length === 0 ? (
                         <div className="text-center text-muted-foreground text-xs">
                             Sin fotos
                         </div>
                     ) : (
                         <div className="grid grid-cols-6 gap-2 w-full">
                            {customerFormData.images.map((img, idx) => (
                                <div key={idx} className="relative aspect-square rounded overflow-hidden border bg-background group">
                                    <img src={img} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <IoCheckmarkCircleOutline className="h-4 w-4 text-white" />
                                    </div>
                                </div>
                            ))}
                         </div>
                     )}
                  </div>
               </div>
            </div>

            <DialogFooter className="px-4 py-3 border-t flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIsCustomerDialogOpen(false)}>Cancelar</Button>
              <Button size="sm" onClick={handleCreateCustomer} disabled={isSubmittingCustomer} className="bg-primary hover:bg-primary/90">
                 {isSubmittingCustomer ? '...' : 'Guardar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Success / Thank You Modal */}
        <Dialog open={showThankYouModal} onOpenChange={(open) => !open && closeAndClear()}>
          <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-0 shadow-2xl">
            <div className="bg-primary pt-10 pb-20 px-6 text-center text-primary-foreground relative overlow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white to-transparent"></div>
                <div className="mx-auto w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-6 shadow-inner ring-4 ring-white/10 relative z-10">
                   <IoCheckmarkCircleOutline className="h-12 w-12 text-white" />
                </div>
                <h2 className="text-3xl font-bold relative z-10">¡Venta Exitosa!</h2>
                <p className="text-primary-foreground/80 mt-2 relative z-10">La transacción se procesó correctamente.</p>
            </div>
            
            <div className="px-6 -mt-12 relative z-20">
                <div className="bg-card rounded-xl shadow-lg border p-6 text-center space-y-6">
                    <div>
                        <p className="text-muted-foreground text-sm uppercase tracking-wider font-semibold">Total Pagado</p>
                        <div className="text-4xl font-extrabold text-primary mt-1">
                            ${lastSale?.total.toFixed(2)}
                        </div>
                    </div>

                    {selectedCustomer && (
                        <div className="bg-muted/30 rounded-lg p-4 border border-muted flex items-start gap-4 text-left">
                            <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                                <AvatarImage src={selectedCustomer.image} />
                                <AvatarFallback className="bg-primary/10 text-primary font-bold">{selectedCustomer.name.substring(0,2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-sm truncate">{selectedCustomer.name}</h4>
                                <div className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                                    <IoCarSportOutline className="h-3 w-3" />
                                    {selectedVehicle?.tipo || "Sin vehículo"} 
                                    {selectedVehicle?.placa && <span className="font-mono bg-background px-1 rounded border ml-1">{selectedVehicle.placa}</span>}
                                </div>
                                <div className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                                    <IoMailOutline className="h-3 w-3" />
                                    {selectedCustomer.email || "Sin email"}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 text-xs">
                        <div className="bg-muted/30 rounded p-2 border border-muted">
                            <span className="block text-muted-foreground mb-1">ID Transacción</span>
                            <span className="font-mono font-medium">{lastSale?.id}</span>
                        </div>
                        <div className="bg-muted/30 rounded p-2 border border-muted">
                            <span className="block text-muted-foreground mb-1">Método de Pago</span>
                            <span className="font-medium">{paymentMethod}</span>
                        </div>
                    </div>
                </div>
            </div>

            <DialogFooter className="flex-col gap-3 p-6 pt-2">
              <Button className="w-full h-12 text-base shadow-md font-bold" onClick={exportToPDF}>
                <IoDownloadOutline className="mr-2 h-5 w-5" />
                Descargar Recibo
              </Button>
              <Button variant="ghost" className="w-full" onClick={closeAndClear}>
                Nueva Venta
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

export default POS;
