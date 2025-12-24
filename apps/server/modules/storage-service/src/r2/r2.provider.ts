import { S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

export const R2_CLIENT = 'R2_CLIENT';

export const R2Provider = {
    provide: R2_CLIENT,
    useFactory: (configService: ConfigService) => {
        const accessKeyId = configService.get<string>('R2_ACCESS_KEY_ID');
        const secretAccessKey = configService.get<string>('R2_SECRET_ACCESS_KEY');
        const endpoint = configService.get<string>('R2_ENDPOINT');

        if (!accessKeyId || !secretAccessKey || !endpoint) {
            throw new Error(
                'Missing R2 configuration. Please set R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_ENDPOINT in environment variables.',
            );
        }

        return new S3Client({
            region: 'auto', // Cloudflare R2 uses 'auto' as region
            endpoint: endpoint,
            credentials: {
                accessKeyId: accessKeyId,
                secretAccessKey: secretAccessKey,
            },
        });
    },
    inject: [ConfigService],
};