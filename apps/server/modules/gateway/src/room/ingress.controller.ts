import {
    Body,
    Controller,
    Inject,
    Post,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { BypassTransform } from '@server/shared';

@Controller('api/ingress')
export class IngressController {
    constructor(
        @Inject('ROOM_SERVICE') private readonly roomClient: ClientProxy,
    ) { }

    @Post('create')
    @BypassTransform()
    async create(@Body() body: any) {
        return firstValueFrom(this.roomClient.send({ cmd: 'ingress.create' }, body));
    }
}
