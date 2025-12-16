-- Add vehiculo_id to pedidos table
ALTER TABLE public.pedidos 
ADD COLUMN IF NOT EXISTS vehiculo_id bigint REFERENCES public.vehiculos(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_pedidos_vehiculo_id ON public.pedidos(vehiculo_id);
