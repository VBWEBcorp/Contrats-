-- Create enum types
CREATE TYPE frequence_type AS ENUM ('mensuel', 'annuel');
CREATE TYPE prestation_type AS ENUM ('SEO', 'Dev Web', 'Maintenance Dev Web', 'Maintenance Site Web', 'Site Internet');

-- Modify tables to use enum types
ALTER TABLE clients 
  ALTER COLUMN frequence TYPE frequence_type USING frequence::frequence_type,
  ALTER COLUMN typePrestations TYPE prestation_type[] USING typePrestations::prestation_type[];
