import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { getApp, getApps } from 'firebase-admin/app';
import * as path from 'path';

export interface FirebaseUser {
    uid: string;
    email: string | undefined;
    emailVerified: boolean;
    displayName: string | undefined;
    phoneNumber: string | undefined;
    photoURL: string | undefined;
}

/**
 * Firebase Authentication Service
 * Handles Firebase Admin SDK initialization and token verification
 */
@Injectable()
export class FirebaseAuthService implements OnModuleInit {
    private readonly logger = new Logger(FirebaseAuthService.name);
    private firebaseApp: admin.app.App;

    constructor(private readonly configService: ConfigService) { }

    async onModuleInit() {
        await this.initializeFirebase();
    }

    /**
     * Initialize Firebase Admin SDK
     * Checks if app already exists before initializing to prevent duplicate initialization errors
     */
    private async initializeFirebase(): Promise<void> {
        try {
            const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
            const serviceAccountPath = this.configService.get<string>('FIREBASE_SERVICE_ACCOUNT_PATH');

            if (!projectId) {
                throw new Error('FIREBASE_PROJECT_ID is not configured');
            }

            // Check if Firebase app already exists
            if (getApps().length > 0) {
                this.logger.log('Firebase Admin SDK already initialized, using existing app');
                this.firebaseApp = getApp() as admin.app.App;
                return;
            }

            // Initialize Firebase Admin SDK
            if (serviceAccountPath) {
                // Resolve path relative to workspace root (process.cwd())
                // This ensures it works from any module (gateway, identity, etc.)
                const absolutePath = path.isAbsolute(serviceAccountPath)
                    ? serviceAccountPath
                    : path.join(process.cwd(), serviceAccountPath);

                this.logger.log(`Initializing Firebase with service account: ${absolutePath}`);
                const serviceAccount = require(absolutePath);

                this.firebaseApp = admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount),
                    projectId,
                });
            } else {
                // Use Application Default Credentials (for Cloud environments)
                this.logger.log('Initializing Firebase with Application Default Credentials');
                this.firebaseApp = admin.initializeApp({
                    projectId,
                });
            }

            this.logger.log(`Firebase Admin SDK initialized successfully for project: ${projectId}`);
        } catch (error) {
            this.logger.error(`Failed to initialize Firebase Admin SDK: ${error.message}`);
            throw error;
        }
    }

    /**
     * Verify Firebase ID token
     * @param idToken - Firebase ID token from client
     * @returns Decoded token payload
     * @throws Error if token is invalid
     */
    async verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
        try {
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            return decodedToken;
        } catch (error) {
            this.logger.warn(`Invalid Firebase ID token: ${error.message}`);
            throw new Error('Invalid Firebase ID token');
        }
    }

    /**
     * Get Firebase user by UID
     */
    async getUserByUid(uid: string): Promise<admin.auth.UserRecord> {
        try {
            return await admin.auth().getUser(uid);
        } catch (error) {
            this.logger.error(`Failed to get user by UID: ${error.message}`);
            throw error;
        }
    }

    /**
     * Get Firebase user by email
     */
    async getUserByEmail(email: string): Promise<admin.auth.UserRecord> {
        try {
            return await admin.auth().getUserByEmail(email);
        } catch (error) {
            this.logger.error(`Failed to get user by email: ${error.message}`);
            throw error;
        }
    }

    /**
     * Create custom token for a user (useful for admin operations)
     */
    async createCustomToken(uid: string, additionalClaims?: object): Promise<string> {
        try {
            return await admin.auth().createCustomToken(uid, additionalClaims);
        } catch (error) {
            this.logger.error(`Failed to create custom token: ${error.message}`);
            throw error;
        }
    }

    /**
     * Set custom user claims (e.g., role)
     */
    async setCustomUserClaims(uid: string, customClaims: object): Promise<void> {
        try {
            await admin.auth().setCustomUserClaims(uid, customClaims);
            this.logger.log(`Custom claims set for user: ${uid}`);
        } catch (error) {
            this.logger.error(`Failed to set custom claims: ${error.message}`);
            throw error;
        }
    }

    /**
     * Delete a user by UID
     */
    async deleteUser(uid: string): Promise<void> {
        try {
            await admin.auth().deleteUser(uid);
            this.logger.log(`User deleted: ${uid}`);
        } catch (error) {
            this.logger.error(`Failed to delete user: ${error.message}`);
            throw error;
        }
    }

    /**
     * Extract user info from decoded token
     */
    extractUserInfo(decodedToken: admin.auth.DecodedIdToken): FirebaseUser {
        return {
            uid: decodedToken.uid,
            email: decodedToken.email,
            emailVerified: decodedToken.email_verified || false,
            displayName: decodedToken.name,
            phoneNumber: decodedToken.phone_number,
            photoURL: decodedToken.picture,
        };
    }
}
