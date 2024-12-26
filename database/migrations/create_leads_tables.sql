-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_audience_id ON leads(audience_id);
CREATE INDEX IF NOT EXISTS idx_audiences_user_id ON audiences(user_id);