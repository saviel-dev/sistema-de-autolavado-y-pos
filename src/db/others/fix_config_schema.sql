-- Add the dias_laborables column if it doesn't exist
ALTER TABLE public.configuracion 
ADD COLUMN IF NOT EXISTS dias_laborables text[] DEFAULT '{Lun,Mar,Mié,Jue,Vie,Sáb}';

-- Optional: Verify existing columns or add others if missing
-- ALTER TABLE public.configuracion ADD COLUMN IF NOT EXISTS nombre_negocio text;
-- ALTER TABLE public.configuracion ADD COLUMN IF NOT EXISTS rif text;
-- ALTER TABLE public.configuracion ADD COLUMN IF NOT EXISTS telefono text;
-- ALTER TABLE public.configuracion ADD COLUMN IF NOT EXISTS email text;
-- ALTER TABLE public.configuracion ADD COLUMN IF NOT EXISTS direccion text;
-- ALTER TABLE public.configuracion ADD COLUMN IF NOT EXISTS instagram text;
-- ALTER TABLE public.configuracion ADD COLUMN IF NOT EXISTS facebook text;
-- ALTER TABLE public.configuracion ADD COLUMN IF NOT EXISTS whatsapp text;
-- ALTER TABLE public.configuracion ADD COLUMN IF NOT EXISTS hora_apertura text;
-- ALTER TABLE public.configuracion ADD COLUMN IF NOT EXISTS hora_cierre text;
