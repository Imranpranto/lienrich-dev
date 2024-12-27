import { supabase } from '../lib/supabase';

export async function initializeDatabase() {
  const initPromise = Promise.race([
    (async () => {
      console.log('Initializing database...');

      // Get current user
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      
      const user = session?.user;
      if (!user) {
        console.log('No user found during database initialization');
        return false;
      }

      // First check if profile exists
      const { error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Profile check failed:', profileError.message, 'Code:', profileError.code);
        // If profile doesn't exist or permission error, try to create it
        if (profileError.code === 'PGRST116' || profileError.code === 'PGRST301') {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email!,
              plan: 'Trial',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (insertError) {
            console.error('Profile creation failed:', insertError);
            throw new Error(`Failed to create profile: ${insertError.message} (Code: ${insertError.code})`);
          }
        } else {
          throw new Error(`Failed to check profile: ${profileError.message} (Code: ${profileError.code})`);
        }
      }

      // Verify we can read the profile (tests permissions)
      const { data: verifyProfile, error: verifyError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (verifyError || !verifyProfile) {
        console.error('Profile verification failed:', verifyError);
        throw new Error(`Failed to verify profile access: ${verifyError?.message || 'Unknown error'} (Code: ${verifyError?.code || 'none'})`);
      }

      console.log('Database initialized successfully for user:', user.id);
      return true;
    })(),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database initialization timed out')), 10000)
    )
  ]);

  try {
    return await initPromise;
  } catch (error) {
    console.error('Database initialization failed:', error);
    return false; // Return false instead of throwing to prevent loading state from getting stuck
  }
}
