import {
    Body,
    Controller,
    Inject,
    Post,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller('api/ingress')
export class IngressController {
    constructor(
        @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
    ) { }

    @Post('create')
    async create(@Body() body: any) {
        return firstValueFrom(this.natsClient.send({ cmd: 'ingress.create' }, body));
    }
}
