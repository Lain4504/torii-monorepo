import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);

  constructor(private readonly prisma: PrismaService) {}

  async exportOrders(query: { startDate?: string; endDate?: string }) {
    const { startDate, endDate } = query;
    const where: any = {
      status: 'completed',
    };

    if (startDate || endDate) {
      where.completedAt = {};
      if (startDate) where.completedAt.gte = new Date(startDate);
      if (endDate) where.completedAt.lte = new Date(endDate);
    }

    const orders = await this.prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            displayName: true,
            email: true,
          },
        },
      },
      orderBy: { completedAt: 'desc' },
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Orders Report');

    sheet.columns = [
      { header: 'Mã đơn hàng', key: 'id', width: 40 },
      { header: 'Người mua', key: 'userName', width: 25 },
      { header: 'Email', key: 'userEmail', width: 30 },
      { header: 'Số tiền', key: 'amount', width: 15 },
      { header: 'Tiền tệ', key: 'currency', width: 10 },
      { header: 'Loại đơn', key: 'orderType', width: 20 },
      { header: 'Phương thức', key: 'paymentMethod', width: 20 },
      { header: 'Thời gian', key: 'completedAt', width: 25 },
    ];

    // Styling
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    orders.forEach((order) => {
      sheet.addRow({
        id: order.id,
        userName: order.user?.displayName || 'N/A',
        userEmail: order.user?.email || 'N/A',
        amount: Number(order.amount),
        currency: order.currency,
        orderType: order.orderType,
        paymentMethod: order.paymentMethod,
        completedAt: order.completedAt
          ? order.completedAt.toLocaleString()
          : 'N/A',
      });
    });

    return await workbook.xlsx.writeBuffer();
  }

  async exportBalanceHistory(query: { startDate?: string; endDate?: string }) {
    const { startDate, endDate } = query;
    const where: any = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const transactions = await this.prisma.balanceTransaction.findMany({
      where,
      include: {
        user: {
          select: {
            displayName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Balance History');

    sheet.columns = [
      { header: 'ID Giao dịch', key: 'id', width: 40 },
      { header: 'Người dùng', key: 'userName', width: 25 },
      { header: 'Email', key: 'userEmail', width: 30 },
      { header: 'Biến động (Coin)', key: 'amount', width: 15 },
      { header: 'Loại', key: 'type', width: 15 },
      { header: 'Lý do', key: 'description', width: 40 },
      { header: 'Thời gian', key: 'createdAt', width: 25 },
    ];

    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    transactions.forEach((tx) => {
      sheet.addRow({
        id: tx.id,
        userName: tx.user?.displayName || 'N/A',
        userEmail: tx.user?.email || 'N/A',
        amount: tx.amount,
        type: tx.type,
        description: tx.description,
        createdAt: tx.createdAt.toLocaleString(),
      });
    });

    return await workbook.xlsx.writeBuffer();
  }

  async exportCourseRevenue() {
    // Query completed course purchase orders join with enrollment -> course
    const courses = await this.prisma.course.findMany({
      include: {
        enrollments: {
          include: {
            order: true,
          },
        },
      },
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Course Revenue');

    sheet.columns = [
      { header: 'Tên khóa học', key: 'title', width: 40 },
      { header: 'Cấp độ', key: 'jlptLevel', width: 10 },
      { header: 'Số lượng đăng ký', key: 'enrollmentCount', width: 20 },
      { header: 'Tổng doanh thu (Coin)', key: 'totalCoin', width: 20 },
      { header: 'Tổng doanh thu (Tiền mặt)', key: 'totalCash', width: 20 },
    ];

    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    courses.forEach((course) => {
      let totalCoin = 0;
      let totalCash = 0;
      let enrollmentCount = 0;

      course.enrollments.forEach((enrollment) => {
        if (enrollment.order && enrollment.order.status === 'completed') {
          enrollmentCount++;
          const amount = Number(enrollment.order.amount);
          if (
            enrollment.order.paymentMethod === 'coin' ||
            enrollment.order.paymentMethod === 'balance'
          ) {
            totalCoin += amount;
          } else {
            totalCash += amount;
          }
        }
      });

      sheet.addRow({
        title: course.title,
        jlptLevel: course.jlptLevel,
        enrollmentCount: enrollmentCount,
        totalCoin: totalCoin,
        totalCash: totalCash,
      });
    });

    return await workbook.xlsx.writeBuffer();
  }
}
