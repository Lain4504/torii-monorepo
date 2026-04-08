import {
  Controller,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Query,
  Req,
  Res,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  GatewayAuthGuard,
  Permissions,
  PermissionsGuard,
  Public,
  ReqWithRequester,
  ZodValidationPipe,
  successPaginatedResponse,
  successResponse,
} from '@server/shared';
import { certificateQueryDTOSchema } from '@workspace/schemas';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

@Controller('api/certificates')
@UseGuards(GatewayAuthGuard, PermissionsGuard)
export class CertificateController {
  constructor(@Inject('NATS_SERVICE') private readonly nats: ClientProxy) {}

  private async buildCertificatePdf(params: {
    certificateCode: string;
    recipientName: string;
    courseName: string;
    issueDate: Date;
  }): Promise<Uint8Array> {
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([595.28, 841.89]); // A4
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

    const marginX = 56;
    const topY = 780;

    page.drawText('TORII ACADEMY', {
      x: marginX,
      y: topY,
      size: 16,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.1),
    });
    page.drawText('Certificate of Completion', {
      x: marginX,
      y: topY - 30,
      size: 28,
      font: fontBold,
      color: rgb(0.05, 0.1, 0.25),
    });

    page.drawText('Chứng nhận rằng', {
      x: marginX,
      y: topY - 90,
      size: 12,
      font,
      color: rgb(0.25, 0.25, 0.25),
    });

    page.drawText(params.recipientName || 'Học viên', {
      x: marginX,
      y: topY - 125,
      size: 22,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.1),
    });

    page.drawText('đã hoàn thành khóa học', {
      x: marginX,
      y: topY - 170,
      size: 12,
      font,
      color: rgb(0.25, 0.25, 0.25),
    });

    page.drawText(params.courseName || 'Khóa học tại Torii', {
      x: marginX,
      y: topY - 205,
      size: 16,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.1),
    });

    const dateStr = new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(params.issueDate);

    page.drawText(`Ngày cấp: ${dateStr}`, {
      x: marginX,
      y: 120,
      size: 11,
      font,
      color: rgb(0.25, 0.25, 0.25),
    });
    page.drawText(`Mã xác thực: ${params.certificateCode}`, {
      x: marginX,
      y: 100,
      size: 11,
      font,
      color: rgb(0.25, 0.25, 0.25),
    });

    page.drawText('Xác thực tại: https://app.torii.sbs/verify/<mã>', {
      x: marginX,
      y: 80,
      size: 10,
      font,
      color: rgb(0.35, 0.35, 0.35),
    });

    return await pdf.save();
  }

  @Get()
  @Permissions('lms.delivery.read')
  async findAll(
    @Query(new ZodValidationPipe(certificateQueryDTOSchema)) query: any,
  ) {
    const result = await firstValueFrom(
      this.nats.send({ cmd: 'academy.certificate.findAll' }, query),
    );
    return successPaginatedResponse(result);
  }

  @Get('me')
  async findMine(@Req() req: ReqWithRequester, @Query() query: any) {
    const result = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.certificate.findAll' },
        { ...query, userId: req.requester?.sub },
      ),
    );
    return successPaginatedResponse(result);
  }

  @Get('verify/:code')
  @Public()
  async verify(@Param('code') code: string) {
    const result = await firstValueFrom(
      this.nats.send({ cmd: 'academy.certificate.verify' }, { code }),
    );
    return successResponse(result);
  }

  @Get('verify/:code/pdf')
  @Public()
  async downloadVerifiedPdf(
    @Param('code') code: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await firstValueFrom(
      this.nats.send({ cmd: 'academy.certificate.verify' }, { code }),
    );

    if (!result?.valid || !result?.certificate) {
      res.status(404);
      return successResponse({ valid: false });
    }

    const cert = result.certificate;
    const pdfBytes = await this.buildCertificatePdf({
      certificateCode: cert.certificateCode,
      recipientName: cert.user?.displayName || 'Học viên',
      courseName: cert.class?.name || cert.vodPackage?.title || 'Khóa học tại Torii',
      issueDate: new Date(cert.issueDate),
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="certificate-${cert.certificateCode}.pdf"`,
    );
    return new StreamableFile(Buffer.from(pdfBytes));
  }

  @Get(':id')
  @Permissions('lms.delivery.read')
  async findById(@Param('id', new ParseUUIDPipe()) id: string) {
    const result = await firstValueFrom(
      this.nats.send({ cmd: 'academy.certificate.findById' }, { id }),
    );
    return successResponse(result);
  }

  @Get(':id/pdf')
  @Permissions('lms.delivery.read')
  async downloadPdfById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cert = await firstValueFrom(
      this.nats.send({ cmd: 'academy.certificate.findById' }, { id }),
    );

    const pdfBytes = await this.buildCertificatePdf({
      certificateCode: cert.certificateCode,
      recipientName: cert.user?.displayName || 'Học viên',
      courseName: cert.class?.name || cert.vodPackage?.title || 'Khóa học tại Torii',
      issueDate: new Date(cert.issueDate),
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="certificate-${cert.certificateCode}.pdf"`,
    );
    return new StreamableFile(Buffer.from(pdfBytes));
  }
}
