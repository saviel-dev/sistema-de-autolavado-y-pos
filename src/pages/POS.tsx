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
  IoBarcodeOutline
} from "react-icons/io5";
import BarcodeScanner from "@/components/BarcodeScanner";
import { formatBarcode } from "@/lib/barcodeUtils";
import { useProducts } from "@/contexts/ProductContext";
import { useMovements } from "@/contexts/MovementContext";
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

interface CartItem {
  id: string;
  type: "service" | "product";
  itemId: number;
  name: string;
  price: number;
  quantity: number;
}

interface Service {
  id: number;
  name: string;
  price: string;
}

interface Product {
  id: number;
  name: string;
  price: string;
  barcode?: string;
}

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  vehicle: string;
  vehicleType: string;
  licensePlate: string;
  status: "VIP" | "Regular" | "Normal";
  visits: number;
  images?: string[];
}

interface Order {
  id: number;
  orderType: "walk-in" | "appointment";
  customerId: number;
  customerName: string;
  customerVehicle?: string;
  services: number[];
  serviceNames: string[];
  status: "Pendiente" | "Confirmada" | "En Proceso" | "Completada" | "Cancelada";
  date: string;
  time: string;
  totalAmount: number;
  notes?: string;
}

interface Appointment {
  id: number;
  client: string;
  service: string;
  date: string;
  time: string;
  status: "Pendiente" | "Confirmada" | "Completada" | "Cancelada";
  phone: string;
}

// Datos de clientes
const customers: Customer[] = [
  {
    id: 1,
    name: "Juan Pérez",
    email: "juan@example.com",
    phone: "584123456789",
    vehicle: "Toyota Corolla",
    vehicleType: "Sedán",
    licensePlate: "ABC123",
    status: "VIP",
    visits: 0
  },
  {
    id: 2,
    name: "María González",
    email: "maria@example.com",
    phone: "584123456788",
    vehicle: "Honda Civic",
    vehicleType: "Sedán",
    licensePlate: "DEF456",
    status: "Regular",
    visits: 0
  },
  {
    id: 3,
    name: "Carlos Rodríguez",
    email: "carlos@example.com",
    phone: "584123456787",
    vehicle: "Ford F-150",
    vehicleType: "Camioneta",
    licensePlate: "GHI789",
    status: "Normal",
    visits: 0
  }
];

// Datos de ejemplo
const services: Service[] = [
  { id: 1, name: "Lavado Express", price: "5" },
  { id: 2, name: "Lavado Completo", price: "10" },
  { id: 3, name: "Encerado Premium", price: "20" },
  { id: 4, name: "Pulido", price: "25" },
];



const POS = () => {
  const { products, updateStock, checkStockAvailability } = useProducts();
  const { registerSaleMovements } = useMovements();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [dolarRate, setDolarRate] = useState<number | null>(null);
  const [showThankYouModal, setShowThankYouModal] = useState(false);
  const [lastSale, setLastSale] = useState<{ id: string; total: number } | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const { toast } = useToast();

  // Customer selection states
  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: 1,
      name: "Juan Pérez",
      email: "juan@example.com",
      phone: "584123456789",
      vehicle: "Toyota Corolla",
      vehicleType: "Sedán",
      licensePlate: "ABC123",
      status: "VIP",
      visits: 0
    },
    {
      id: 2,
      name: "María González",
      email: "maria@example.com",
      phone: "584123456788",
      vehicle: "Honda Civic",
      vehicleType: "Sedán",
      licensePlate: "DEF456",
      status: "Regular",
      visits: 0
    },
    {
      id: 3,
      name: "Carlos Rodríguez",
      email: "carlos@example.com",
      phone: "584123456787",
      vehicle: "Ford F-150",
      vehicleType: "Camioneta",
      licensePlate: "GHI789",
      status: "Normal",
      visits: 0
    }
  ]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
    customer.phone.includes(customerSearchQuery) ||
    (customer.licensePlate && customer.licensePlate.toLowerCase().includes(customerSearchQuery.toLowerCase()))
  );

  const handleCreateCustomer = (newCustomer: Customer) => {
    const updatedCustomers = [...customers, newCustomer];
    setCustomers(updatedCustomers);
    setSelectedCustomer(newCustomer);
    localStorage.setItem('customers', JSON.stringify(updatedCustomers));
    setIsCustomerDialogOpen(false);
    
    // Reset form
    setCustomerFormData({
      name: "",
      email: "",
      phone: "",
      vehicle: "",
      vehicleType: "",
      licensePlate: "",
      status: "Normal",
      images: [],
    });
  };

  const handleCreateOrder = () => {
    if (!selectedCustomer) {
      toast({
        title: "Cliente requerido",
        description: "Por favor selecciona o crea un cliente primero.",
        variant: "destructive",
      });
      return;
    }
    
    setOrderFormData({
      ...orderFormData,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      customerVehicle: selectedCustomer.vehicle,
    });
    
    setIsOrderDialogOpen(true);
  };

  const handleCreateAppointment = () => {
    if (!selectedCustomer) {
      toast({
        title: "Cliente requerido",
        description: "Por favor selecciona o crea un cliente primero.",
        variant: "destructive",
      });
      return;
    }
    
    setAppointmentFormData({
      ...appointmentFormData,
      client: selectedCustomer.name,
      phone: selectedCustomer.phone,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    });
    
    setIsAppointmentDialogOpen(true);
  };

  const clearSelectedCustomer = () => {
    setSelectedCustomer(null);
  };

  // Dialog states
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [isAppointmentDialogOpen, setIsAppointmentDialogOpen] = useState(false);
  
  // Customer form data
  const [customerFormData, setCustomerFormData] = useState({
    name: "",
    email: "",
    phone: "",
    vehicle: "",
    vehicleType: "",
    licensePlate: "",
    status: "Normal" as "VIP" | "Regular" | "Normal",
    images: [] as string[],
  });
  
  // Order form data  
  const [orderFormData, setOrderFormData] = useState({
    orderType: "walk-in" as "walk-in" | "appointment",
    customerId: 0,
    customerName: "",
    customerVehicle: "",
    services: [] as number[],
    serviceNames: [] as string[],
    status: "Pendiente" as Order["status"],
    date: "",
    time: "",
    notes: "",
  });
  
  // Appointment form data
  const [appointmentFormData, setAppointmentFormData] = useState({
    client: "",
    service: "",
    date: "",
    time: "",
    phone: "",
    status: "Pendiente" as Appointment["status"],
  });
  
  const [servicesPopoverOpen, setServicesPopoverOpen] = useState(false);

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
    
    // Load customers from localStorage
    const storedCustomers = localStorage.getItem('customers');
    if (storedCustomers) {
      setCustomers(JSON.parse(storedCustomers));
    }
  }, []);

  const addToCart = (type: "service" | "product", item: Service | Product) => {
    const cartItemId = `${type}-${item.id}`;
    const existingItem = cart.find(ci => ci.id === cartItemId);

    if (existingItem) {
      // Si es un producto, incrementar cantidad
      if (type === "product") {
        setCart(cart.map(ci => 
          ci.id === cartItemId 
            ? { ...ci, quantity: ci.quantity + 1 }
            : ci
        ));
      } else {
        // Para servicios, simplemente notificar que ya está agregado
        toast({
          title: "Servicio ya agregado",
          description: "Este servicio ya está en el carrito.",
        });
      }
    } else {
      const newItem: CartItem = {
        id: cartItemId,
        type,
        itemId: item.id,
        name: item.name,
        price: parseFloat(item.price),
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
    setCart(cart.filter(item => item.id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId);
    } else {
      setCart(cart.map(item => 
        item.id === cartItemId 
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateBsPrice = (usdPrice: number) => {
    if (!dolarRate) return 'Cargando...';
    return (usdPrice * dolarRate).toFixed(2);
  };

  const processSale = () => {
    if (cart.length === 0) {
      toast({
        title: "Carrito vacío",
        description: "Agrega items al carrito antes de procesar la venta.",
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
    const saleId = `#${Date.now().toString().slice(-6)}`;
    
    setLastSale({ id: saleId, total });
    setShowThankYouModal(true);
  };

  const closeAndClear = () => {
    setShowThankYouModal(false);
    setCart([]);
    setPaymentMethod("");
    setLastSale(null);
  };

  const handleBarcodeScanned = (barcode: string) => {
    // Buscar producto por código de barras
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

  // --- Customer Handlers ---
  const handleCustomerInputChange = (field: string, value: any) => {
    setCustomerFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const currentImages = customerFormData.images || [];
      const remainingSlots = 10 - currentImages.length;
      
      if (remainingSlots === 0) {
        toast({
          title: "Límite alcanzado",
          description: "Máximo 10 imágenes por cliente.",
          variant: "destructive",
        });
        return;
      }
      
      const filesToProcess = Array.from(files).slice(0, remainingSlots);
      
      filesToProcess.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setCustomerFormData(prev => ({
            ...prev,
            images: [...(prev.images || []), reader.result as string]
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    setCustomerFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSaveCustomer = () => {
    if (!customerFormData.name || !customerFormData.phone) {
      toast({
        title: "Error",
        description: "Nombre y teléfono son obligatorios.",
        variant: "destructive",
      });
      return;
    }

    const newCustomer: Customer = {
      id: Date.now(),
      ...customerFormData,
      visits: 0
    };

    const updatedCustomers = [...customers, newCustomer];
    setCustomers(updatedCustomers);
    localStorage.setItem('customers', JSON.stringify(updatedCustomers));
    
    setSelectedCustomer(newCustomer);
    setIsCustomerDialogOpen(false);
    setCustomerFormData({
      name: "",
      email: "",
      phone: "",
      vehicle: "",
      vehicleType: "",
      licensePlate: "",
      status: "Normal",
      images: [],
    });

    toast({
      title: "Cliente creado",
      description: "El cliente ha sido creado y seleccionado.",
    });
  };

  // --- Order Handlers ---
  const handleOrderInputChange = (field: string, value: any) => {
    setOrderFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveOrder = () => {
    if (!orderFormData.customerId || orderFormData.services.length === 0) {
      toast({
        title: "Error",
        description: "Seleccione un cliente y al menos un servicio.",
        variant: "destructive",
      });
      return;
    }

    // Logic to save order would go here (e.g. save to localStorage or API)
    // For now we just simulate success
    toast({
      title: "Pedido creado",
      description: "El pedido ha sido creado exitosamente.",
    });
    setIsOrderDialogOpen(false);
  };

  // --- Appointment Handlers ---
  const handleAppointmentInputChange = (field: string, value: any) => {
    setAppointmentFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveAppointment = () => {
    if (!appointmentFormData.client || !appointmentFormData.date || !appointmentFormData.time) {
      toast({
        title: "Error",
        description: "Complete los campos obligatorios.",
        variant: "destructive",
      });
      return;
    }

    // Logic to save appointment
    toast({
      title: "Cita agendada",
      description: "La cita ha sido agendada exitosamente.",
    });
    setIsAppointmentDialogOpen(false);
  };

  const exportToPDF = () => {
    if (!lastSale) return;

    const doc = new jsPDF();
    const primaryColor: [number, number, number] = [29, 78, 216]; // Blue-700
    const grayColor: [number, number, number] = [107, 114, 128]; // Gray-500
    
    // Encabezado
    doc.setFontSize(22);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("Autolavado Gochi", 105, 20, { align: "center" });
    
    doc.setFontSize(10);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text("Av. Principal Las Mercedes, Caracas", 105, 28, { align: "center" });
    doc.text("Tel: +58 412-1234567 | Email: contacto@autolavadogochi.com", 105, 33, { align: "center" });
    doc.text("RIF: J-12345678-9", 105, 38, { align: "center" });

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
      
      if (selectedCustomer.phone) {
        doc.text("Teléfono:", 20, 87);
        doc.text(selectedCustomer.phone, 40, 87);
      }
      
      if (selectedCustomer.vehicle) {
        doc.text("Vehículo:", 20, 92);
        const vehicleInfo = selectedCustomer.licensePlate 
          ? `${selectedCustomer.vehicle} (${selectedCustomer.licensePlate})`
          : selectedCustomer.vehicle;
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
          <Button 
            onClick={() => setIsScannerOpen(true)} 
            variant="outline"
            className="gap-2"
          >
            <IoScanOutline className="h-5 w-5" />
            Escanear Producto
          </Button>
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
                  {services.map((service) => (
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
                          <span className="text-2xl font-bold text-primary">${parseFloat(service.price).toFixed(2)}</span>
                          <Button size="sm" className="gap-1">
                            <IoAddOutline className="h-4 w-4" /> Agregar
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Bs. {calculateBsPrice(parseFloat(service.price))}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="products" className="mt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {products.map((product) => (
                    <Card 
                      key={product.id} 
                      className="cursor-pointer hover:border-primary transition-all duration-200 hover:shadow-md active:scale-[0.98]"
                      onClick={() => addToCart("product", product)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <IoCubeOutline className="h-5 w-5 text-primary" />
                            <CardTitle className="text-lg">{product.name}</CardTitle>
                          </div>
                          {product.barcode && (
                            <Badge variant="outline" className="gap-1 text-xs font-mono">
                              <IoBarcodeOutline className="h-3 w-3" />
                              {formatBarcode(product.barcode)}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-2xl font-bold text-primary">${parseFloat(product.price).toFixed(2)}</span>
                          <Button size="sm" className="gap-1">
                            <IoAddOutline className="h-4 w-4" /> Agregar
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Bs. {calculateBsPrice(parseFloat(product.price))}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:col-span-1">
            <Card className="h-fit sticky top-6 shadow-lg border-t-4 border-t-primary">
              <CardHeader className="pb-4 border-b">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <IoCartOutline className="h-6 w-6" />
                  Carrito
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {cart.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg bg-muted/30">
                      <IoCartOutline className="h-12 w-12 mx-auto mb-2 opacity-20" />
                      <p>El carrito está vacío</p>
                      <p className="text-sm">Selecciona items para comenzar</p>
                    </div>
                  ) : (
                    cart.map((item) => (
                      <motion.div 
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            ${item.price.toFixed(2)} x {item.quantity}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.type === 'product' && (
                            <div className="flex items-center gap-1 bg-background rounded-md border px-1 h-8">
                              <button 
                                onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, item.quantity - 1); }}
                                className="w-6 h-full flex items-center justify-center hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
                              >
                                -
                              </button>
                              <span className="w-4 text-center text-sm font-medium">{item.quantity}</span>
                              <button 
                                onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, item.quantity + 1); }}
                                className="w-6 h-full flex items-center justify-center hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
                              >
                                +
                              </button>
                            </div>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => { e.stopPropagation(); removeFromCart(item.id); }}
                          >
                            <IoTrashOutline className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>

                {/* Customer Selection Section */}
                <div className="space-y-3 pb-4 border-b">
                  <label className="text-sm font-medium">Cliente (Opcional):</label>
                  <Popover open={customerSearchOpen} onOpenChange={setCustomerSearchOpen}>
                    <PopoverTrigger asChild>
                      <div className="relative w-full">
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between h-10 pr-8"
                      >
                        {selectedCustomer ? (
                          <div className="flex items-center gap-2 overflow-hidden">
                            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-medium">
                                {selectedCustomer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </span>
                            </div>
                            <div className="text-left overflow-hidden">
                              <div className="flex items-center gap-2">
                                <span className="font-medium truncate">{selectedCustomer.name}</span>
                                <Badge 
                                  variant={selectedCustomer.status === 'VIP' ? 'default' : 'secondary'}
                                  className="text-xs h-4 px-1.5"
                                >
                                  {selectedCustomer.status}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground truncate">
                                {selectedCustomer.phone} • {selectedCustomer.licensePlate || 'Sin placa'}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <span className="flex items-center gap-2">
                            <IoPersonOutline className="h-4 w-4" />
                            Seleccionar cliente
                          </span>
                        )}
                      </Button>
                      {selectedCustomer && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCustomer(null);
                          }}
                        >
                          <IoCloseOutline className="h-4 w-4" />
                          <span className="sr-only">Quitar cliente</span>
                        </Button>
                      )}
                    </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0" align="start">
                      <Command>
                        <CommandInput 
                          placeholder="Buscar por nombre, teléfono o placa..." 
                          value={customerSearchQuery}
                          onValueChange={setCustomerSearchQuery}
                        />
                        <CommandEmpty>No se encontraron clientes.</CommandEmpty>
                        <CommandGroup className="max-h-[400px] overflow-y-auto">
                          {filteredCustomers.map((customer) => (
                            <CommandItem
                              key={customer.id}
                              value={`${customer.name} ${customer.phone} ${customer.licensePlate}`}
                              onSelect={() => {
                                setSelectedCustomer(customer);
                                setCustomerSearchOpen(false);
                                setCustomerSearchQuery('');
                              }}
                              className="group py-2 px-3 rounded-md transition-all duration-200 ease-in-out hover:bg-primary hover:shadow-sm cursor-pointer"
                            >
                              <div className="flex items-start gap-3 w-full">
                                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0 group-hover:bg-primary/80">
                                  <span className="text-sm font-medium group-hover:text-white">
                                    {customer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium truncate group-hover:text-white">{customer.name}</p>
                                    <Badge 
                                      variant={customer.status === 'VIP' ? 'default' : 'secondary'}
                                      className="text-xs h-4 px-1.5 group-hover:bg-white/20 group-hover:text-white"
                                    >
                                      {customer.status}
                                    </Badge>
                                  </div>
                                  <div className="text-xs text-muted-foreground flex flex-wrap gap-x-2 gap-y-0.5 group-hover:text-white/90">
                                    {customer.phone && <span className="flex items-center"><IoPhonePortraitOutline className="mr-1 h-3 w-3 group-hover:text-white" /> {customer.phone}</span>}
                                    {customer.licensePlate && <span className="flex items-center"><IoCarSportOutline className="mr-1 h-3 w-3 group-hover:text-white" /> {customer.licensePlate}</span>}
                                    {customer.vehicle && <span className="truncate">{customer.vehicle}</span>}
                                  </div>
                                </div>
                                {selectedCustomer?.id === customer.id && (
                                  <IoCheckmarkOutline className="h-4 w-4 ml-2 flex-shrink-0" />
                                )}
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  {/* Selected Customer Info */}
                  {selectedCustomer && (
                    <div className="p-3 bg-muted/50 rounded-lg space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{selectedCustomer.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedCustomer(null)}
                          className="h-6 px-2 text-xs"
                        >
                          <IoCloseOutline className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Tel: {selectedCustomer.phone}
                      </div>
                      {selectedCustomer.vehicle && (
                        <div className="text-xs text-muted-foreground">
                          {selectedCustomer.vehicle} - {selectedCustomer.licensePlate}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Quick Action Buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsCustomerDialogOpen(true)}
                      className="text-xs h-9"
                    >
                      <IoPersonOutline className="h-4 w-4 mr-1" />
                      Cliente
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsOrderDialogOpen(true)}
                      className="text-xs h-9"
                    >
                      <IoCartOutline className="h-4 w-4 mr-1" />
                      Pedido
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAppointmentDialogOpen(true)}
                      className="text-xs h-9"
                    >
                      <IoCalendarOutline className="h-4 w-4 mr-1" />
                      Cita
                    </Button>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <div className="flex justify-between items-end">
                    <span className="text-lg font-semibold">Subtotal:</span>
                    <span className="text-2xl font-bold text-primary">${calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span className="text-sm">En Bolívares:</span>
                    <span className="font-medium">Bs. {calculateBsPrice(calculateSubtotal())}</span>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <label className="text-sm font-medium">Método de pago:</label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={paymentMethod === "Efectivo" ? "default" : "outline"}
                      className={`h-20 flex flex-col gap-2 transition-all duration-200 ${paymentMethod === "Efectivo" ? "ring-2 ring-primary ring-offset-2" : "hover:border-primary/50"}`}
                      onClick={() => setPaymentMethod("Efectivo")}
                    >
                      <IoCashOutline className="h-6 w-6" />
                      <span className="text-xs">Efectivo</span>
                    </Button>
                    <Button
                      variant={paymentMethod === "Tarjeta" ? "default" : "outline"}
                      className={`h-20 flex flex-col gap-2 transition-all duration-200 ${paymentMethod === "Tarjeta" ? "ring-2 ring-primary ring-offset-2" : "hover:border-primary/50"}`}
                      onClick={() => setPaymentMethod("Tarjeta")}
                    >
                      <IoCardOutline className="h-6 w-6" />
                      <span className="text-xs">Tarjeta</span>
                    </Button>
                    <Button
                      variant={paymentMethod === "Transferencia" ? "default" : "outline"}
                      className={`h-20 flex flex-col gap-2 transition-all duration-200 ${paymentMethod === "Transferencia" ? "ring-2 ring-primary ring-offset-2" : "hover:border-primary/50"}`}
                      onClick={() => setPaymentMethod("Transferencia")}
                    >
                      <IoPhonePortraitOutline className="h-6 w-6" />
                      <span className="text-xs">Transf.</span>
                    </Button>
                  </div>
                </div>

                <motion.div
                  whileTap={{ scale: 0.95 }}
                  className="w-full mt-4"
                >
                  <Button 
                    className="w-full h-12 text-lg font-semibold shadow-md" 
                    size="lg"
                    onClick={processSale}
                    disabled={cart.length === 0 || !paymentMethod}
                  >
                    Procesar Venta
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Customer Creation Dialog */}
        <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Cliente</DialogTitle>
              <DialogDescription>
                Ingrese los datos del nuevo cliente.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre *</Label>
                  <Input
                    id="name"
                    value={customerFormData.name}
                    onChange={(e) => handleCustomerInputChange("name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono *</Label>
                  <Input
                    id="phone"
                    value={customerFormData.phone}
                    onChange={(e) => handleCustomerInputChange("phone", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerFormData.email}
                  onChange={(e) => handleCustomerInputChange("email", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vehicle">Vehículo</Label>
                  <Input
                    id="vehicle"
                    placeholder="Ej. Toyota Corolla"
                    value={customerFormData.vehicle}
                    onChange={(e) => handleCustomerInputChange("vehicle", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="licensePlate">Placa</Label>
                  <Input
                    id="licensePlate"
                    value={customerFormData.licensePlate}
                    onChange={(e) => handleCustomerInputChange("licensePlate", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vehicleType">Tipo de Vehículo</Label>
                  <Select
                    value={customerFormData.vehicleType}
                    onValueChange={(value) => handleCustomerInputChange("vehicleType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sedan">Sedan</SelectItem>
                      <SelectItem value="SUV">SUV</SelectItem>
                      <SelectItem value="Camioneta">Camioneta</SelectItem>
                      <SelectItem value="Moto">Moto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Estatus</Label>
                  <Select
                    value={customerFormData.status}
                    onValueChange={(value) => handleCustomerInputChange("status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Normal">Normal</SelectItem>
                      <SelectItem value="Regular">Regular</SelectItem>
                      <SelectItem value="VIP">VIP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Image Upload Section */}
              <div className="space-y-2">
                <Label>Fotos del vehículo ({customerFormData.images.length}/10)</Label>
                <div className="grid grid-cols-5 gap-2 mt-2">
                  {customerFormData.images.map((img, index) => (
                    <div key={index} className="relative aspect-square group">
                      <img
                        src={img}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-full object-cover rounded-md border"
                      />
                      <button
                        onClick={() => handleRemoveImage(index)}
                        className="absolute -top-1 -right-1 bg-destructive text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label={`Eliminar imagen ${index + 1}`}
                      >
                        <IoCloseCircle className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {customerFormData.images.length < 10 && (
                    <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed rounded-md cursor-pointer hover:bg-muted/50 transition-colors">
                      <IoImagesOutline className="h-6 w-6 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground mt-1">Agregar</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCustomerDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveCustomer}>Guardar Cliente</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Order Creation Dialog */}
        <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Pedido</DialogTitle>
              <DialogDescription>
                Cree un nuevo pedido o cita para un cliente.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Tipo de Pedido</Label>
                <Tabs
                  value={orderFormData.orderType}
                  onValueChange={(value) => handleOrderInputChange("orderType", value)}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="walk-in">Por Llegada</TabsTrigger>
                    <TabsTrigger value="appointment">Cita Programada</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="space-y-2">
                <Label>Cliente *</Label>
                <Select
                  value={orderFormData.customerId.toString()}
                  onValueChange={(value) => handleOrderInputChange("customerId", parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        {customer.name} - {customer.licensePlate} ({customer.vehicle})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Servicios *</Label>
                <Popover open={servicesPopoverOpen} onOpenChange={setServicesPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <IoAddOutline className="mr-2 h-4 w-4" />
                      Seleccionar servicios
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0">
                    <Command>
                      <CommandInput placeholder="Buscar servicio..." />
                      <CommandEmpty>No se encontraron servicios.</CommandEmpty>
                      <CommandGroup>
                        {services.map((service) => (
                          <CommandItem
                            key={service.id}
                            onSelect={() => {
                              const currentServices = orderFormData.services;
                              const currentNames = orderFormData.serviceNames;
                              if (!currentServices.includes(service.id)) {
                                handleOrderInputChange("services", [...currentServices, service.id]);
                                handleOrderInputChange("serviceNames", [...currentNames, service.name]);
                              }
                            }}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span>{service.name}</span>
                              <span>${service.price}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                
                {/* Selected Services Tags */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {orderFormData.services.map((serviceId) => {
                    const service = services.find(s => s.id === serviceId);
                    if (!service) return null;
                    return (
                      <Badge key={serviceId} variant="secondary" className="gap-1">
                        {service.name}
                        <button
                          aria-label={`Eliminar ${service.name}`}
                          onClick={() => {
                            handleOrderInputChange("services", orderFormData.services.filter(id => id !== serviceId));
                            handleOrderInputChange("serviceNames", orderFormData.serviceNames.filter(name => name !== service.name));
                          }}
                          className="ml-1 hover:bg-destructive/20 rounded-full"
                        >
                          <IoCloseOutline className="h-3 w-3" />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              </div>

              {orderFormData.orderType === "appointment" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="orderDate">Fecha *</Label>
                    <Input
                      id="orderDate"
                      type="date"
                      value={orderFormData.date}
                      onChange={(e) => handleOrderInputChange("date", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orderTime">Hora *</Label>
                    <Input
                      id="orderTime"
                      type="time"
                      value={orderFormData.time}
                      onChange={(e) => handleOrderInputChange("time", e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="orderNotes">Notas</Label>
                <Textarea
                  id="orderNotes"
                  value={orderFormData.notes}
                  onChange={(e) => handleOrderInputChange("notes", e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOrderDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveOrder}>Crear Pedido</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Appointment Creation Dialog */}
        <Dialog open={isAppointmentDialogOpen} onOpenChange={setIsAppointmentDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Agendar Nueva Cita</DialogTitle>
              <DialogDescription>
                Programe una nueva cita rápidamente.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="apptClient">Cliente *</Label>
                <Input
                  id="apptClient"
                  placeholder="Nombre del cliente"
                  value={appointmentFormData.client}
                  onChange={(e) => handleAppointmentInputChange("client", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apptService">Servicio *</Label>
                <Input
                  id="apptService"
                  placeholder="Ej. Lavado Completo"
                  value={appointmentFormData.service}
                  onChange={(e) => handleAppointmentInputChange("service", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="apptDate">Fecha *</Label>
                  <Input
                    id="apptDate"
                    type="date"
                    value={appointmentFormData.date}
                    onChange={(e) => handleAppointmentInputChange("date", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apptTime">Hora *</Label>
                  <Input
                    id="apptTime"
                    type="time"
                    value={appointmentFormData.time}
                    onChange={(e) => handleAppointmentInputChange("time", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="apptPhone">Teléfono</Label>
                <Input
                  id="apptPhone"
                  value={appointmentFormData.phone}
                  onChange={(e) => handleAppointmentInputChange("phone", e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAppointmentDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveAppointment}>Agendar Cita</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showThankYouModal} onOpenChange={closeAndClear}>
          <DialogContent className="sm:max-w-md border-0 shadow-2xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex flex-col items-center text-center space-y-6 py-6"
            >
              <motion.div 
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
                className="flex justify-center"
              >
                <div className="rounded-full bg-green-100 p-3">
                  <IoCheckmarkCircleOutline className="h-16 w-16 text-green-600" />
                </div>
              </motion.div>

              <DialogHeader className="space-y-6">
                <div className="space-y-2">
                  <DialogTitle className="text-2xl font-bold text-center text-gray-900">
                    ¡Gracias por su compra!
                  </DialogTitle>
                  <DialogDescription className="text-center text-gray-500">
                    Su pedido ha sido procesado exitosamente.
                  </DialogDescription>
                </div>
                
                {selectedCustomer && (
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 rounded-lg border border-gray-200 shadow-sm hover:shadow transition-shadow duration-200">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-base font-semibold text-gray-800 flex items-center">
                        <IoPersonCircleOutline className="mr-1.5 h-4 w-4 text-primary" />
                        Cliente
                      </h3>
                      {selectedCustomer.status && (
                        <Badge 
                          variant={selectedCustomer.status === 'VIP' ? 'default' : 'secondary'}
                          className="px-2 py-1 text-xs font-medium"
                        >
                          {selectedCustomer.status}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-900">{selectedCustomer.name}</p>
                      {selectedCustomer.phone && (
                        <p className="text-gray-600">{selectedCustomer.phone}</p>
                      )}
                      {(selectedCustomer.vehicle || selectedCustomer.licensePlate) && (
                        <p className="text-gray-700">
                          {selectedCustomer.vehicle} 
                          {selectedCustomer.licensePlate && `(${selectedCustomer.licensePlate})`}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </DialogHeader>

              {lastSale && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="w-full bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3"
                >
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">ID de Pedido</span>
                    <span className="font-mono font-medium text-gray-900">{lastSale.id}</span>
                  </div>
                  <div className="h-px bg-gray-200 w-full"></div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Total Pagado</span>
                    <div className="text-right">
                      <div className="font-bold text-xl text-primary">${lastSale.total.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">Bs. {calculateBsPrice(lastSale.total)}</div>
                    </div>
                  </div>
                </motion.div>
              )}

              <DialogFooter className="flex flex-col sm:flex-row gap-3 w-full sm:justify-center mt-4">
                <Button
                  onClick={exportToPDF}
                  className="flex-1 gap-2 bg-primary hover:bg-primary/90 text-white shadow-sm"
                >
                  <IoDownloadOutline className="h-5 w-5" />
                  Descargar Recibo
                </Button>
                <Button
                  variant="outline"
                  onClick={closeAndClear}
                  className="flex-1 border-gray-200 hover:bg-gray-50 hover:text-gray-900"
                >
                  Cerrar
                </Button>
              </DialogFooter>
            </motion.div>
          </DialogContent>
        </Dialog>

        <BarcodeScanner
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          onScan={handleBarcodeScanned}
          title="Escanear Producto para Agregar al Carrito"
        />
      </motion.div>
    </div>
  );
};

export default POS;
