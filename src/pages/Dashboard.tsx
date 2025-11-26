import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  IoCarSportOutline, 
  IoCalendarOutline, 
  IoPeopleOutline,
  IoCashOutline 
} from "react-icons/io5";

const statsCards = [
  {
    title: "Servicios Hoy",
    value: "12",
    icon: IoCarSportOutline,
    color: "from-primary to-primary/80",
  },
  {
    title: "Citas Pendientes",
    value: "8",
    icon: IoCalendarOutline,
    color: "from-secondary to-secondary/80",
  },
  {
    title: "Clientes Activos",
    value: "156",
    icon: IoPeopleOutline,
    color: "from-accent to-accent/80",
  },
  {
    title: "Ingresos del Día",
    value: "$1,240",
    icon: IoCashOutline,
    color: "from-primary to-secondary",
  },
];

const recentActivities = [
  { client: "Juan Pérez", service: "Lavado Completo", time: "10:30 AM", status: "Completado" },
  { client: "María García", service: "Encerado", time: "11:00 AM", status: "En Proceso" },
  { client: "Carlos López", service: "Pulido", time: "11:30 AM", status: "Pendiente" },
  { client: "Ana Martínez", service: "Lavado Express", time: "12:00 PM", status: "Completado" },
];

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Resumen general de operaciones</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-primary">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-3 rounded-full bg-gradient-to-br ${stat.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-lg">
              <IoCalendarOutline className="h-5 w-5 text-primary" />
            </div>
            Actividad Reciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-muted/30 to-muted/10 hover:shadow-md transition-all duration-300 border border-border/50"
              >
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{activity.client}</p>
                  <p className="text-sm text-muted-foreground">{activity.service}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-muted-foreground">{activity.time}</span>
                  <span
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold shadow-sm ${
                      activity.status === "Completado"
                        ? "bg-green-100 text-green-800"
                        : activity.status === "En Proceso"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {activity.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
