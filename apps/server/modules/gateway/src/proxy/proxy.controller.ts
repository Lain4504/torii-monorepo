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
    // Architecture: 4 main microservices (Identity, Learning, Agents, Meet)
    private readonly serviceMap: Record<string, string> = {
        // ============================================
        // Identity Service (Port 8081)
        // Auth, Users, RBAC, Audit, 2FA, Billing/Payments
        // ============================================
        '/api/auth': process.env.IDENTITY_SERVICE_URL || 'http://localhost:8081',
        '/api/admin/users': process.env.IDENTITY_SERVICE_URL || 'http://localhost:8081',
        '/api/admin/audit-logs': process.env.IDENTITY_SERVICE_URL || 'http://localhost:8081',
        '/api/rbac': process.env.IDENTITY_SERVICE_URL || 'http://localhost:8081',
        '/api/billing': process.env.IDENTITY_SERVICE_URL || 'http://localhost:8081',

        // ============================================
        // Learning Service (Port 8082)
        // LMS, Community, Assessment, Flashcards, Gamification
        // ============================================
        // LMS Domain
        '/api/courses': process.env.LEARNING_SERVICE_URL || 'http://localhost:8082',
        '/api/course-instructors': process.env.LEARNING_SERVICE_URL || 'http://localhost:8082',
        '/api/modules': process.env.LEARNING_SERVICE_URL || 'http://localhost:8082',
        '/api/lessons': process.env.LEARNING_SERVICE_URL || 'http://localhost:8082',
        '/api/lesson-materials': process.env.LEARNING_SERVICE_URL || 'http://localhost:8082',
        '/api/wishlists': process.env.LEARNING_SERVICE_URL || 'http://localhost:8082',
        '/api/reviews': process.env.LEARNING_SERVICE_URL || 'http://localhost:8082',
        '/api/enrollments': process.env.LEARNING_SERVICE_URL || 'http://localhost:8082',
        '/api/orders': process.env.LEARNING_SERVICE_URL || 'http://localhost:8082',
        '/sepay/webhook': process.env.LEARNING_SERVICE_URL || 'http://localhost:8082',

        // Storage Domain
        '/api/storage': process.env.LEARNING_SERVICE_URL || 'http://localhost:8082',

        // Flashcards Domain
        '/api/flashcards': process.env.LEARNING_SERVICE_URL || 'http://localhost:8082',
        '/api/flashcard-decks': process.env.LEARNING_SERVICE_URL || 'http://localhost:8082',

        // Community Domain
        '/api/posts': process.env.LEARNING_SERVICE_URL || 'http://localhost:8082',
        '/api/comments': process.env.LEARNING_SERVICE_URL || 'http://localhost:8082',
        '/api/notifications': process.env.LEARNING_SERVICE_URL || 'http://localhost:8082',

        // Assessment Domain
        '/api/questions': process.env.LEARNING_SERVICE_URL || 'http://localhost:8082',
        '/api/question-pools': process.env.LEARNING_SERVICE_URL || 'http://localhost:8082',
        '/api/exams': process.env.LEARNING_SERVICE_URL || 'http://localhost:8082',

        // Gamification Domain
        '/api/gamification': process.env.LEARNING_SERVICE_URL || 'http://localhost:8082',

        // ============================================
        // Agents Service (Port 8090)
        // AI Agents: Sensei, Assessment, Analytics
        // ============================================
        '/api/agents': process.env.AGENTS_SERVICE_URL || 'http://localhost:8090',

        // ============================================
        // Meet Service (Port 8091)
        // WebRTC, Live Classes, Rooms, Polls, Waiting Room
        // ============================================
        // LiveKit Webhook (moved to learning service for PayOS, need better strategy for multiple webhooks later)
         '/webhook': process.env.MEET_SERVICE_URL || 'http://localhost:8091',

        // Room Authentication
        '/auth/room': process.env.MEET_SERVICE_URL || 'http://localhost:8091',

        // Room Management
        '/api/room': process.env.MEET_SERVICE_URL || 'http://localhost:8091',

        // Polls
        '/api/polls': process.env.MEET_SERVICE_URL || 'http://localhost:8091',

        // Waiting Room
        '/api/waitingRoom': process.env.MEET_SERVICE_URL || 'http://localhost:8091',

        // Participant Management
        '/api/verifyToken': process.env.MEET_SERVICE_URL || 'http://localhost:8091',
        '/api/updateLockSettings': process.env.MEET_SERVICE_URL || 'http://localhost:8091',
        '/api/muteUnmuteTrack': process.env.MEET_SERVICE_URL || 'http://localhost:8091',
        '/api/removeParticipant': process.env.MEET_SERVICE_URL || 'http://localhost:8091',
        '/api/switchPresenter': process.env.MEET_SERVICE_URL || 'http://localhost:8091',
        '/api/endRoom': process.env.MEET_SERVICE_URL || 'http://localhost:8091',
        '/api/changeVisibility': process.env.MEET_SERVICE_URL || 'http://localhost:8091',

        // Breakout Rooms
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
