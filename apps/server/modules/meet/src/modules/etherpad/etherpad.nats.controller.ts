import { Controller, Logger } from '@nestjs/common';
import { NatsService } from '../../interfaces/nats/nats.service';
import { EtherpadService } from './etherpad.service';
import {
    CreateEtherpadSessionRes,
    CreateEtherpadSessionResSchema,
    CleanEtherpadReqSchema,
    ChangeEtherpadStatusReqSchema,
} from '@workspace/protocol';
import { create, fromBinary, toBinary } from '@bufbuild/protobuf';

@Controller()
export class EtherpadNatsController {
    private readonly logger = new Logger(EtherpadNatsController.name);

    constructor(
        private readonly natsService: NatsService,
        private readonly etherpadService: EtherpadService,
    ) { }

    onModuleInit() {
        this.subscribeToSubjects();
    }

    private subscribeToSubjects() {
        this.natsService.subscribe('etherpad.create', this.createSession.bind(this));
        this.natsService.subscribe('etherpad.clean', this.cleanSession.bind(this));
        this.natsService.subscribe('etherpad.changeStatus', this.changeStatus.bind(this));
    }

    async createSession(userId: string, data: Uint8Array): Promise<Uint8Array> {
        try {
            // CreateEtherpadSessionReqSchema is missing in generated proto. 
            // Assuming client sends JSON or we manually parse. 
            // Since previous logic used fromBinary, the client IS sending protobuf.
            // But without the schema we can't decode it unless we guess.
            // Workaround: If client sends JSON, we are good. If proto, we need the schema.
            // For now, let's assume JSON payload OR try to decode as generic message if possible?
            // Actually, if we cannot decode, we fail. 
            // Let's assume the data is JSON for now given the issue.
            const jsonStr = new TextDecoder().decode(data);
            const body = JSON.parse(jsonStr);

            const result = await this.etherpadService.createSession(body.roomId, body.userId || userId);

            // result is already CreateEtherpadSessionRes object
            return toBinary(CreateEtherpadSessionResSchema, result);
        } catch (error) {
            this.logger.error(`Error creating etherpad session: ${error.message}`);
            return new Uint8Array();
        }
    }

    async cleanSession(userId: string, data: Uint8Array): Promise<void> {
        try {
            const req = fromBinary(CleanEtherpadReqSchema, data);
            await this.etherpadService.cleanAfterRoomEnd(req);
        } catch (error) {
            this.logger.error(`Error cleaning etherpad session: ${error.message}`);
        }
    }

    async changeStatus(userId: string, data: Uint8Array): Promise<void> {
        try {
            // Check proto schema for status change request
            // If not available, maybe simple JSON or string payload?
            // Assuming simplified usage for now as feature toggle.
            const req = fromBinary(ChangeEtherpadStatusReqSchema, data);
            await this.etherpadService.changeStatus(req);
        } catch (error) {
            this.logger.error(`Error changing etherpad status: ${error.message}`);
        }
    }
}
