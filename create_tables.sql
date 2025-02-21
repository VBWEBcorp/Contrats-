-- Create enum for frequence
CREATE TYPE frequence_type AS ENUM ('mensuel', 'annuel');

-- Create enum for prestation types
CREATE TYPE prestation_type AS ENUM ('SEO', 'Dev Web', 'Maintenance Dev Web', 'Maintenance Site Web', 'Site Internet');

-- Create clients table
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom TEXT NOT NULL,
    prenom TEXT NOT NULL,
    entreprise TEXT,
    typePrestations prestation_type[] NOT NULL,
    montant NUMERIC NOT NULL,
    frequence frequence_type NOT NULL,
    dateDebut DATE NOT NULL,
    dateFin DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create historique_clients table
CREATE TABLE historique_clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id),
    dateArchivage DATE NOT NULL,
    commentaire TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
