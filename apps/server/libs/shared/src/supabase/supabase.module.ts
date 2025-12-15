import { Global, Module, Provider } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from './supabase.constants';

const supabaseProvider: Provider = {
    provide: SUPABASE_CLIENT,
    useFactory: () => {
        return createClient(
            process.env.SUPABASE_URL || '',
            process.env.SUPABASE_KEY || '',
        );
    },
};

@Global()
@Module({
    providers: [supabaseProvider],
    exports: [supabaseProvider],
})
export class SupabaseModule { }
