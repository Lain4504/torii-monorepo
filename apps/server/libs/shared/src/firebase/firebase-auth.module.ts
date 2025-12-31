import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FirebaseAuthService } from './firebase-auth.service';

/**
 * Firebase Authentication Module
 * Provides Firebase Admin SDK integration for token verification
 */
@Global()
@Module({
    imports: [ConfigModule],
    providers: [FirebaseAuthService],
    exports: [FirebaseAuthService],
})
export class FirebaseAuthModule { }
