-- Añadir nuevas columnas a la tabla categorias
ALTER TABLE categorias ADD COLUMN IF NOT EXISTS descripcion TEXT;
ALTER TABLE categorias ADD COLUMN IF NOT EXISTS disponible BOOLEAN DEFAULT TRUE;

-- Opcional: Indexar la nueva columna para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_categorias_disponible ON categorias(disponible);
