export * from './i-notification.repository';
export * from './i-ticket.repository';

// Injection tokens for repositories
export const NOTIFICATION_REPOSITORY_TOKEN = Symbol('NOTIFICATION_REPOSITORY');
export const TICKET_REPOSITORY_TOKEN = Symbol('TICKET_REPOSITORY');
