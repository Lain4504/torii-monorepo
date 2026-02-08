import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { createNatsServiceConfig } from '@server/shared';
import { AgentsModule } from './agents.module';
import { FastMcpService } from './fastmcp/fastmcp.service';

async function bootstrap() {
  console.log('🚀 Agents Service starting...');

  // Create Hybrid Application (HTTP + Microservice)
  const app = await NestFactory.create(AgentsModule);

  // Connect NATS Microservice
  app.connectMicroservice(createNatsServiceConfig());

  // Enable CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Enable validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  // Start Microservices
  await app.startAllMicroservices();
  console.log('📡 Agents Service NATS microservice listening');

  // --- MOUNT FASTMCP (Managed by FastMcpService) ---
  // We proxy /mcp/* -> http://localhost:4000/*

  app.use('/mcp', (req, res, next) => {
    const http = require('http');
    const originalUrl = req.originalUrl.replace('/mcp', '') || '/';

    const options = {
      hostname: 'localhost',
      port: 4000,
      path: originalUrl,
      method: req.method,
      headers: req.headers,
    };

    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });

    proxyReq.on('error', (e) => {
      console.error(`FastMCP Proxy Error: ${e.message}`);
      res.status(502).json({ error: 'Bad Gateway - FastMCP Internal Server Unreachable' });
    });

    if (req.body) {
      // If body-parser already parsed it, we need to stringify it back
      // However, standard proxying usually pipes the stream. 
      // NestJS uses body-parser by default.
      if (typeof req.body === 'object' && Object.keys(req.body).length > 0) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    }

    // If request stream is readable (and not consumed by body-parser fully or is streaming), pipe it?
    // NestJS body parser consumes stream. So req.pipe(proxyReq) might not work if body is parsed.
    // For SSE (GET), there is no body. For POST (Messages), there is JSON body.

    proxyReq.end();
  });


  // Start HTTP Server
  const port = process.env.AGENTS_SERVICE_PORT || 8090; // Default to 8090 per architecture
  await app.listen(port);
  console.log(`🚀 Agents Service HTTP server listening on port ${port}`);
}

bootstrap();
