import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { IoSettingsOutline } from "react-icons/io5";

const Settings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Configuración</h1>
        <p className="text-muted-foreground">Administra las preferencias del sistema</p>
      </div>

      <div className="grid gap-6">
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="bg-primary/10 p-2 rounded-lg">
                <IoSettingsOutline className="h-5 w-5 text-primary" />
              </div>
              Información General
            </CardTitle>
            <CardDescription>
              Configura los datos básicos del negocio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="business-name" className="font-semibold">Nombre del Negocio</Label>
                <Input id="business-name" defaultValue="Autolavado Gochi" className="focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business-phone" className="font-semibold">Teléfono</Label>
                <Input id="business-phone" defaultValue="(555) 000-0000" className="focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business-email" className="font-semibold">Email</Label>
                <Input id="business-email" type="email" defaultValue="info@gochi.com" className="focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business-address" className="font-semibold">Dirección</Label>
                <Input id="business-address" defaultValue="Calle Principal #123" className="focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
            </div>
            <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 shadow-md hover:shadow-lg transition-all">
              Guardar Cambios
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle>Horarios de Operación</CardTitle>
            <CardDescription>
              Define los horarios de atención al público
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="opening-time" className="font-semibold">Hora de Apertura</Label>
                <Input id="opening-time" type="time" defaultValue="08:00" className="focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="closing-time" className="font-semibold">Hora de Cierre</Label>
                <Input id="closing-time" type="time" defaultValue="18:00" className="focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
            </div>
            <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 shadow-md hover:shadow-lg transition-all">
              Actualizar Horarios
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle>Notificaciones</CardTitle>
            <CardDescription>
              Gestiona cómo recibes las notificaciones
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="space-y-0.5">
                <Label className="font-semibold">Notificaciones por Email</Label>
                <p className="text-sm text-muted-foreground">
                  Recibe alertas de nuevas citas por correo
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="space-y-0.5">
                <Label className="font-semibold">Recordatorios Automáticos</Label>
                <p className="text-sm text-muted-foreground">
                  Envía recordatorios a clientes antes de su cita
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="space-y-0.5">
                <Label className="font-semibold">Resumen Diario</Label>
                <p className="text-sm text-muted-foreground">
                  Recibe un resumen de actividades al final del día
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
