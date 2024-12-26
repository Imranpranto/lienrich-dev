-- Create function to update credits_left
CREATE OR REPLACE FUNCTION update_credits_left()
RETURNS TRIGGER AS $$
BEGIN
  NEW.credits_left = NEW.total_credits - NEW.used_credits;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update credits_left
CREATE TRIGGER update_credits_left_trigger
  BEFORE INSERT OR UPDATE ON credits_calculation_and_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_credits_left();

-- Create function to handle plan changes and credit updates
CREATE OR REPLACE FUNCTION handle_plan_change() 
RETURNS TRIGGER AS $$
DECLARE
    additional_credits INTEGER;
    current_total INTEGER;
BEGIN
    -- Keep track of used credits
    NEW.used_credits := OLD.used_credits;
    current_total := OLD.total_credits;
    
    -- Calculate additional credits based on new plan
    additional_credits := CASE NEW.plan
        WHEN 'Trial' THEN 250
        WHEN 'Starter' THEN 1000
        WHEN 'Explorer' THEN 2800
        WHEN 'Pro' THEN 6000
        ELSE NEW.total_credits
    END;

    -- Set new total credits (don't add to existing)
    NEW.total_credits := additional_credits;
    
    -- Handle subscription dates
    NEW.subscription_start_at := TIMEZONE('utc'::text, NOW());
    NEW.subscription_end_at := TIMEZONE('utc'::text, NOW()) + INTERVAL '30 days';
    
    -- Handle trial to paid transition
    IF OLD.plan = 'Trial' THEN
        NEW.trial_ends_at := NULL;
        -- Preserve any remaining trial credits
        IF OLD.credits_left > 0 THEN
            NEW.total_credits := NEW.total_credits + OLD.credits_left;
        END IF;
    END IF;
    
    -- Update remaining credits
    NEW.credits_left := NEW.total_credits - NEW.used_credits;
    NEW.updated_at := TIMEZONE('utc'::text, NOW());
    
    -- Log the plan change
    INSERT INTO credit_transactions (
        user_id,
        amount,
        operation_type,
        operation_details
    ) VALUES (
        NEW.id,
        NEW.total_credits - current_total,
        'plan_upgrade',
        jsonb_build_object(
            'from_plan', OLD.plan,
            'to_plan', NEW.plan,
            'previous_credits', current_total,
            'new_credits', NEW.total_credits
        )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for plan changes
DROP TRIGGER IF EXISTS handle_plan_change_trigger ON credits_calculation_and_profiles;
CREATE TRIGGER handle_plan_change_trigger
    BEFORE UPDATE OF plan
    ON credits_calculation_and_profiles
    FOR EACH ROW
    EXECUTE FUNCTION handle_plan_change();

-- Create function to handle credit deductions
CREATE OR REPLACE FUNCTION deduct_credits(
    user_id UUID,
    amount INTEGER,
    operation TEXT,
    details JSONB DEFAULT '{}'
)
RETURNS BOOLEAN AS $$
DECLARE
    current_credits INTEGER;
    trial_end TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get current credits and trial end date
    SELECT credits_left, trial_ends_at 
    INTO current_credits, trial_end
    FROM credits_calculation_and_profiles 
    WHERE id = user_id;
    
    -- Check if trial has ended
    IF trial_end IS NOT NULL AND trial_end < NOW() THEN
        RAISE EXCEPTION 'Trial period has ended';
    END IF;
    
    -- Check if user has enough credits
    IF current_credits < amount THEN
        RAISE EXCEPTION 'Insufficient credits';
    END IF;
    
    -- Update credits calculation
    UPDATE credits_calculation_and_profiles 
    SET 
        used_credits = used_credits + amount,
        updated_at = NOW()
    WHERE id = user_id;
    
    -- Log transaction
    INSERT INTO credit_transactions (
        user_id,
        amount,
        operation_type,
        operation_details
    ) VALUES (
        user_id,
        -amount,
        operation,
        details
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;