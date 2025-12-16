import React, { useState } from 'react';
import { useMovements } from '@/contexts/MovementContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpRight, ArrowDownLeft, Search } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const Movements = () => {
  const { movements, loading } = useMovements();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMovements = movements.filter(m =>
    m.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.reason?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Movimientos de Inventario</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por ítem o razón..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <Card className="overflow-hidden border-none shadow-md">
        <CardHeader className="bg-white pb-4">
          <CardTitle>Historial de Movimientos</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-purple-600 hover:bg-purple-600">
              <TableRow className="hover:bg-purple-600 border-none">
                <TableHead className="text-white font-semibold">Fecha</TableHead>
                <TableHead className="text-white font-semibold">Ítem</TableHead>
                <TableHead className="text-center text-white font-semibold">Tipo de Ítem</TableHead>
                <TableHead className="text-center text-white font-semibold">Cantidad</TableHead>
                <TableHead className="text-white font-semibold">Razón</TableHead>
                <TableHead className="text-center text-white font-semibold">Tipo Mov.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Cargando movimientos...</TableCell>
                </TableRow>
              ) : filteredMovements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No hay movimientos registrados</TableCell>
                </TableRow>
              ) : (
                filteredMovements.map((movement, index) => (
                  <TableRow key={movement.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <TableCell className="font-medium text-slate-700">
                      {movement.created_at 
                        ? format(new Date(movement.created_at), 'dd MMM yyyy, HH:mm', { locale: es })
                        : '-'}
                    </TableCell>
                    <TableCell className="font-medium text-slate-800">{movement.item_name}</TableCell>
                    <TableCell className="text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        movement.item_type === 'product' 
                          ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                          : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                      }`}>
                        {movement.item_type === 'product' ? 'Producto' : 'Insumo'}
                      </span>
                    </TableCell>
                    <TableCell className="text-center font-bold text-slate-700">{movement.quantity}</TableCell>
                    <TableCell className="text-slate-600 max-w-[200px] truncate" title={movement.reason}>{movement.reason}</TableCell>
                    <TableCell className="text-center">
                       <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold border ${
                         movement.type === 'entrada' 
                           ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                           : 'bg-rose-50 text-rose-700 border-rose-200'
                       }`}>
                          {movement.type === 'entrada' ? <ArrowDownLeft className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
                          {movement.type === 'entrada' ? 'ENTRADA' : 'SALIDA'}
                       </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Movements;
// Forced update
