import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IoAddOutline, IoCarSportOutline } from "react-icons/io5";

const services = [
  {
    name: "Lavado Express",
    description: "Lavado exterior rápido y eficiente",
    duration: "15 min",
    price: "$50",
    popular: false,
  },
  {
    name: "Lavado Completo",
    description: "Lavado exterior e interior profundo",
    duration: "45 min",
    price: "$120",
    popular: true,
  },
  {
    name: "Encerado Premium",
    description: "Encerado profesional con cera de alta calidad",
    duration: "60 min",
    price: "$200",
    popular: true,
  },
  {
    name: "Pulido de Faros",
    description: "Restauración y pulido de faros delanteros",
    duration: "30 min",
    price: "$80",
    popular: false,
  },
  {
    name: "Limpieza de Motor",
    description: "Limpieza profunda del compartimento del motor",
    duration: "40 min",
    price: "$150",
    popular: false,
  },
  {
    name: "Detallado Completo",
    description: "Servicio premium con todo incluido",
    duration: "3 hrs",
    price: "$400",
    popular: true,
  },
];

const Services = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Servicios</h1>
          <p className="text-muted-foreground">Gestiona los servicios ofrecidos</p>
        </div>
        <Button className="gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90">
          <IoAddOutline className="h-5 w-5" />
          Nuevo Servicio
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow relative overflow-hidden">
            {service.popular && (
              <Badge className="absolute top-4 right-4 bg-gradient-to-r from-primary to-secondary">
                Popular
              </Badge>
            )}
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="p-3 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10">
                  <IoCarSportOutline className="h-6 w-6 text-primary" />
                </div>
              </div>
              <CardTitle className="mt-4">{service.name}</CardTitle>
              <CardDescription>{service.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Duración</span>
                <span className="font-medium">{service.duration}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-2xl font-bold text-primary">{service.price}</span>
                <Button variant="outline" size="sm" className="hover:bg-primary/10">
                  Editar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Services;
