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

/** Đơn gần đây (mọi trạng thái) — bảng dashboard admin */
export interface DashboardRecentOrderRowDTO {
  id: string;
  code: string;
  status: string;
  amount: string;
  userName: string;
  userEmail: string;
  /** Ngày hiển thị: paidAt hoặc createdAt (YYYY-MM-DD) */
  date: string;
}

/** Doanh thu đơn PAID gộp theo ngày (UTC date) */
export interface DashboardRevenueDayDTO {
  date: string;
  amount: number;
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
  /** Đơn mới nhất kèm trạng thái (cho bảng admin) */
  recentOrders: DashboardRecentOrderRowDTO[];
  /** 30 ngày gần nhất, mỗi ngày tổng grand_total đơn PAID */
  revenueLast30Days: DashboardRevenueDayDTO[];
}

/** Thống kê “online” / phiên — gateway đọc trực tiếp DB (User, Session) */
export interface AdminPresenceStatsDTO {
  totalUsers: number;
  /** Đăng nhập ít nhất 1 lần trong ngày (00:00 server, lastSignInAt) */
  activeToday: number;
  /** Số user có ≥1 phiên JWT/session chưa hết hạn và chưa revoke */
  usersWithActiveSession: number;
  /** Tổng phiên hợp lệ (một user có thể nhiều thiết bị) */
  activeSessionCount: number;
  /** User có lastSignInAt trong 15 phút gần nhất (ước lượng hoạt động rất gần đây) */
  usersSignedInLast15Minutes: number;
  measuredAt: string;
}

export interface AdminDashboardResponseDTO {
  presence: AdminPresenceStatsDTO;
  staffAcademic: StaffAcademicDashboardResponseDTO;
  staffOperations: StaffOperationsDashboardResponseDTO;
}

