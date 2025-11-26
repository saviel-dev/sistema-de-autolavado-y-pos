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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IoSettingsOutline className="h-5 w-5 text-primary" />
              Información General
            </CardTitle>
            <CardDescription>
              Configura los datos básicos del negocio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="business-name">Nombre del Negocio</Label>
                <Input id="business-name" defaultValue="Autolavado Gochi" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business-phone">Teléfono</Label>
                <Input id="business-phone" defaultValue="(555) 000-0000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business-email">Email</Label>
                <Input id="business-email" type="email" defaultValue="info@gochi.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business-address">Dirección</Label>
                <Input id="business-address" defaultValue="Calle Principal #123" />
              </div>
            </div>
            <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">
              Guardar Cambios
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Horarios de Operación</CardTitle>
            <CardDescription>
              Define los horarios de atención al público
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="opening-time">Hora de Apertura</Label>
                <Input id="opening-time" type="time" defaultValue="08:00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="closing-time">Hora de Cierre</Label>
                <Input id="closing-time" type="time" defaultValue="18:00" />
              </div>
            </div>
            <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">
              Actualizar Horarios
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notificaciones</CardTitle>
            <CardDescription>
              Gestiona cómo recibes las notificaciones
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificaciones por Email</Label>
                <p className="text-sm text-muted-foreground">
                  Recibe alertas de nuevas citas por correo
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Recordatorios Automáticos</Label>
                <p className="text-sm text-muted-foreground">
                  Envía recordatorios a clientes antes de su cita
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Resumen Diario</Label>
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
