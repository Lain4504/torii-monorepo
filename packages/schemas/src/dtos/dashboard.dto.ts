export interface DashboardChartDatum {
  name: string;
  value: number;
}

export interface StaffAcademicDashboardResponseDTO {
  stats: {
    totalCourses: number;
    totalEnrollments: number;
    activeRooms: number;
    pendingApprovals: number;
  };
  pendingApprovalsByType: DashboardChartDatum[];
  pipelineByStatus: DashboardChartDatum[];
}

export interface StaffOperationsDashboardResponseDTO {
  stats: {
    totalRevenue: number;
    pendingTickets: number;
    pendingRefunds: number;
    paidOrders: number;
  };
  ordersByStatus: DashboardChartDatum[];
  revenueByLevel: {
    level: string;
    amount: number;
  }[];
  recentSales: {
    id: string;
    amount: string;
    userName: string;
    userEmail: string;
    date: string;
  }[];
}

export interface AdminDashboardResponseDTO {
  staffAcademic: StaffAcademicDashboardResponseDTO;
  staffOperations: StaffOperationsDashboardResponseDTO;
}

