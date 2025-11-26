import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IoAddOutline, IoCalendarOutline } from "react-icons/io5";

const appointments = [
  {
    id: 1,
    client: "Juan Pérez",
    service: "Lavado Completo",
    date: "2024-01-15",
    time: "10:00 AM",
    status: "Confirmada",
    phone: "(555) 123-4567",
  },
  {
    id: 2,
    client: "María García",
    service: "Encerado Premium",
    date: "2024-01-15",
    time: "11:30 AM",
    status: "Pendiente",
    phone: "(555) 234-5678",
  },
  {
    id: 3,
    client: "Carlos López",
    service: "Detallado Completo",
    date: "2024-01-15",
    time: "02:00 PM",
    status: "Confirmada",
    phone: "(555) 345-6789",
  },
  {
    id: 4,
    client: "Ana Martínez",
    service: "Lavado Express",
    date: "2024-01-15",
    time: "03:30 PM",
    status: "Pendiente",
    phone: "(555) 456-7890",
  },
  {
    id: 5,
    client: "Luis Rodríguez",
    service: "Pulido de Faros",
    date: "2024-01-16",
    time: "09:00 AM",
    status: "Confirmada",
    phone: "(555) 567-8901",
  },
];

const Appointments = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Citas</h1>
          <p className="text-muted-foreground">Administra las citas programadas</p>
        </div>
        <Button className="gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90">
          <IoAddOutline className="h-5 w-5" />
          Nueva Cita
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IoCalendarOutline className="h-6 w-6 text-primary" />
            Próximas Citas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors gap-4"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground">{appointment.client}</p>
                    <Badge
                      variant={appointment.status === "Confirmada" ? "default" : "secondary"}
                      className={appointment.status === "Confirmada" ? "bg-primary" : ""}
                    >
                      {appointment.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{appointment.service}</p>
                  <p className="text-xs text-muted-foreground">{appointment.phone}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">{appointment.date}</p>
                    <p className="text-sm text-muted-foreground">{appointment.time}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="hover:bg-primary/10">
                      Ver
                    </Button>
                    <Button variant="outline" size="sm" className="hover:bg-destructive/10 hover:text-destructive">
                      Cancelar
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

export default Appointments;
