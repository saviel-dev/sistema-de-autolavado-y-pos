import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  IoCarSportOutline, 
  IoCalendarOutline, 
  IoPeopleOutline,
  IoCashOutline,
  IoTrendingUpOutline,
  IoCheckmarkCircle,
  IoTime,
  IoAlertCircle
} from "react-icons/io5";

interface DolarData {
  promedio: number;
  fechaActualizacion: string;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-VE', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStatsCards = (dolarRate?: DolarData) => [
  {
    title: "Servicios Hoy",
    value: "12",
    icon: IoCarSportOutline,
    bgColor: "bg-blue-600",
    iconColor: "text-blue-100"
  },
  {
    title: "Pedidos Pendientes",
    value: "8",
    icon: IoCalendarOutline,
    bgColor: "bg-green-600",
    iconColor: "text-green-100"
  },
  {
    title: "Tasa BCV",
    value: dolarRate ? `Bs. ${dolarRate.promedio.toFixed(2)}` : "Bs. 0.00",
    icon: IoTrendingUpOutline,
    bgColor: "bg-emerald-600",
    iconColor: "text-emerald-100",
    showBs: false,
    isRate: true,
    subtitle: dolarRate ? formatDate(dolarRate.fechaActualizacion) : ""
  },
  {
    title: "Ingresos del Día",
    value: "12.50",
    icon: IoCashOutline,
    bgColor: "bg-amber-600",
    iconColor: "text-amber-100",
    showBs: true
  },
];

const recentActivities = [
  { client: "José Rodríguez", service: "Lavado Completo", time: "10:30 AM", status: "Completado" },
  { client: "María González", service: "Encerado", time: "11:00 AM", status: "En Proceso" },
  { client: "Carlos Pérez", service: "Pulido", time: "11:30 AM", status: "Pendiente" },
  { client: "Ana Martínez", service: "Lavado Express", time: "12:00 PM", status: "Completado" },
];

const Dashboard = () => {
  const [dolarData, setDolarData] = useState<DolarData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDolarRate = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
        if (!response.ok) {
          throw new Error('Error al obtener la tasa del dólar');
        }
        const data = await response.json();
        setDolarData({
          promedio: data.promedio,
          fechaActualizacion: data.fechaActualizacion,
        });
        setError(null);
      } catch (err) {
        setError('No se pudo cargar la tasa');
        console.error('Error fetching dolar rate:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDolarRate();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Resumen general de operaciones</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {getStatsCards(dolarData).map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className={`overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${stat.bgColor} text-white`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-white/90">
                  {stat.title}
                </CardTitle>
                <div className={`p-3 rounded-full bg-black/20`}>
                  <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-0.5">
                  <div className="text-3xl font-bold text-white">
                    {stat.isRate ? stat.value : (stat.showBs ? `$ ${stat.value}` : stat.value)}
                  </div>
                  {stat.subtitle && (
                    <div className="text-xs text-white/80">
                      {stat.subtitle}
                    </div>
                  )}
                  {stat.showBs && dolarData && (
                    <div className="text-sm text-white/90">
                      Bs. {(parseFloat(stat.value) * dolarData.promedio).toFixed(2)}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* La tarjeta de la tasa del dólar ha sido movida al encabezado */}

      <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 pb-2">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <IoCalendarOutline className="h-5 w-5 text-primary" />
            </div>
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Actividad Reciente
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/50">
            {recentActivities.map((activity, index) => (
              <div
                key={index}
                className="group flex items-center justify-between p-4 hover:bg-muted/30 transition-all duration-200 hover:pl-6"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-lg ${
                    activity.status === "Completado"
                      ? "bg-green-100 text-green-600"
                      : activity.status === "En Proceso"
                      ? "bg-blue-100 text-blue-600"
                      : "bg-amber-100 text-amber-600"
                  }`}>
                    {activity.status === "Completado" ? (
                      <IoCheckmarkCircle className="h-5 w-5" />
                    ) : activity.status === "En Proceso" ? (
                      <IoTime className="h-5 w-5" />
                    ) : (
                      <IoAlertCircle className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                      {activity.client}
                    </p>
                    <p className="text-sm text-muted-foreground">{activity.service}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium text-muted-foreground">{activity.time}</span>
                  <span
                    className={`mt-1 px-3 py-1 rounded-full text-xs font-medium ${
                      activity.status === "Completado"
                        ? "bg-green-50 text-green-700 border border-green-100"
                        : activity.status === "En Proceso"
                        ? "bg-blue-50 text-blue-700 border border-blue-100"
                        : "bg-amber-50 text-amber-700 border border-amber-100"
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
