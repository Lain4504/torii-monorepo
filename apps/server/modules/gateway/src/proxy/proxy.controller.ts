import { All, Controller, Req, Res, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import type { AxiosResponse } from 'axios';

/**
 * API Gateway Proxy Controller
 * Routes requests to appropriate microservices
 * Supports both JSON and Protobuf (binary) content
 */
@Controller()
export class ProxyController {
    private readonly logger = new Logger(ProxyController.name);

    constructor(private readonly httpService: HttpService) { }

    // Service mapping: route prefix → service URL
    private readonly serviceMap: Record<string, string> = {
        // Identity Service Routes
        '/api/auth': process.env.IDENTITY_SERVICE_URL || 'http://localhost:8081',
        '/api/admin/users': process.env.IDENTITY_SERVICE_URL || 'http://localhost:8081',
        '/api/admin/audit-logs': process.env.IDENTITY_SERVICE_URL || 'http://localhost:8081',
        '/api/rbac': process.env.IDENTITY_SERVICE_URL || 'http://localhost:8081',
        // LMS Service Routes
        '/api/courses': process.env.LMS_SERVICE_URL || 'http://localhost:8082',
        '/api/modules': process.env.LMS_SERVICE_URL || 'http://localhost:8082',
        '/api/lessons': process.env.LMS_SERVICE_URL || 'http://localhost:8082',
        '/api/wishlists': process.env.LMS_SERVICE_URL || 'http://localhost:8082',

        // Flashcards Service Routes
        '/api/flashcards': process.env.FLASHCARDS_SERVICE_URL || 'http://localhost:8083',
        '/api/flashcard-decks': process.env.FLASHCARDS_SERVICE_URL || 'http://localhost:8083',

        // Community Service Routes
        '/api/blogs': process.env.COMMUNITY_SERVICE_URL || 'http://localhost:8084',
        '/api/blog-comments': process.env.COMMUNITY_SERVICE_URL || 'http://localhost:8084',
        '/api/notifications': process.env.COMMUNITY_SERVICE_URL || 'http://localhost:8084',

        // Assessment Service Routes
        '/api/question-banks': process.env.ASSESSMENT_SERVICE_URL || 'http://localhost:8085',
        '/api/v1/exams': process.env.ASSESSMENT_SERVICE_URL || 'http://localhost:8085',
        '/api/v1/exams/attempts': process.env.ASSESSMENT_SERVICE_URL || 'http://localhost:8085',
        '/api/v1/exams/sessions': process.env.ASSESSMENT_SERVICE_URL || 'http://localhost:8085',

        // Storage Service Routes
        '/api/storage': process.env.STORAGE_SERVICE_URL || 'http://localhost:8086',

        // Gamification Service Routes
        '/api/gamification': process.env.GAMIFICATION_SERVICE_URL || 'http://localhost:8088',

        // Billing Service Routes
        '/api/billing': process.env.BILLING_SERVICE_URL || 'http://localhost:8089',

        // Cortex Service Routes
        '/api/ai': process.env.CORTEX_SERVICE_URL || 'http://localhost:8090',

        // Meet Service Routes
        '/webhook': process.env.MEET_SERVICE_URL || 'http://localhost:8091',
        '/auth/room': process.env.MEET_SERVICE_URL || 'http://localhost:8091',

        // Room Management
        '/api/room': process.env.MEET_SERVICE_URL || 'http://localhost:8091',

        // Polls
        '/api/polls': process.env.MEET_SERVICE_URL || 'http://localhost:8091',

        // Waiting Room
        '/api/waitingRoom': process.env.MEET_SERVICE_URL || 'http://localhost:8091',

        // User/Participant Management
        '/api/verifyToken': process.env.MEET_SERVICE_URL || 'http://localhost:8091',
        '/api/updateLockSettings': process.env.MEET_SERVICE_URL || 'http://localhost:8091',
        '/api/muteUnmuteTrack': process.env.MEET_SERVICE_URL || 'http://localhost:8091',
        '/api/removeParticipant': process.env.MEET_SERVICE_URL || 'http://localhost:8091',
        '/api/switchPresenter': process.env.MEET_SERVICE_URL || 'http://localhost:8091',
        '/api/endRoom': process.env.MEET_SERVICE_URL || 'http://localhost:8091',
        '/api/changeVisibility': process.env.MEET_SERVICE_URL || 'http://localhost:8091',

        '/api/breakoutRoom': process.env.MEET_SERVICE_URL || 'http://localhost:8091',
    };

    /**
     * Catch-all route handler
     * Proxies requests to appropriate microservice
     * Handles both JSON and Protobuf content based on Content-Type header
     */
    @All('*')
    async proxy(@Req() req: Request, @Res() res: Response) {
        const targetService = this.getTargetService(req.path);

        if (!targetService) {
            this.logger.warn(`No service found for path: ${req.path}`);
            return res.status(404).json({
                success: false,
                message: 'Service not found',
            });
        }

        // Rewrite path: Strip /api prefix
        const servicePath = req.path.replace(/^\/api/, '');
        const url = `${targetService}${servicePath}`;

        this.logger.log(`Proxy: ${req.method} ${req.path} → ${url}`);

        try {
            const response: AxiosResponse = await firstValueFrom(
                this.httpService.request({
                    method: req.method,
                    url,
                    data: req.body,
                    headers: {
                        ...req.headers,
                        host: undefined,
                        connection: undefined,
                    },
                    params: req.query,
                    responseType: 'arraybuffer', // Handles both JSON and Protobuf binary
                    validateStatus: () => true,
                })
            );

            // Forward headers but exclude CORS and connection-specific headers
            // Gateway handles CORS for the client
            const excludedHeaders = [
                'connection',
                'content-length',
                'transfer-encoding',
                'access-control-allow-origin',
                'access-control-allow-credentials',
                'access-control-allow-methods',
                'access-control-allow-headers',
                'access-control-max-age'
            ];

            if (response.headers) {
                Object.entries(response.headers).forEach(([key, value]) => {
                    if (value && !excludedHeaders.includes(key.toLowerCase())) {
                        res.setHeader(key, value);
                    }
                });
            }

            // Send raw data
            res.status(response.status).send(response.data);
        } catch (error: any) {
            this.logger.error(`Proxy error: ${error.message}`, error.stack);
            res.status(502).json({
                success: false,
                message: 'Bad Gateway',
            });
        }
    }
    /**
     * Determine target service based on request path
     */
    private getTargetService(path: string): string | null {
        // Find matching service by prefix
        for (const [prefix, service] of Object.entries(this.serviceMap)) {
            if (path.startsWith(prefix)) {
                return service;
            }
        }
        return null;
    }
}
