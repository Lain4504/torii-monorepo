/**
 * Service Interfaces and Injection Tokens
 * Central export point for all service interfaces and their corresponding DI tokens
 */

// Export all service interfaces
export * from './i-sensei-agent.service';
export * from './i-assessment-agent.service';
export * from './i-analytics-agent.service';

// Injection tokens for dependency injection
export const SENSEI_AGENT_SERVICE_TOKEN = Symbol('SENSEI_AGENT_SERVICE');
export const ASSESSMENT_AGENT_SERVICE_TOKEN = Symbol('ASSESSMENT_AGENT_SERVICE');
export const ANALYTICS_AGENT_SERVICE_TOKEN = Symbol('ANALYTICS_AGENT_SERVICE');
