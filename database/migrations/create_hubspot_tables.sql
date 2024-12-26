-- Create HubSpot configuration table
CREATE TABLE IF NOT EXISTS hubspot_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at BIGINT NOT NULL,
  portal_id TEXT NOT NULL,
  scope TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT unique_hubspot_config_per_user UNIQUE(user_id)
);

-- Create HubSpot sync configuration table
CREATE TABLE IF NOT EXISTS hubspot_sync_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  config JSONB NOT NULL DEFAULT '{
    "enabled": false,
    "frequency": "manual",
    "updateExisting": true,
    "fieldMappings": []
  }',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT unique_sync_config_per_user UNIQUE(user_id)
);

-- Create HubSpot sync logs table
CREATE TABLE IF NOT EXISTS hubspot_sync_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('success', 'error')),
  operation TEXT NOT NULL CHECK (operation IN ('create', 'update')),
  details TEXT,
  contact_id TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_hubspot_sync_logs_user_id ON hubspot_sync_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_hubspot_sync_logs_timestamp ON hubspot_sync_logs(timestamp);