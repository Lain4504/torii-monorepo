import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import type {
    FetchAnalyticsReq,
    DeleteAnalyticsReq,
    GetAnalyticsDownloadTokenReq,
} from '@workspace/protocol';
import { AnalyticsService } from './analytics.service';

@Controller()
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    @MessagePattern({ cmd: 'analytics.fetch' })
    async fetchAnalytics(@Payload() data: FetchAnalyticsReq) {
        return this.analyticsService.fetchAnalytics(data);
    }

    @MessagePattern({ cmd: 'analytics.getDownloadToken' })
    async getDownloadToken(@Payload() data: GetAnalyticsDownloadTokenReq) {
        const token = await this.analyticsService.getDownloadToken(data.fileId);
        return { status: true, msg: 'success', token };
    }

    @MessagePattern({ cmd: 'analytics.verifyDownloadToken' })
    async verifyDownloadToken(@Payload() data: { token: string }) {
        const result = await this.analyticsService.verifyDownloadToken(data.token);
        return { status: true, ...result };
    }

    @MessagePattern({ cmd: 'analytics.delete' })
    async deleteAnalytics(@Payload() data: DeleteAnalyticsReq) {
        const success = await this.analyticsService.deleteAnalytics(data.fileId);
        return { status: success, msg: success ? 'deleted' : 'failed' };
    }
}
