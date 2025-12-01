import { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { IoAddOutline, IoTrashOutline, IoPencilOutline, IoCubeOutline } from "react-icons/io5";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Toaster } from "@/components/ui/toaster";

interface Service {
  id: number;
  name: string;
  description: string;
  price: string;
  popular: boolean;
}

const initialServices: Service[] = [
  {
    id: 1,
    name: "Lavado Express",
    description: "Lavado exterior rápido y eficiente",
    price: "5",
    popular: false,
  },
  {
    id: 2,
    name: "Lavado Completo",
    description: "Lavado exterior e interior profundo",
    price: "10",
    popular: true,
  },
  {
    id: 3,
    name: "Encerado Premium",
    description: "Encerado profesional con cera de alta calidad",
    price: "20",
    popular: true,
  },
];

const Services = () => {
  const [services, setServices] = useState<Service[]>(initialServices);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [dolarRate, setDolarRate] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
  });
  const { toast } = useToast();

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
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateBsPrice = (usdPrice: string) => {
    if (!dolarRate) return 'Cargando...';
    const price = parseFloat(usdPrice) || 0;
    return (price * dolarRate).toFixed(2);
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      toast({
        title: "Error",
        description: "Por favor complete los campos obligatorios.",
        variant: "destructive",
      });
      return;
    }

    if (editingId !== null) {
      setServices(services.map(service => 
        service.id === editingId 
          ? { 
              ...service, 
              name: formData.name, 
              description: formData.description, 
              price: formData.price 
            } 
          : service
      ));
      toast({
        title: "Servicio actualizado",
        description: "El servicio ha sido actualizado exitosamente.",
      });
    } else {
      const newService: Service = {
        id: Date.now(),
        name: formData.name,
        description: formData.description,
        price: formData.price,
        popular: false,
      };
      setServices([...services, newService]);
      toast({
        title: "Servicio agregado",
        description: "El servicio ha sido agregado exitosamente.",
      });
    }

    setFormData({ name: "", price: "", description: "" });
    setEditingId(null);
    setIsDialogOpen(false);
  };

  const handleEditClick = (service: Service) => {
    setFormData({
      name: service.name,
      price: service.price,
      description: service.description,
    });
    setEditingId(service.id);
    setIsDialogOpen(true);
  };

  const handleDeleteService = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setServices(services.filter(service => service.id !== id));
    toast({
      title: "Servicio eliminado",
      description: "El servicio ha sido eliminado exitosamente.",
    });
  };

  const handleAddNewClick = () => {
    setFormData({ name: "", price: "", description: "" });
    setEditingId(null);
    setIsDialogOpen(true);
  };

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
    <div className="p-6">
      <Toaster />
      <motion.div 
        className="space-y-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Servicios</h1>
            <p className="text-muted-foreground">Gestiona los servicios de tu negocio</p>
          </div>
          <motion.div variants={itemVariants}>
            <Button 
              onClick={handleAddNewClick} 
              className="gap-2"
            >
              <IoAddOutline className="h-5 w-5" />
              Nuevo Servicio
            </Button>
          </motion.div>
        </div>

      <motion.div 
        className="rounded-md border overflow-hidden shadow-sm"
        variants={itemVariants}
      >
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <th className="h-12 px-4 text-center align-middle font-medium">Servicio</th>
                <th className="h-12 px-4 text-center align-middle font-medium">Descripción</th>
                <th className="h-12 px-4 text-center align-middle font-medium">Precio (USD)</th>
                <th className="h-12 px-4 text-center align-middle font-medium">Precio (Bs)</th>
                <th className="h-12 px-4 text-center align-middle font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {services.map((service, index) => (
                <motion.tr 
                  key={service.id} 
                  className="border-b transition-colors hover:bg-muted/50"
                  custom={index}
                  variants={itemVariants}
                >
                  <td className="p-4 text-center align-middle font-medium">
                    <div className="flex items-center justify-center gap-2">
                      <IoCubeOutline className="h-5 w-5 text-primary" />
                      <span>{service.name}</span>
                      {service.popular && (
                        <Badge className="ml-2 bg-gradient-to-r from-primary to-secondary">
                          Popular
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-center align-middle text-muted-foreground">
                    {service.description}
                  </td>
                  <td className="p-4 text-center align-middle font-medium">
 ${parseFloat(service.price).toFixed(2)}
                  </td>
                  <td className="p-4 text-center align-middle font-medium">
                    {`Bs. ${calculateBsPrice(service.price)}`}
                  </td>
                  <td className="p-4 text-center align-middle">
                    <div className="flex justify-center gap-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleEditClick(service)}
                      >
                        <IoPencilOutline className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => handleDeleteService(e, service.id)}
                      >
                        <IoTrashOutline className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && setIsDialogOpen(false)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingId !== null ? 'Editar Servicio' : 'Nuevo Servicio'}
            </DialogTitle>
            <DialogDescription>
              {editingId !== null 
                ? 'Actualiza la información del servicio.'
                : 'Completa la información para agregar un nuevo servicio.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nombre <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="Ej. Lavado Completo"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Precio (USD) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="0.00"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Descripción
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="Descripción del servicio"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" onClick={(e) => handleSaveService(e)}>
              {editingId !== null ? 'Actualizar' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </motion.div>
    </div>
  );
};

export default Services;
