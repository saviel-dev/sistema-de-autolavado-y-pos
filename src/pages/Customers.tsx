import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { IoAddOutline, IoSearchOutline, IoPeopleOutline } from "react-icons/io5";

const customers = [
  {
    id: 1,
    name: "Juan Pérez",
    email: "juan.perez@email.com",
    phone: "(555) 123-4567",
    vehicle: "Toyota Corolla 2020",
    visits: 12,
    status: "VIP",
  },
  {
    id: 2,
    name: "María García",
    email: "maria.garcia@email.com",
    phone: "(555) 234-5678",
    vehicle: "Honda Civic 2021",
    visits: 8,
    status: "Regular",
  },
  {
    id: 3,
    name: "Carlos López",
    email: "carlos.lopez@email.com",
    phone: "(555) 345-6789",
    vehicle: "Ford F-150 2019",
    visits: 15,
    status: "VIP",
  },
  {
    id: 4,
    name: "Ana Martínez",
    email: "ana.martinez@email.com",
    phone: "(555) 456-7890",
    vehicle: "Mazda CX-5 2022",
    visits: 5,
    status: "Regular",
  },
  {
    id: 5,
    name: "Luis Rodríguez",
    email: "luis.rodriguez@email.com",
    phone: "(555) 567-8901",
    vehicle: "Chevrolet Silverado 2020",
    visits: 3,
    status: "Nuevo",
  },
];

const Customers = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Clientes</h1>
          <p className="text-muted-foreground">Gestiona tu base de clientes</p>
        </div>
        <Button className="gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90">
          <IoAddOutline className="h-5 w-5" />
          Nuevo Cliente
        </Button>
      </div>

      <Card className="shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <div className="bg-primary/10 p-2 rounded-lg">
                <IoPeopleOutline className="h-6 w-6 text-primary" />
              </div>
              Lista de Clientes
            </CardTitle>
            <div className="relative w-full md:w-64">
              <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cliente..."
                className="pl-10 focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {customers.map((customer) => (
              <div
                key={customer.id}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg bg-gradient-to-r from-muted/30 to-muted/10 hover:shadow-md transition-all duration-300 border border-border/50 gap-4"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-foreground">{customer.name}</p>
                    <Badge
                      variant={customer.status === "VIP" ? "default" : "secondary"}
                      className={`shadow-sm ${customer.status === "VIP" ? "bg-primary" : ""}`}
                    >
                      {customer.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{customer.email}</p>
                  <p className="text-sm text-muted-foreground">{customer.phone}</p>
                  <p className="text-sm font-semibold text-foreground">{customer.vehicle}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center px-5 py-3 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 shadow-sm">
                    <p className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{customer.visits}</p>
                    <p className="text-xs text-muted-foreground font-medium mt-1">Visitas</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="hover:bg-primary hover:text-primary-foreground transition-all">
                      Ver Perfil
                    </Button>
                    <Button variant="outline" size="sm" className="hover:bg-secondary hover:text-secondary-foreground transition-all">
                      Contactar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Customers;
