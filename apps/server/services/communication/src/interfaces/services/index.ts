export * from './i-notification.service';
export * from './i-ticket.service';

// Injection tokens for services
export const NOTIFICATION_SERVICE_TOKEN = Symbol('NOTIFICATION_SERVICE');
export const TICKET_SERVICE_TOKEN = Symbol('TICKET_SERVICE');
