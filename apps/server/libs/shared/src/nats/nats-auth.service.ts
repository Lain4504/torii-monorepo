import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NatsService } from './nats.service';
import * as jwt from 'jsonwebtoken';
import { nkeys, StringCodec, Subscription } from 'nats';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class NatsAuthService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(NatsAuthService.name);
    private issuerKp: any;
    private xKeyKp: any;
    private subscription: Subscription;
    private sc = StringCodec();

    constructor(
        private readonly natsService: NatsService,
        private readonly configService: ConfigService,
    ) { }

    async onModuleInit() {
        // 🔑 MUST use Account Seed (SA...) - matches Account Public Key in nats_server.conf
        const accountSeed = this.configService.get('NATS_ACCOUNT_SEED');
        const xKeySeed = this.configService.get('NATS_XKEY_SEED');

        if (!accountSeed || !xKeySeed) {
            this.logger.warn('NATS Authority Keys missing. Auth Callout service will not start.');
            return;
        }

        try {
            // Create keypair from Account Seed
            this.issuerKp = nkeys.fromSeed(new TextEncoder().encode(accountSeed));
            this.xKeyKp = nkeys.fromSeed(new TextEncoder().encode(xKeySeed));

            // Verify this is an Account key (should start with 'A')
            const publicKey = this.issuerKp.getPublicKey();
            if (!publicKey.startsWith('A')) {
                throw new Error(`Invalid Account Seed: public key must start with 'A', got '${publicKey[0]}'`);
            }

            this.logger.log(`✅ NATS Account Public Key: ${publicKey}`);
            this.logger.log('⚠️  Verify this matches nats_server.conf auth_callout.issuer');
        } catch (e) {
            this.logger.error('Invalid NATS Keys', e);
            return;
        }

        // Wait for NATS connection
        this.startService();
    }

    async onModuleDestroy() {
        if (this.subscription) {
            await this.subscription.drain();
        }
    }

    async startService() {
        // Retry loop to ensure NATS is connected
        let retries = 0;
        while (retries < 10) {
            const nc = this.natsService.getConnection();
            if (nc && !nc.isClosed()) {
                try {
                    this.subscription = nc.subscribe('$SYS.REQ.USER.AUTH', {
                        queue: 'pnm-auth-queue'
                    });

                    this.logger.log('NATS Auth Callout Service started');

                    // Start loop
                    this.runSubscriptionLoop();

                    return;
                } catch (e) {
                    this.logger.error('Failed to start NATS Auth Service', e);
                }
            }
            await new Promise((r) => setTimeout(r, 1000));
            retries++;
        }
        this.logger.error('Could not start NATS Auth Service after retries');
    }

    async runSubscriptionLoop() {
        try {
            for await (const msg of this.subscription) {
                this.handleRequest(msg);
            }
        } catch (err) {
            this.logger.warn(`Auth service loop exited: ${err.message}`);
        }
    }

    async handleRequest(msg: any) {
        this.logger.log('=== Auth Callout Request Received ===');
        try {
            let data = msg.data;
            const xKey = msg.headers?.get('Nats-Server-Xkey');

            if (xKey) {
                if (!this.xKeyKp) {
                    msg.respond(null, { headers: undefined, error: { code: 500, description: 'xKey not supported' } });
                    return;
                }
                try {
                    // Decrypt
                    const opened = this.xKeyKp.open(data, xKey);
                    if (!opened) throw new Error('Failed to decrypt');
                    data = opened;
                } catch (e) {
                    this.logger.error('Error decrypting message', e);
                    msg.respond(null, { error: { code: 500, description: 'Decryption error' } });
                    return;
                }
            }

            const tokenString = this.sc.decode(data);
            const decoded: any = jwt.decode(tokenString);
            if (!decoded) {
                throw new Error('Invalid JWT');
            }

            const userNkey = decoded.nats?.user_nkey; // Client's ephemeral NKEY
            const serverId = decoded.iss;

            this.logger.debug('=== Server ID Debug ===');
            this.logger.debug('decoded.iss: ' + decoded.iss);
            this.logger.debug('decoded.nats.server_id: ' + JSON.stringify(decoded.nats?.server_id, null, 2));
            this.logger.debug('Extracted serverId: ' + serverId);
            this.logger.debug('Extracted userNkey: ' + userNkey);

            // Token is in connect_opts.auth_token (confirmed via debug logs)
            const authToken = decoded.nats?.connect_opts?.auth_token;
            this.logger.log('Auth token extracted: ' + (authToken ? 'YES' : 'NO'));

            if (!authToken) {
                this.logger.error('Missing auth token in connect options');
                this.respond(msg, userNkey, serverId, '', new Error('Missing auth token'));
                return;
            }

            // Verify PlugNmeet Token
            let pnmClaims: any;
            try {
                pnmClaims = jwt.verify(authToken, this.configService.get('LIVEKIT_API_SECRET'));
                this.logger.log('Token verified successfully for user: ' + (pnmClaims.sub || pnmClaims.userId));
            } catch (e) {
                this.logger.error(`Token verification failed: ${e.message}`);
                this.respond(msg, userNkey, serverId, '', new Error('Invalid auth token'));
                return;
            }

            // Generate User JWT
            const userJwt = await this.generateUserJwt(userNkey, pnmClaims, authToken);
            this.logger.log('User JWT generated successfully');
            this.respond(msg, userNkey, serverId, userJwt, null);

        } catch (e) {
            this.logger.error('Error handling auth request', e);
            // Must respond with proper error JWT, not raw object
            // Use empty strings if decoded is not available
            const userNkey = (e as any).decoded?.sub || '';
            const serverId = (e as any).decoded?.iss || '';
            this.respond(msg, userNkey, serverId, '', e as Error);
        }
    }

    async generateUserJwt(userNkey: string, pnmClaims: any, authToken: string): Promise<string> {
        const roomId = pnmClaims.video?.room || pnmClaims.room;
        const userId = pnmClaims.sub || pnmClaims.userId;

        if (!roomId || !userId) {
            throw new Error('Invalid claim data: roomId or userId missing');
        }

        // Note: User info will be created AFTER successful auth when user joins room
        // Auth callout happens BEFORE user join, so we can't validate user info here

        // Construct Allow List based on plugNmeet requirements
        const pubAllow = [
            '$JS.API.INFO',
            `$JS.API.STREAM.INFO.${roomId}`,
            `sysJsWorker.${roomId}.${userId}`,
        ];
        const subAllow = [
            '_INBOX.>'
        ];

        // Ensure consumers exist
        try {
            await this.natsService.createRoomStream(roomId);
            await this.natsService.createChatConsumer(roomId, userId);
            await this.natsService.createSystemPublicConsumer(roomId, userId);
            await this.natsService.createSystemPrivateConsumer(roomId, userId);
            await this.natsService.createWhiteboardConsumer(roomId, userId);
            await this.natsService.createDataChannelConsumer(roomId, userId);
        } catch (e) {
            this.logger.error('Error creating consumers', e);
        }

        const consumers = [
            { stream: roomId, durable: `chat:${userId}`, filter: `${roomId}:chat.>` },
            { stream: roomId, durable: `sysPublic:${userId}`, filter: `${roomId}:sysPublic.>` },
            { stream: roomId, durable: `sysPrivate:${userId}`, filter: `${roomId}:sysPrivate.${userId}.>` },
            { stream: roomId, durable: `whiteboard:${userId}`, filter: `${roomId}:whiteboard.>` },
            { stream: roomId, durable: `dataChannel:${userId}`, filter: `${roomId}:dataChannel.>` },
        ];

        for (const c of consumers) {
            pubAllow.push(`$JS.API.CONSUMER.MSG.NEXT.${c.stream}.${c.durable}`);
            pubAllow.push(`$JS.API.CONSUMER.INFO.${c.stream}.${c.durable}`);
            pubAllow.push(`$JS.ACK.${c.stream}.${c.durable}.>`);
        }

        // Add publish permissions for room subjects
        pubAllow.push(`${roomId}:chat.${userId}`);
        pubAllow.push(`${roomId}:whiteboard.${userId}`);
        pubAllow.push(`${roomId}:dataChannel.${userId}`);

        const accountPublicKey = this.issuerKp.getPublicKey();

        const claims = {
            jti: uuidv4(),
            iat: Math.floor(Date.now() / 1000),
            iss: accountPublicKey,
            name: authToken, // Store token for connection event tracking (like Go version)
            sub: userNkey,
            aud: 'PNM',
            nats: {
                pub: { allow: pubAllow },
                sub: { allow: subAllow },
                type: 'user',
                version: 2
                // Note: issuer_account is ONLY for operator mode (decentralized auth)
                // In centralized mode, Account directly signs, so this field must be omitted
            }
        };

        this.logger.debug('User JWT claims before signing: ' + JSON.stringify(claims, null, 2));
        return this.signJwt(claims, this.issuerKp);
    }

    async respond(msg: any, userNKey: string, serverId: string, userJwt: string, err: Error | null) {
        if (err) {
            const errClaims = {
                jti: uuidv4(),
                iat: Math.floor(Date.now() / 1000),
                iss: this.issuerKp.getPublicKey(),
                sub: userNKey,
                aud: serverId,
                nats: {
                    error: err.message
                }
            };
            const token = await this.signJwt(errClaims, this.issuerKp);
            this.sendResponse(msg, token);
            return;
        }

        const accountPublicKey = this.issuerKp.getPublicKey();

        const claims = {
            jti: uuidv4(),
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 60, // 60 seconds expiry
            iss: accountPublicKey,
            sub: userNKey,
            aud: serverId, // Response Audience must be the Server ID
            nats: {
                jwt: userJwt,
                type: 'authorization_response',  // Required per NATS spec
                version: 2
                // Note: issuer_account is ONLY for operator mode (decentralized auth)
            }
        };

        this.logger.debug('Response JWT claims: ' + JSON.stringify(claims, null, 2));
        const token = await this.signJwt(claims, this.issuerKp);
        this.logger.debug('Response JWT FULL TOKEN:');
        this.logger.debug(token);
        this.logger.log('Sending success response with user JWT');
        this.sendResponse(msg, token);
    }

    async sendResponse(msg: any, token: string) {
        let data = this.sc.encode(token);
        const xKey = msg.headers?.get('Nats-Server-Xkey');

        if (xKey) {
            try {
                data = this.xKeyKp.seal(data, xKey);
            } catch (e) {
                this.logger.error('Failed to seal response', e);
                return;
            }
        }
        msg.respond(data);
    }

    async signJwt(payload: any, kp: any): Promise<string> {
        const header = { typ: 'JWT', alg: 'ed25519-nkey' };
        const headerEnc = this.base64UrlEncode(JSON.stringify(header));
        const payloadEnc = this.base64UrlEncode(JSON.stringify(payload));

        const input = `${headerEnc}.${payloadEnc}`;
        const sig = kp.sign(new TextEncoder().encode(input));
        const sigEnc = this.base64UrlEncode(sig);

        return `${input}.${sigEnc}`;
    }

    base64UrlEncode(input: string | Uint8Array): string {
        let buf: Buffer;
        if (typeof input === 'string') {
            buf = Buffer.from(input);
        } else {
            buf = Buffer.from(input);
        }
        return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    }
}
