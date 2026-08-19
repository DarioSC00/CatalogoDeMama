-- 1. Enable the pgvector extension to work with embedding vectors
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Add a column to the productos table to store the vector
-- We use 768 dimensions because Gemini's text-embedding-004 model outputs 768-dimensional vectors.
ALTER TABLE productos ADD COLUMN IF NOT EXISTS embedding vector(768);

-- 3. Create a function to search for products using cosine similarity
-- This function can be called via Supabase RPC from the frontend.
CREATE OR REPLACE FUNCTION match_productos (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id BIGINT,
  nombre TEXT,
  descripcion TEXT,
  precio NUMERIC,
  categoria TEXT,
  url_imagen TEXT,
  disponible BOOLEAN,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    id,
    nombre,
    descripcion,
    precio,
    categoria,
    url_imagen,
    disponible,
    1 - (productos.embedding <=> query_embedding) AS similarity
  FROM productos
  WHERE 1 - (productos.embedding <=> query_embedding) > match_threshold
    AND disponible = true
  ORDER BY productos.embedding <=> query_embedding
  LIMIT match_count;
$$;
