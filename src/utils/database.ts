import { supabase } from '../lib/supabase';

export async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    
    // Add delay to ensure auth is ready
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Get current user
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    
    const user = session?.user;
    if (!user) {
      console.log('No user found during database initialization');
      return;
    }

    console.log('Checking profile for user:', user.id);

    // Check if profile exists
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (error) {
      console.log('Profile check error:', error);
      if (error.code === 'PGRST116') {
        console.log('Profile not found, creating new profile');
      } else {
      // Other errors should be thrown
      throw error;
      }
    }

    // If profile exists, database is already initialized
    if (profile) return;

    // Initialize profile
    console.log('Creating new profile for user:', user.id);

    const { error: insertError } = await supabase.from('profiles').insert({
      id: user.id,
      email: user.email!,
      plan: 'Trial',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    if (insertError) {
      console.error('Failed to create profile:', insertError);
      throw insertError;
    }

    console.log('Database initialized successfully for user:', user.id);
    return true;

  } catch (error) {
    console.error('Database initialization error:', error);
    
    // Only throw error if it's not a duplicate key violation
    if (error instanceof Error && !error.message.includes('duplicate key')) {
      throw error;
    }
    
    throw error;
  }
}