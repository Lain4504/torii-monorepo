import { Controller, Logger } from '@nestjs/common';
import { NatsService } from '../../interfaces/nats/nats.service';
import { RecordingService } from './recording.service';
import { RecordingReqSchema, RecordingTasks, CommonResponseSchema } from '@workspace/protocol';
import { fromBinary, create, toBinary } from '@bufbuild/protobuf';

@Controller()
export class RecordingNatsController {
    private readonly logger = new Logger(RecordingNatsController.name);

    constructor(
        private readonly natsService: NatsService,
        private readonly recordingService: RecordingService,
    ) { }

    onModuleInit() {
        this.natsService.subscribe('recording', this.handleRecordingRequest.bind(this));
        this.natsService.subscribe('recording.fetch', this.fetchActiveRecordings.bind(this));
    }

    async handleRecordingRequest(userId: string, data: Uint8Array): Promise<Uint8Array> {
        try {
            const req = fromBinary(RecordingReqSchema, data);

            // Delegate logic to service
            // For now just logging as placeholder for start/stop logic
            this.logger.log(`Received recording request: ${req.task} for room ${req.roomId}`);

            // TODO: Implement actual recording start/stop logic here or in service
            // This usually involves sending a command to the Recorder via NATS or Redis, 
            // OR handling webhook from LiveKit if this request is from Client to Server.

            // Return success
            const res = create(CommonResponseSchema, {
                status: true,
                msg: 'Request received',
            });
            return toBinary(CommonResponseSchema, res);
        } catch (error) {
            this.logger.error(`Error handling recording request: ${error.message}`);
            const res = create(CommonResponseSchema, {
                status: false,
                msg: error.message,
            });
            return toBinary(CommonResponseSchema, res);
        }
    }

    async fetchActiveRecordings(userId: string, data: Uint8Array): Promise<Uint8Array> {
        try {
            const activeRooms = await this.recordingService.getAllActiveRecorders();
            // Return as JSON byte array
            return new TextEncoder().encode(JSON.stringify(activeRooms));
        } catch (error) {
            this.logger.error(`Error fetching active recordings: ${error.message}`);
            return new TextEncoder().encode(JSON.stringify([]));
        }
    }
}
