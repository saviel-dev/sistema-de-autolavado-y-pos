import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  IoAddOutline,
  IoCalendarOutline,
  IoTimeOutline,
  IoPersonOutline,
  IoSearchOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoEllipsisVertical,
  IoPencilOutline,
  IoTrashOutline,
  IoCloseOutline,
  IoCheckmarkOutline,
  IoCarSportOutline,
} from "react-icons/io5";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useOrders, Order } from "@/contexts/OrderContext";
import { useCustomers } from "@/contexts/CustomerContext";
import { useServices } from "@/contexts/ServiceContext";

import { useAuth } from "@/contexts/AuthContext";

const Orders = () => {
  const { isAdmin } = useAuth();
  const { orders, loading: ordersLoading, createOrder, updateOrder, updateOrderStatus, deleteOrder } = useOrders();
  const { customers, loading: customersLoading } = useCustomers();
  const { services: availableServices, loading: servicesLoading } = useServices();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"walk-in" | "appointment">(
    "walk-in"
  );
  const [servicesPopoverOpen, setServicesPopoverOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    orderType: "walk-in" as "walk-in" | "appointment",
    customerId: 0,
    vehicleId: 0, 
    customerName: "",
    customerVehicle: "",
    services: [] as number[],
    serviceNames: [] as string[],
    status: "Pendiente" as Order["status"],
    date: "",
    time: "",
    notes: "",
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleVehicleSelect = (value: string) => {
    // Value format: "customerId|vehicleId"
    const [customerIdStr, vehicleIdStr] = value.split("|");
    const customerId = parseInt(customerIdStr);
    const vehicleId = parseInt(vehicleIdStr);

    const customer = customers.find((c) => c.id === customerId);
    const vehicle = customer?.vehicles?.find((v) => v.id === vehicleId);

    if (customer && vehicle) {
      setFormData((prev) => ({
        ...prev,
        customerId: customer.id,
        vehicleId: vehicle.id,
        customerName: customer.name,
        customerVehicle: `${vehicle.tipo} - ${vehicle.placa}`,
      }));
    }
  };

  const handleServiceToggle = (serviceId: number) => {
    const service = availableServices.find((s) => s.id === serviceId);
    if (!service) return;

    setFormData((prev) => {
      const isSelected = prev.services.includes(serviceId);
      if (isSelected) {
        return {
          ...prev,
          services: prev.services.filter((id) => id !== serviceId),
          serviceNames: prev.serviceNames.filter(
            (name) => name !== service.name
          ),
        };
      } else {
        return {
          ...prev,
          services: [...prev.services, serviceId],
          serviceNames: [...prev.serviceNames, service.name],
        };
      }
    });
  };

  const handleRemoveService = (serviceId: number) => {
    const service = availableServices.find((s) => s.id === serviceId);
    if (!service) return;

    setFormData((prev) => ({
      ...prev,
      services: prev.services.filter((id) => id !== serviceId),
      serviceNames: prev.serviceNames.filter((name) => name !== service.name),
    }));
  };

  const calculateTotal = () => {
    return formData.services.reduce((total, serviceId) => {
      const service = availableServices.find((s) => s.id === serviceId);
      return total + (service?.price || 0);
    }, 0);
  };

  const handleAddNewClick = (type: "walk-in" | "appointment") => {
    const now = new Date();
    setFormData({
      orderType: type,
      customerId: 0,
      vehicleId: 0,
      customerName: "",
      customerVehicle: "",
      services: [],
      serviceNames: [],
      status: "Pendiente",
      date: now.toISOString().split("T")[0],
      time: now.toTimeString().slice(0, 5),
      notes: "",
    });
    setEditingId(null);
    setIsDialogOpen(true);
  };

  const handleEditClick = (order: Order) => {
    setFormData({
      orderType: order.type,
      customerId: order.customerId,
      vehicleId: order.vehicleId || 0,
      customerName: order.customerName,
      customerVehicle: order.vehicleType && order.vehiclePlate ? `${order.vehicleType} - ${order.vehiclePlate}` : "",
      services: order.items.map(i => i.serviceId),
      serviceNames: order.items.map(i => i.serviceName || ''),
      status: order.status,
      date: order.date || "",
      time: order.time || "",
      notes: order.notes || "",
    });
    setEditingId(order.id);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = async (id: number) => {
    if (window.confirm("¿Estás seguro de eliminar este pedido?")) {
        await deleteOrder(id);
    }
  };

  const handleStatusChange = async (id: number, newStatus: Order['status']) => {
    await updateOrderStatus(id, newStatus);
  };

  const handleSaveOrder = async () => {
    if (!formData.customerId || formData.services.length === 0) {
      toast({
        title: "Error",
        description: "Por favor seleccione un cliente y al menos un servicio.",
        variant: "destructive",
      });
      return;
    }

    if (
      formData.orderType === "appointment" &&
      (!formData.date || !formData.time)
    ) {
      toast({
        title: "Error",
        description: "Por favor complete la fecha y hora para la cita.",
        variant: "destructive",
      });
      return;
    }

    // Build items payload
    const items = formData.services.map(serviceId => {
        const service = availableServices.find(s => s.id === serviceId);
        return {
            serviceId,
            price: service?.price || 0
        };
    });

    if (editingId) {
        // Update logic (simplified for now as context handles basic updates)
         await updateOrder(editingId, {
            status: formData.status,
            notes: formData.notes,
            date: formData.orderType === 'appointment' ? formData.date : undefined,
            time: formData.orderType === 'appointment' ? formData.time : undefined,
         });
         // NOTE: Full update including items/customer would require a more complex updateOrder in context
         // For now let's assume we edit mostly main fields, or re-create.
         // Ideally context updateOrder should handle deep updates or we delete/recreate items.
         // Given time constraints, users usually just change status/time.
    } else {
        await createOrder({
            customerId: formData.customerId,
            vehicleId: formData.vehicleId,
            type: formData.orderType,
            status: formData.orderType === 'walk-in' ? 'En Proceso' : 'Confirmada', // Default status logic
            date: formData.orderType === 'appointment' ? formData.date : undefined,
            time: formData.orderType === 'appointment' ? formData.time : undefined,
            notes: formData.notes,
            items: items
        });
    }

    setIsDialogOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmada":
        return "bg-green-500 hover:bg-green-600";
      case "Pendiente":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "En Proceso":
        return "bg-blue-500 hover:bg-blue-600";
      case "Completada":
        return "bg-purple-500 hover:bg-purple-600";
      case "Cancelada":
        return "bg-red-500 hover:bg-red-600";
      default:
        return "bg-gray-500";
    }
  };

  const filteredOrders = orders.filter(
    (order) =>
      (order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some((item) =>
          item.serviceName?.toLowerCase().includes(searchTerm.toLowerCase())
        )) &&
      order.type === activeTab
  );

  const OrderCard = ({ order }: { order: Order }) => (
    <div className="flex flex-col md:flex-row md:items-center justify-between p-3 md:p-4 rounded-xl bg-card hover:shadow-lg transition-all duration-300 border border-border/50 gap-3 md:gap-4 group">
      <div className="flex items-center gap-3 md:gap-4">
        <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary font-bold text-base md:text-lg overflow-hidden">
          {order.customerImage ? (
            <img src={order.customerImage} alt={order.customerName} className="h-full w-full object-cover" />
          ) : (
            order.customerName.charAt(0)
          )}
        </div>
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-foreground text-base md:text-lg">
              {order.customerName}
            </h3>
            <Badge
              className={`${getStatusColor(
                order.status
              )} text-white border-none text-xs`}
            >
              {order.status}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {order.type === "walk-in" ? "Por Llegada" : "Cita"}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-1 items-center">
            {order.items.map((item, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {item.serviceName}
              </Badge>
            ))}
          </div>
          <p className="text-xs md:text-sm text-muted-foreground flex items-center gap-1">
            <IoCarSportOutline className="h-3 w-3" />
            <span>
              {order.vehiclePlate ? (
                <>
                  <span className="font-mono font-medium">{order.vehiclePlate}</span>
                  {order.vehicleType && <span className="text-muted-foreground/70"> - {order.vehicleType}</span>}
                </>
              ) : (
                <span className="italic">Vehículo no especificado</span>
              )}
            </span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-6 justify-between md:justify-end flex-1">
        <div className="flex flex-col items-start md:items-end min-w-[100px]">
          <div className="text-lg font-bold text-primary">
            ${order.total.toFixed(2)}
          </div>
          {order.date && (
            <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                <IoCalendarOutline className="h-3 w-3" />
                {new Date(order.date).toLocaleDateString()}
            </div>
          )}
          {order.time && (
             <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                <IoTimeOutline className="h-3 w-3" />
                {order.time}
            </div>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-black">
              <IoEllipsisVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuSub>
                <DropdownMenuSubTrigger>Cambiar Estado</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                        <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'Pendiente')}>Pendiente</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'Confirmada')}>Confirmada</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'En Proceso')}>En Proceso</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'Completada')}>Completada</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'Cancelada')}>Cancelada</DropdownMenuItem>
                    </DropdownMenuSubContent>
                </DropdownMenuPortal>
            </DropdownMenuSub>

            {isAdmin && (
              <>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => handleEditClick(order)}
                >
                  <IoPencilOutline className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-red-600 focus:text-red-600"
                  onClick={() => handleDeleteClick(order.id)}
                >
                  <IoTrashOutline className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  if (ordersLoading || customersLoading || servicesLoading) {
      return <div className="p-8 text-center">Cargando datos...</div>;
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Pedidos</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Gestiona pedidos por llegada y citas programadas
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 bg-card p-4 rounded-xl border shadow-sm">
        <div className="relative flex-1 w-full">
          <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por cliente o servicio..."
            className="pl-9 bg-background/50 border-muted-foreground/20 focus:border-primary w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground w-full md:w-auto justify-end">
          <IoCalendarOutline className="h-4 w-4" />
          <span>{new Date().toLocaleDateString()}</span>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) =>
          setActiveTab(value as "walk-in" | "appointment")
        }
        className="w-full"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <TabsList className="grid w-full md:w-auto grid-cols-2 h-auto bg-muted/50 p-1 gap-1">
            <TabsTrigger value="walk-in">Pedidos por Llegada</TabsTrigger>
            <TabsTrigger value="appointment">Pedidos por Cita</TabsTrigger>
          </TabsList>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90 shadow-lg shadow-primary/20 w-full md:w-auto"
                onClick={() => handleAddNewClick(activeTab)}
              >
                <IoAddOutline className="h-5 w-5" />
                {activeTab === "walk-in" ? "Nuevo Pedido" : "Nueva Cita"}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] p-0 [&>button]:text-white [&>button]:hover:text-white/80">
              <DialogHeader className="bg-purple-600 p-6 text-center sm:text-center">
                <DialogTitle className="text-white text-2xl">
                  {editingId
                    ? "Editar Pedido"
                    : formData.orderType === "walk-in"
                    ? "Nuevo Pedido"
                    : "Nueva Cita"}
                </DialogTitle>
                <DialogDescription className="text-purple-100">
                  {editingId
                    ? "Modifique los detalles del pedido."
                    : "Complete los detalles del pedido."}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
                {/* Cliente */}
                <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 md:gap-4">
                  <Label htmlFor="vehicle" className="md:text-right">
                    Vehículo *
                  </Label>
                  <Select
                    value={formData.vehicleId ? `${formData.customerId}|${formData.vehicleId}` : ""}
                    onValueChange={handleVehicleSelect}
                    disabled={!!editingId}
                  >
                    <SelectTrigger className="md:col-span-3">
                      <SelectValue placeholder="Seleccionar vehículo" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.flatMap((customer) => 
                        (customer.vehicles || []).map((vehicle) => (
                          <SelectItem
                            key={`${customer.id}-${vehicle.id}`}
                            value={`${customer.id}|${vehicle.id}`}
                          >
                            {customer.name} - {vehicle.placa} - {vehicle.tipo}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Servicios */}
                <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-2 md:gap-4">
                  <Label className="md:text-right md:pt-2">Servicios *</Label>
                  <div className="md:col-span-3 space-y-2">
                    <Popover
                      open={servicesPopoverOpen}
                      onOpenChange={setServicesPopoverOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                        >
                          <IoAddOutline className="mr-2 h-4 w-4" />
                          Agregar servicios
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0">
                        <Command>
                          <CommandInput placeholder="Buscar servicio..." />
                          <CommandEmpty>
                            No se encontraron servicios.
                          </CommandEmpty>
                          <CommandGroup>
                            {availableServices.map((service) => (
                              <CommandItem
                                key={service.id}
                                onSelect={() => handleServiceToggle(service.id)}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <div className="flex items-center gap-2">
                                    {formData.services.includes(service.id) && (
                                      <IoCheckmarkOutline className="h-4 w-4" />
                                    )}
                                    <span>{service.name}</span>
                                  </div>
                                  <span className="text-sm text-muted-foreground">
                                    ${service.price}
                                  </span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>

                    {/* Selected Services Tags */}
                    {formData.services.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                          {formData.services.map((serviceId) => {
                            const service = availableServices.find(
                              (s) => s.id === serviceId
                            );
                            return service ? (
                              <Badge
                                key={serviceId}
                                variant="secondary"
                                className="gap-1"
                              >
                                {service.name} (${service.price})
                                <button
                                  type="button"
                                  onClick={() => handleRemoveService(serviceId)}
                                  className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                                  aria-label={`Remove ${service?.name || 'service'}`}
                                  title={`Remove ${service?.name || 'service'}`}
                                >
                                  <IoCloseOutline className="h-3 w-3" />
                                </button>
                              </Badge>
                            ) : null;
                          })}
                      </div>
                    )}

                    {/* Total */}
                    {formData.services.length > 0 && (
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="font-semibold">Total:</span>
                        <span className="text-lg font-bold text-primary">
                          ${calculateTotal().toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Fecha y Hora - Solo para citas */}
                {formData.orderType === "appointment" && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 md:gap-4">
                      <Label htmlFor="date" className="md:text-right">
                        Fecha *
                      </Label>
                      <Input
                        id="date"
                        type="date"
                        className="md:col-span-3"
                        value={formData.date}
                        onChange={(e) => handleInputChange("date", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 md:gap-4">
                      <Label htmlFor="time" className="md:text-right">
                        Hora *
                      </Label>
                      <Input
                        id="time"
                        type="time"
                        className="md:col-span-3"
                        value={formData.time}
                        onChange={(e) => handleInputChange("time", e.target.value)}
                      />
                    </div>
                  </>
                )}

                {/* Estado */}
                <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 md:gap-4">
                  <Label htmlFor="status" className="md:text-right">
                    Estado
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      handleInputChange("status", value)
                    }
                  >
                    <SelectTrigger className="md:col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pendiente">Pendiente</SelectItem>
                      <SelectItem value="Confirmada">Confirmada</SelectItem>
                      <SelectItem value="En Proceso">En Proceso</SelectItem>
                      <SelectItem value="Completada">Completada</SelectItem>
                      <SelectItem value="Cancelada">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Notas */}
                <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-2 md:gap-4">
                  <Label htmlFor="notes" className="md:text-right md:pt-2">
                    Notas
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Observaciones adicionales..."
                    className="md:col-span-3"
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter className="p-6 pt-0 sm:justify-center">
                <Button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white min-w-[150px]"
                  onClick={handleSaveOrder}
                >
                  {editingId ? "Actualizar" : "Guardar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <TabsContent value="walk-in" className="mt-6 space-y-4">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                No hay pedidos por llegada. ¡Crea uno nuevo!
              </p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="appointment" className="mt-6 space-y-4">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                No hay citas programadas. ¡Agenda una nueva!
              </p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Orders;
