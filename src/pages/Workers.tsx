import { useState } from "react";
import { useWorkers, WorkerProfile } from "@/contexts/WorkerContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { IoAddOutline, IoPencilOutline, IoTrashOutline, IoPersonOutline, IoReloadOutline, IoSearchOutline } from "react-icons/io5";

export default function Workers() {
  const { workers, loading, refreshWorkers, updateWorker, deleteWorker } = useWorkers();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<WorkerProfile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nombre: "",
    email: ""
  });

  const handleEditClick = (worker: WorkerProfile) => {
    setEditingWorker(worker);
    setFormData({
      nombre: worker.nombre || "",
      email: worker.email || ""
    });
    setIsDialogOpen(true);
  };

  const handleCreateClick = () => {
    setEditingWorker(null);
    setFormData({
      nombre: "",
      email: ""
    });
    // Note: Creating a new worker profile manually is restricted if ID is FK to auth.users.
    // For this UI, we will focus on editing/deleting/viewing.
    // We can show a toast or simplified form that might assume external auth creation.
    setIsDialogOpen(true); 
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingWorker) {
          await updateWorker(editingWorker.id, { nombre: formData.nombre, email: formData.email });
          setIsDialogOpen(false);
      } else {
          // Logic for creating new profile - likely needs backend support for Auth
          // For now, we will just show a toast if this is attempted, or try the insert if profiles checks allow
          toast({
              title: "Acción requerida",
              description: "Para crear un nuevo trabajador, registre el usuario en el panel de autenticación primero.",
              variant: "default"
          });
          setIsDialogOpen(false);
      }
    } catch (error) {
      // Error handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
      if (deleteId) {
          await deleteWorker(deleteId);
          setDeleteId(null);
      }
  };

  const [searchTerm, setSearchTerm] = useState("");

  const filteredWorkers = workers.filter(worker => 
    (worker.nombre?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (worker.email?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold">Gestión de Trabajadores</h1>
            <Button variant="ghost" size="icon" onClick={() => refreshWorkers()} disabled={loading}>
               <IoReloadOutline className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
           </div>
           <p className="text-muted-foreground">Administra los perfiles de los empleados.</p>
        </div>
        <Button 
            onClick={handleCreateClick} 
            className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md hover:shadow-lg transition-all"
        >
            <IoAddOutline className="h-5 w-5" /> Nuevo Trabajador
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 w-full md:max-w-md bg-background border rounded-lg px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-primary/20">
            <IoSearchOutline className="text-muted-foreground" />
            <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none outline-none flex-1 text-sm"
            />
        </div>
      </div>

      <div className="rounded-md border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-purple-600 hover:bg-purple-600">
            <TableRow className="hover:bg-purple-600 border-none">
              <TableHead className="text-white font-semibold">Nombre</TableHead>
              <TableHead className="text-center text-white font-semibold">Email</TableHead>
              <TableHead className="text-center text-white font-semibold">Rol</TableHead>
              <TableHead className="text-right text-white font-semibold">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">Cargando...</TableCell>
                </TableRow>
            ) : filteredWorkers.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">No se encontraron trabajadores.</TableCell>
                </TableRow>
            ) : (
                filteredWorkers.map((worker) => (
                    <TableRow key={worker.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-medium flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                {(worker.nombre?.[0] || worker.email?.[0] || "U").toUpperCase()}
                            </div>
                            {worker.nombre || "Sin nombre"}
                        </TableCell>
                        <TableCell className="text-center">{worker.email}</TableCell>
                        <TableCell className="text-center">
                            <span className="capitalize">{worker.role === 'admin' ? 'Administrador' : 'Trabajador'}</span>
                        </TableCell>
                        <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon" onClick={() => handleEditClick(worker)}>
                                    <IoPencilOutline className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(worker.id)}>
                                    <IoTrashOutline className="h-4 w-4" />
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>{editingWorker ? 'Editar Trabajador' : 'Nuevo Trabajador'}</DialogTitle>
                  <DialogDescription>
                      Actualice la información del perfil del trabajador.
                  </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                  <div className="space-y-2">
                      <Label htmlFor="nombre">Nombre Completo</Label>
                      <Input id="nombre" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} placeholder="Nombre del empleado" />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="correo@ejemplo.com" disabled={!!editingWorker} />
                      {editingWorker && <p className="text-xs text-muted-foreground">El email no se puede cambiar aquí (vinculado a Auth).</p>}
                  </div>
                  <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                      <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Guardando...' : 'Guardar'}</Button>
                  </DialogFooter>
              </form>
          </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                    Esta acción eliminará el perfil del trabajador. Nota: El usuario de autenticación podría permanecer activo si no se elimina manualmente.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Eliminar</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
