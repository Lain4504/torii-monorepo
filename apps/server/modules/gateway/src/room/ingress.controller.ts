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
        @Inject('ROOM_SERVICE') private readonly roomClient: ClientProxy,
    ) { }

    @Post('create')
    async create(@Body() body: any) {
        return firstValueFrom(this.roomClient.send({ cmd: 'ingress.create' }, body));
    }
}
