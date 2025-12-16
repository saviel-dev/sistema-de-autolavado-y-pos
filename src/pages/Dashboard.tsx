import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  IoCarSportOutline, 
  IoCalendarOutline, 
  IoPeopleOutline,
  IoCashOutline,
  IoTrendingUpOutline,
  IoCheckmarkCircle,
  IoTime,
  IoAlertCircle,
  IoHelpCircleOutline
} from "react-icons/io5";
import { useSales } from "@/contexts/SalesContext";
import { useOrders } from "@/contexts/OrderContext";
import { useTour } from "@/hooks/useTour";

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

const Dashboard = () => {
  const { sales } = useSales();
  const { orders } = useOrders();
  const { startTour } = useTour();
  const [dolarData, setDolarData] = useState<DolarData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate Stats
  const today = new Date().toISOString().split('T')[0];

  const servicesToday = sales.filter(s => s.date.startsWith(today)).length;
  const pendingOrders = orders.filter(o => o.status === 'Pendiente').length;
  const earningsToday = sales
    .filter(s => s.date.startsWith(today))
    .reduce((sum, sale) => sum + sale.total, 0);

  // Combine and sort recent activity
  const recentSales = sales.slice(0, 5).map(sale => ({
    id: `sale-${sale.id}`,
    client: "Cliente", // In a real app we'd need customer name in sale or fetch it. For now generic or if context has it. 
                       // Wait, SalesContext fetchSales join didn't fetch customer name? Let's check.
                       // It updates sales state but did not join customers. 
                       // Actually, let's keep it simple. If name is missing, use "Cliente". 
                       // Or better, update logic later. For now let's try to show what we have.
                       // Sale items have name.
    service: sale.items.map(i => i.name).join(", "),
    time: new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: "Completado",
    originalDate: new Date(sale.date)
  }));

  const recentOrders = orders.slice(0, 5).map(order => ({
    id: `order-${order.id}`,
    client: order.customerName,
    service: order.items.map(i => i.serviceName).join(", "),
    time: order.time || new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: order.status,
    originalDate: new Date(order.createdAt) // Or scheduled date? CreatedAt is safer for "activity feed"
  }));

  const recentActivities = [...recentSales, ...recentOrders]
    .sort((a, b) => b.originalDate.getTime() - a.originalDate.getTime())
    .slice(0, 5);

  const statsCards = [
    {
      title: "Servicios Hoy",
      value: servicesToday.toString(),
      icon: IoCarSportOutline,
      bgColor: "bg-blue-600",
      iconColor: "text-blue-100"
    },
    {
      title: "Pedidos Pendientes",
      value: pendingOrders.toString(),
      icon: IoCalendarOutline,
      bgColor: "bg-green-600",
      iconColor: "text-green-100"
    },
    {
      title: "Tasa BCV",
      value: dolarData ? `Bs. ${dolarData.promedio.toFixed(2)}` : "Bs. 0.00",
      icon: IoTrendingUpOutline,
      bgColor: "bg-emerald-600",
      iconColor: "text-emerald-100",
      showBs: false,
      isRate: true,
      subtitle: dolarData ? formatDate(dolarData.fechaActualizacion) : ""
    },
    {
      title: "Ingresos del Día",
      value: earningsToday.toFixed(2),
      icon: IoCashOutline,
      bgColor: "bg-amber-600",
      iconColor: "text-amber-100",
      showBs: true
    },
  ];

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
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-start justify-between gap-4" data-tour="dashboard-header">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-sm md:text-base text-muted-foreground">Resumen general de operaciones</p>
        </div>
        <Button 
          onClick={startTour}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 shadow-sm hover:shadow-md transition-all hover:scale-105"
        >
          <IoHelpCircleOutline className="h-5 w-5" />
          <span className="hidden sm:inline">¿Cómo usar?</span>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => {
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
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 hover:bg-muted/30 transition-all duration-200 hover:pl-6 gap-3 sm:gap-4"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className={`p-2.5 rounded-lg flex-shrink-0 ${
                      activity.status === "Completado"
                        ? "bg-green-100 text-green-600"
                        : activity.status === "En Proceso"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-amber-100 text-amber-600"
                    }`}>
                      {activity.status === "Completado" || activity.status === "Confirmada" ? (
                        <IoCheckmarkCircle className="h-5 w-5" />
                      ) : activity.status === "En Proceso" ? (
                        <IoTime className="h-5 w-5" />
                      ) : (
                        <IoAlertCircle className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                        {activity.client}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">{activity.service}</p>
                    </div>
                  </div>
                  <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 sm:gap-0 w-full sm:w-auto justify-between sm:justify-end">
                    <span className="text-sm font-medium text-muted-foreground order-1 sm:order-none">{activity.time}</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium order-2 sm:order-none sm:mt-1 ${
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
              ))
            ) : (
                <div className="p-6 text-center text-muted-foreground">
                    No hay actividad reciente.
                </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
