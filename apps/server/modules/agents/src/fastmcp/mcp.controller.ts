import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { FastMcpService } from './fastmcp.service';

@Controller('mcp')
export class McpController {
    constructor(private readonly fastMcpService: FastMcpService) { }

    @Get('sse')
    async sse(@Res() res: Response) {
        // TODO: Implement full MCP SSE Transport
        // For now, this is a placeholder to verify the endpoint is mounted.
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        res.write(`data: ${JSON.stringify({ type: 'info', message: 'MCP Endpoint Mounted (Integrated Mode)' })}\n\n`);
        // Keep connection open
    }

    @Get('health')
    health() {
        return { status: 'ok', mode: 'hybrid', service: 'agents' };
    }
}
