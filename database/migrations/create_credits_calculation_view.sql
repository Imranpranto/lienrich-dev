-- Create a view combining credits calculation and profiles
CREATE OR REPLACE VIEW public.credits_calculation_and_profiles AS
SELECT 
  cc.user_id,
  p.email,
  p.display_name,
  cc.plan,
  cc.total_credits,
  cc.used_credits,
  cc.credits_left,
  cc.subscription_start_at,
  cc.subscription_end_at,
  cc.trial_ends_at,
  cc.created_at,
  cc.updated_at
FROM 
  public.credits_calculation cc
JOIN 
  public.profiles p ON cc.user_id = p.id;

-- Create function to update credits calculation
CREATE OR REPLACE FUNCTION update_credits_calculation()
RETURNS TRIGGER AS $$
BEGIN
  -- Update credits_left based on total and used credits
  NEW.credits_left := NEW.total_credits - NEW.used_credits;
  
  -- Validate positive credits
  IF NEW.credits_left < 0 THEN
    RAISE EXCEPTION 'Credits cannot be negative';
  END IF;

  -- Set subscription dates for plan changes
  IF NEW.plan != OLD.plan THEN
    IF NEW.plan != 'Trial' THEN
      NEW.subscription_start_at := CURRENT_TIMESTAMP;
      NEW.subscription_end_at := CURRENT_TIMESTAMP + INTERVAL '30 days';
      NEW.trial_ends_at := NULL;
    END IF;
  END IF;

  -- Update timestamp
  NEW.updated_at := CURRENT_TIMESTAMP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for credits calculation updates
CREATE TRIGGER credits_calculation_update
  BEFORE UPDATE ON public.credits_calculation
  FOR EACH ROW
  EXECUTE FUNCTION update_credits_calculation();