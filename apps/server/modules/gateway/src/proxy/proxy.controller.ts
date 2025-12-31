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
        '/api/auth': process.env.IDENTITY_SERVICE_URL || 'http://localhost:8081',
        '/api/admin/users': process.env.IDENTITY_SERVICE_URL || 'http://localhost:8081',
        '/api/admin/audit-logs': process.env.IDENTITY_SERVICE_URL || 'http://localhost:8081',
        '/api/rbac': process.env.IDENTITY_SERVICE_URL || 'http://localhost:8081',
        // LMS Service Routes
        '/api/courses': process.env.LMS_SERVICE_URL || 'http://localhost:8082',
        '/api/modules': process.env.LMS_SERVICE_URL || 'http://localhost:8082',
        '/api/lessons': process.env.LMS_SERVICE_URL || 'http://localhost:8082',

        // Flashcards Service Routes
        '/api/flashcards': process.env.FLASHCARDS_SERVICE_URL || 'http://localhost:8083',
        '/api/flashcard-decks': process.env.FLASHCARDS_SERVICE_URL || 'http://localhost:8083',

        // Community Service Routes
        '/api/blogs': process.env.COMMUNITY_SERVICE_URL || 'http://localhost:8084',
        '/api/blog-comments': process.env.COMMUNITY_SERVICE_URL || 'http://localhost:8084',
        '/api/notifications': process.env.COMMUNITY_SERVICE_URL || 'http://localhost:8084',
        '/api/wishlists': process.env.COMMUNITY_SERVICE_URL || 'http://localhost:8084',

        // Assessment Service Routes
        '/api/question-banks': process.env.ASSESSMENT_SERVICE_URL || 'http://localhost:8085',

        // Storage Service Routes
        '/api/storage': process.env.STORAGE_SERVICE_URL || 'http://localhost:8086',

        // Gamification Service Routes
        '/api/gamification': process.env.GAMIFICATION_SERVICE_URL || 'http://localhost:8088',

        // Billing Service Routes
        '/api/billing': process.env.BILLING_SERVICE_URL || 'http://localhost:8089',

        // Cortex Service Routes
        '/api/cortex': process.env.CORTEX_SERVICE_URL || 'http://localhost:8090',
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

        // Rewrite path: Strip /api prefix for forwarding to microservices
        // Example: /api/auth/login -> /auth/login
        const servicePath = req.path.replace(/^\/api/, '');
        const url = `${targetService}${servicePath}`;

        const contentType = req.headers['content-type'] || '';
        const isProtobuf = contentType.includes('application/protobuf') ||
            contentType.includes('application/octet-stream');

        this.logger.log(`Proxying ${req.method} ${req.path} → ${url} (${isProtobuf ? 'protobuf' : 'json'})`);

        try {
            const response: AxiosResponse = await firstValueFrom(
                this.httpService.request({
                    method: req.method,
                    url,
                    data: req.body, // Already parsed by body-parser (JSON or Buffer)
                    headers: {
                        ...req.headers,
                        // Remove headers that shouldn't be forwarded
                        host: undefined,
                        connection: undefined,
                    },
                    params: req.query,
                    // For protobuf, expect binary response
                    responseType: isProtobuf ? 'arraybuffer' : 'json',
                    // Don't throw on HTTP errors
                    validateStatus: () => true,
                })
            );

            // Set response headers
            if (response.headers['content-type']) {
                res.setHeader('content-type', response.headers['content-type']);
            }

            // Forward response based on content type
            const responseContentType = response.headers['content-type'] || '';
            const isResponseProtobuf = responseContentType.includes('application/protobuf') ||
                responseContentType.includes('application/octet-stream');

            if (isResponseProtobuf) {
                // Send binary data directly
                res.status(response.status).send(Buffer.from(response.data));
            } else {
                // Send JSON
                res.status(response.status).json(response.data);
            }
        } catch (error: any) {
            this.logger.error(`Proxy error: ${error.message}`, error.stack);
            res.status(500).json({
                success: false,
                message: 'Internal gateway error',
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
