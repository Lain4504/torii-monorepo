import { Controller, Get, UseGuards } from '@nestjs/common';
import { Permissions, PermissionsGuard, successResponse, GatewayAuthGuard } from '@server/shared';
import type {
  AdminDashboardResponseDTO,
  StaffAcademicDashboardResponseDTO,
  StaffOperationsDashboardResponseDTO,
  StandardApiResponse,
} from '@workspace/schemas';
import { DashboardService } from './dashboard.service';

@Controller('api/dashboard')
@UseGuards(GatewayAuthGuard, PermissionsGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('staff-academic')
  @Permissions(
    'academy.content.write',
    'academy.delivery.write',
    'academy.commerce.write',
  )
  async getStaffAcademicDashboard(): Promise<
    StandardApiResponse<StaffAcademicDashboardResponseDTO>
  > {
    const data = await this.dashboardService.getStaffAcademicDashboard();
    return successResponse(data);
  }

  @Get('staff-operations')
  @Permissions('academy:order:admin')
  async getStaffOperationsDashboard(): Promise<
    StandardApiResponse<StaffOperationsDashboardResponseDTO>
  > {
    const data = await this.dashboardService.getStaffOperationsDashboard();
    return successResponse(data);
  }

  @Get('admin')
  @Permissions('*')
  async getAdminDashboard(): Promise<StandardApiResponse<AdminDashboardResponseDTO>> {
    const data = await this.dashboardService.getAdminDashboard();
    return successResponse(data);
  }
}

