import { Controller, Logger } from '@nestjs/common';
import { NatsService } from '../../interfaces/nats/nats.service';
import { ExternalMediaService } from './external-media.service';
import { ExternalMediaPlayerReq, ExternalMediaPlayerReqSchema, CommonResponse, CommonResponseSchema } from '@workspace/protocol';
import { create, fromBinary, toBinary } from '@bufbuild/protobuf';

@Controller()
export class ExternalMediaNatsController {
    private readonly logger = new Logger(ExternalMediaNatsController.name);

    constructor(
        private readonly natsService: NatsService,
        private readonly externalMediaService: ExternalMediaService,
    ) { }

    onModuleInit() {
        this.subscribeToSubjects();
    }

    private subscribeToSubjects() {
        this.natsService.subscribe('externalMedia.action', this.handleAction.bind(this));
    }

    async handleAction(userId: string, data: Uint8Array): Promise<Uint8Array> {
        try {
            const req = fromBinary(ExternalMediaPlayerReqSchema, data);

            // Ensure userId in request matches authenticated user if not present
            if (!req.userId) req.userId = userId;

            await this.externalMediaService.handleRequest(req);

            const res = create(CommonResponseSchema, {
                status: true,
                msg: 'Success'
            });
            return toBinary(CommonResponseSchema, res);
        } catch (error) {
            this.logger.error(`Error handling external media action: ${error.message}`);
            const res = create(CommonResponseSchema, {
                status: false,
                msg: error.message
            });
            return toBinary(CommonResponseSchema, res);
        }
    }
}
