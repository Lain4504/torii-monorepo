/**
 * Analytics Agent Service Interface
 * Defines the contract for AI-powered analytics operations
 */
export interface IAnalyticsAgentService {
    trackProgress(userId: string, activity: string, score?: number): Promise<any>;
    suggestStudyPath(userId: string): Promise<any>;
    identifyWeaknesses(userId: string): Promise<any>;
    predictReadiness(userId: string, level: string): Promise<any>;
    generateReport(userId: string, reportType: string): Promise<any>;
}
