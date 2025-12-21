import { Global, Module, Provider } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from './supabase.constants';

const supabaseProvider: Provider = {
  provide: SUPABASE_CLIENT,
  useFactory: () => {
    const supabaseUrl = process.env.SUPABASE_URL;
    // Prefer service role key for backend operations (storage, etc.)
    // Fall back to anon key if service role key is not available
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.SUPABASE_KEY; // Legacy support
    
    if (!supabaseUrl) {
      throw new Error('SUPABASE_URL environment variable is not set');
    }
    if (!supabaseKey) {
      throw new Error(
        'SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY environment variable is not set',
      );
    }
    return createClient(supabaseUrl, supabaseKey);
  },
};

@Global()
@Module({
  providers: [supabaseProvider],
  exports: [supabaseProvider],
})
export class SupabaseModule {}
