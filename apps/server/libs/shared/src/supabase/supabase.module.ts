import { Global, Module, Provider } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from './supabase.constants';

const supabaseProvider: Provider = {
  provide: SUPABASE_CLIENT,
  useFactory: () => {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;
    if (!supabaseUrl) {
      throw new Error('SUPABASE_URL environment variable is not set');
    }
    if (!supabaseKey) {
      throw new Error('SUPABASE_KEY environment variable is not set');
    }
    return createClient(
      supabaseUrl,
      supabaseKey,
    );
  },
};

@Global()
@Module({
  providers: [supabaseProvider],
  exports: [supabaseProvider],
})
export class SupabaseModule {}
