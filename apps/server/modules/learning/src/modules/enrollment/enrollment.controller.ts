import { Controller, Get, Param, UseGuards, Req, Query, Post, Body } from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { JwtAuthGuard } from '@server/shared';
import type { EnrollmentQueryDTO, EnrollmentCreateDTO } from '@workspace/schemas';

@Controller('api/enrollments')
@UseGuards(JwtAuthGuard)
export class EnrollmentController {
    constructor(private readonly enrollmentService: EnrollmentService) { }

    @Get('course/:courseMasterId')
    async findByCourse(@Param('courseMasterId') courseMasterId: string, @Query() query: EnrollmentQueryDTO) {
        return this.enrollmentService.findAll({ ...query, courseMasterId });
    }

    @Get()
    async findAll(@Query() query: EnrollmentQueryDTO) {
        return this.enrollmentService.findAll(query);
    }

    @Post()
    async create(@Req() req: any, @Body() body: EnrollmentCreateDTO) {
        return this.enrollmentService.create(req.user.sub, body);
    }
}
