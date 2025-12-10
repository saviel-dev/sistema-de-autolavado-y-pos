import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSales } from '@/contexts/SalesContext';
import { useOrders } from '@/contexts/OrderContext';
import { useServices } from '@/contexts/ServiceContext';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend, 
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
    IoDownloadOutline, 
    IoDocumentTextOutline, 
    IoGridOutline,
    IoTrendingUpOutline,
    IoCalendarOutline,
    IoCashOutline,
    IoCarSportOutline
} from "react-icons/io5";

const COLORS = ['#0ea5e9', '#22c55e', '#eab308', '#f97316', '#8b5cf6', '#ec4899'];

const Reports = () => {
  const { sales } = useSales();
  const { orders } = useOrders();
  const { services } = useServices(); 
  const [timeRange, setTimeRange] = useState("all"); 

  // --- Data Processing ---
  const salesData = useMemo(() => {
    const data: Record<string, number> = {};
    sales.forEach(sale => {
      const date = new Date(sale.date).toLocaleDateString(); 
      data[date] = (data[date] || 0) + sale.total;
    });
    return Object.entries(data).map(([date, total]) => ({
      date,
      total
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [sales]);

  const servicesData = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach(order => {
        order.items.forEach(item => {
            const name = item.serviceName || "Desconocido";
            counts[name] = (counts[name] || 0) + 1;
        });
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [orders]);

  const totalRevenue = sales.reduce((acc, curr) => acc + curr.total, 0);
  const averageTicket = sales.length > 0 ? totalRevenue / sales.length : 0;
  const totalOrders = orders.length;

  // --- Export ---
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(40);
    doc.text("Autolavado Gochi", 14, 20);
    doc.setFontSize(12);
    doc.text("Reporte General de Ventas", 14, 28);
    doc.text(`Generado: ${new Date().toLocaleDateString()}`, 14, 34);

    const tableColumn = ["Fecha", "Cliente", "Total", "Método"];
    const tableRows = sales.map(sale => [
        new Date(sale.date).toLocaleDateString(),
        sale.clientName || 'Cliente General', 
        `$${sale.total.toFixed(2)}`,
        sale.paymentMethod
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [66, 66, 66] }
    });
    doc.save("reporte_gochi.pdf");
  };

  const exportCSV = () => {
    const headers = ["ID,Fecha,Cliente,Total,Metodo Pago\n"];
    const rows = sales.map(sale => 
      `${sale.id},${new Date(sale.date).toLocaleDateString()},${sale.clientName || 'Cliente General'},${sale.total},${sale.paymentMethod}`
    );
    const csvContent = "data:text/csv;charset=utf-8," + headers + rows.join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "reporte_ventas.csv";
    link.click();
  };

  return (
    <div className="p-6 space-y-8 animate-in fade-in zoom-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Análisis de Negocio
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Insights y métricas clave para tu crecimiento.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[160px] bg-card">
                    <SelectValue placeholder="Periodo" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todo el Historial</SelectItem>
                    <SelectItem value="month">Este Mes</SelectItem>
                    <SelectItem value="week">Esta Semana</SelectItem>
                </SelectContent>
            </Select>
            <Button variant="outline" onClick={exportCSV} className="gap-2 bg-card hover:bg-muted">
                <IoGridOutline className="h-4 w-4" /> CSV
            </Button>
            <Button onClick={exportPDF} className="gap-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white shadow-md hover:shadow-lg transition-all">
                <IoDocumentTextOutline className="h-4 w-4" /> PDF
            </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px] bg-muted/50 p-1">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="sales">Ventas Detalladas</TabsTrigger>
          <TabsTrigger value="services">Servicios</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6">
            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-slate-900 dark:to-slate-950 border-none shadow-sm hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Ingresos Totales</CardTitle>
                    <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                        <IoCashOutline className="h-4 w-4" />
                    </div>
                    </CardHeader>
                    <CardContent>
                    <div className="text-3xl font-bold text-blue-700 dark:text-blue-400">
                        ${totalRevenue.toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <IoTrendingUpOutline className="text-green-500" />
                        <span className="text-green-600 font-medium">+12%</span> vs mes anterior
                    </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-white dark:from-slate-900 dark:to-slate-950 border-none shadow-sm hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Ticket Promedio</CardTitle>
                    <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600">
                        <IoTrendingUpOutline className="h-4 w-4" />
                    </div>
                    </CardHeader>
                    <CardContent>
                    <div className="text-3xl font-bold text-purple-700 dark:text-purple-400">
                        ${averageTicket.toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Promedio por venta realizada
                    </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-white dark:from-slate-900 dark:to-slate-950 border-none shadow-sm hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Citas/Pedidos</CardTitle>
                    <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
                        <IoCalendarOutline className="h-4 w-4" />
                    </div>
                    </CardHeader>
                    <CardContent>
                    <div className="text-3xl font-bold text-orange-700 dark:text-orange-400">
                        {totalOrders}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Operaciones registradas
                    </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid gap-4 md:grid-cols-7">
                <Card className="col-span-4 border-none shadow-md">
                <CardHeader>
                    <CardTitle>Tendencia de Ingresos</CardTitle>
                    <CardDescription>Comportamiento diario de las ventas</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                    <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={salesData}>
                        <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                        </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/50" />
                        <XAxis 
                            dataKey="date" 
                            stroke="#888888" 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false} 
                            minTickGap={30}
                        />
                        <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `$${value}`}
                        />
                        <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Area type="monotone" dataKey="total" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                    </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
                </Card>
                
                <Card className="col-span-3 border-none shadow-md">
                <CardHeader>
                    <CardTitle>Top Servicios</CardTitle>
                    <CardDescription>Distribución de demanda</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={240}>
                        <PieChart>
                            <Pie
                                data={servicesData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {servicesData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: '8px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-4 space-y-3">
                        {servicesData.map((service, idx) => (
                            <div key={idx} className="flex justify-between text-sm items-center border-b border-border/50 pb-2 last:border-0 last:pb-0">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                    <span className="font-medium text-foreground/90">{service.name}</span>
                                </div>
                                <span className="font-bold text-foreground">{service.value}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
                </Card>
            </div>
        </TabsContent>

        {/* SALES TAB - Detailed Table */}
        <TabsContent value="sales">
            <Card className="border-none shadow-md">
                <CardHeader>
                    <CardTitle>Historial de Ventas</CardTitle>
                    <CardDescription>Registro detallado de transacciones.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50 hover:bg-muted/50">
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Cliente</TableHead>
                                    <TableHead>Método Pago</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sales.length > 0 ? (
                                    sales.slice().reverse().map((sale) => (
                                        <TableRow key={sale.id} className="hover:bg-muted/20">
                                            <TableCell>{new Date(sale.date).toLocaleDateString()}</TableCell>
                                            <TableCell className="font-medium">{sale.clientName || 'Cliente General'}</TableCell>
                                            <TableCell>
                                                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                                    {sale.paymentMethod}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right font-bold">${sale.total.toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            No hay ventas registradas.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

        {/* SERVICES TAB */}
        <TabsContent value="services">
            <Card className="border-none shadow-md">
                <CardHeader>
                    <CardTitle>Desempeño de Servicios</CardTitle>
                    <CardDescription>Análisis detallado por tipo de servicio.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Ranking de Popularidad</h3>
                            {servicesData.map((service, idx) => (
                                <div key={idx} className="flex items-center p-3 rounded-lg bg-card border shadow-sm hover:shadow-md transition-all gap-4">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                                        {idx + 1}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium">{service.name}</div>
                                        <div className="text-xs text-muted-foreground w-full bg-secondary rounded-full h-1.5 mt-1 overflow-hidden">
                                            <div 
                                                className="bg-primary h-full rounded-full" 
                                                style={{ width: `${(service.value / (servicesData[0]?.value || 1)) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-lg">{service.value}</div>
                                        <div className="text-xs text-muted-foreground">solicitudes</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center justify-center bg-muted/20 rounded-xl p-8">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={servicesData} layout="vertical" margin={{ left: 40 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" hide />
                                    <YAxis type="category" dataKey="name" width={100} tick={{fontSize: 12}} />
                                    <Tooltip cursor={{fill: 'transparent'}} />
                                    <Bar dataKey="value" fill="#8884d8" radius={[0, 4, 4, 0]}>
                                        {servicesData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
};

export default Reports;
