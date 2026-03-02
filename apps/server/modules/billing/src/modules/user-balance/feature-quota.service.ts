import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService, AppConfigService } from '@server/shared';
import { UserBalanceService } from './user-balance.service';
import { BalanceTransactionType } from '@prisma/generated';

@Injectable()
export class FeatureQuotaService {
    private readonly logger = new Logger(FeatureQuotaService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly appConfig: AppConfigService,
        private readonly userBalanceService: UserBalanceService,
    ) { }

    /**
     * Check feature quota - consume trial use if available, otherwise allow (token-based billing handles cost)
     */
    async checkAndConsumeQuota(userId: string, featureType: 'roleplay' | 'live') {
        const userBalance = await this.prisma.userBalance.findUnique({
            where: { userId }
        });

        if (!userBalance) {
            await this.prisma.userBalance.create({
                data: {
                    userId,
                    balance: 0,
                    aiRoleplayTrialLimit: 3,
                    liveMeetingTrialLimit: 3
                }
            });
            return this.checkAndConsumeQuota(userId, featureType);
        }

        const trialLimitField = featureType === 'roleplay' ? 'aiRoleplayTrialLimit' : 'liveMeetingTrialLimit';
        const trialRemaining = userBalance[trialLimitField];

        if (trialRemaining > 0) {
            // Consume 1 trial use
            await this.prisma.userBalance.update({
                where: { userId },
                data: { [trialLimitField]: { decrement: 1 } }
            });
            this.logger.log(`User ${userId} consumed 1 trial use for ${featureType}. Remaining: ${trialRemaining - 1}`);
            return { allowed: true, remainingTrial: trialRemaining - 1, chargedCoins: false };
        }

        // No trial uses left — allow anyway, token usage will be billed per-token via recordTokenUsage
        this.logger.log(`User ${userId} has no trial uses left for ${featureType}. Allowing with token-based billing.`);
        return { allowed: true, remainingTrial: 0, chargedCoins: true };
    }

    /**
     * Get feature quota status (remaining trial uses and cost)
     */
    async getQuotaStatus(userId: string, featureType: 'roleplay' | 'live') {
        const userBalance = await this.prisma.userBalance.findUnique({
            where: { userId }
        });

        const pricing = (this.appConfig as any).features?.pricing || {
            roleplay: 1000,
            live: 5000
        };
        const cost = featureType === 'roleplay' ? pricing.roleplay : pricing.live;

        if (!userBalance) {
            const trialLimits = (this.appConfig as any).features?.trialLimits || {
                aiRoleplay: 3,
                liveMeeting: 3
            };
            const defaultTrial = featureType === 'roleplay' ? trialLimits.aiRoleplay : trialLimits.liveMeeting;

            return {
                remainingTrial: defaultTrial,
                cost,
                chargedCoins: false
            };
        }

        const trialLimitField = featureType === 'roleplay' ? 'aiRoleplayTrialLimit' : 'liveMeetingTrialLimit';
        const trialRemaining = userBalance[trialLimitField];

        return {
            remainingTrial: trialRemaining,
            cost,
            chargedCoins: trialRemaining <= 0
        };
    }

    /**
     * Record token usage and deduct coins from balance.
     * taskType maps to a service key in insights.services (e.g. 'ai_text_chat', 'live_voice').
     * Falls back to 'ai_text_chat' if unknown.
     */
    async recordTokenUsageAndDeduct(userId: string, taskType: string, usage: any) {
        const insights = this.appConfig.insights;
        const coinRate = insights.coinRatePerUSD || 25000;

        // Map taskType → service config key
        const serviceKey = taskType === 'live_voice' ? 'live_voice' : 'ai_text_chat';
        const serviceConfig = insights.services?.[serviceKey];

        if (!serviceConfig) {
            this.logger.warn(`No service config found for '${serviceKey}' in insights.services. Skipping deduction for user ${userId}.`);
            return;
        }

        // Pick most specific pricing, fall back to 'default'
        const modelKey = usage.model || (taskType === 'live_voice' ? 'gemini-2.5-flash-native-audio-latest' : 'gemini-2.0-flash');
        const pricing = serviceConfig.pricing?.[modelKey] || serviceConfig.pricing?.['default'];

        if (!pricing) {
            this.logger.warn(`No pricing found for service '${serviceKey}' (model: ${modelKey}). Skipping deduction for user ${userId}.`);
            return;
        }

        const promptTokens = usage.promptTokenCount || 0;
        const completionTokens = usage.candidatesTokenCount || 0;
        const totalTokens = usage.totalTokenCount || (promptTokens + completionTokens);

        const inputPriceUSD = pricing.inputPricePerMillionTokens || 0;
        const outputPriceUSD = pricing.outputPricePerMillionTokens || 0;

        const inputCostCoins = (promptTokens / 1_000_000) * inputPriceUSD * coinRate;
        const outputCostCoins = (completionTokens / 1_000_000) * outputPriceUSD * coinRate;
        const totalCostCoins = Math.ceil(inputCostCoins + outputCostCoins);

        this.logger.log(
            `[billing] ${taskType} | user=${userId} | ` +
            `in=${promptTokens} out=${completionTokens} total=${totalTokens} | ` +
            `cost=${totalCostCoins} coins (rate: in=$${inputPriceUSD}/M out=$${outputPriceUSD}/M @ ${coinRate} coins/USD)`
        );

        if (totalCostCoins <= 0) {
            this.logger.warn(`[billing] Computed 0 coins for user ${userId} (${taskType}). Check pricing config.`);
            return;
        }

        try {
            await this.userBalanceService.deductBalance(
                userId,
                totalCostCoins,
                `Sử dụng AI ${taskType}: ${totalTokens} tokens`,
                BalanceTransactionType.PURCHASE,
                { usage, taskType }
            );
        } catch (error: any) {
            this.logger.error(`Failed to deduct ${totalCostCoins} coins for user ${userId}: ${error.message}`);
        }
    }
}
