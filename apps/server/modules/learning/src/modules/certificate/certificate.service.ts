import { Injectable, Logger, Inject, NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as QRCode from 'qrcode';
import { InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/core';
import type { Certificate } from '@prisma/generated';
import {
    type CertificateResponseDTO,
    type CertificateQueryDTO,
    type CertificatePaginatedResponse
} from '@workspace/schemas';
import type { ICertificateService } from '@server/learning/interfaces/services';
import {
    ICertificateRepository,
    CERTIFICATE_REPOSITORY_TOKEN,
    IEnrollmentRepository,
    ENROLLMENT_REPOSITORY_TOKEN,
    ICourseMasterRepository,
    COURSE_MASTER_REPOSITORY_TOKEN,
    ICourseRunRepository,
    COURSE_RUN_REPOSITORY_TOKEN,
} from '@server/learning/interfaces/repositories';
import { SharedStorageService } from '@server/shared';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CertificateService implements ICertificateService {
    private readonly logger = new Logger(CertificateService.name);

    constructor(
        @Inject(CERTIFICATE_REPOSITORY_TOKEN)
        private readonly certificateRepository: ICertificateRepository,
        @Inject(ENROLLMENT_REPOSITORY_TOKEN)
        private readonly enrollmentRepository: IEnrollmentRepository,
        @Inject(COURSE_MASTER_REPOSITORY_TOKEN)
        private readonly courseMasterRepository: ICourseMasterRepository,
        @Inject(COURSE_RUN_REPOSITORY_TOKEN)
        private readonly courseRunRepository: ICourseRunRepository,
        private readonly storageService: SharedStorageService,
        @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
        @InjectMapper() private readonly mapper: Mapper,
    ) { }

    private toCertificateDto(c: Certificate): CertificateResponseDTO {
        return this.mapper.map<Certificate, CertificateResponseDTO>(c, 'Certificate', 'CertificateResponseDTO');
    }

    /**
     * Sanitize text to remove Vietnamese diacritics and special characters
     * This ensures compatibility with PDF standard fonts (Helvetica, Times, etc.)
     */
    private sanitizeText(text: string): string {
        return text
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks
            .replace(/\u0111/g, 'd')
            .replace(/\u0110/g, 'D');
    }

    async findAll(query: CertificateQueryDTO): Promise<CertificatePaginatedResponse> {
        const { page = 1, limit = 10, userId, courseRunId } = query;
        const skip = (Number(page) - 1) * Number(limit);

        const where: any = {};
        if (userId) where.userId = userId;
        if (courseRunId) where.courseRunId = courseRunId;

        const [total, items] = await Promise.all([
            this.certificateRepository.count(where),
            this.certificateRepository.findMany({
                where,
                skip,
                take: Number(limit),
            }),
        ]);

        return {
            data: items.map(cert => this.toCertificateDto(cert)),
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / Number(limit)),
        };
    }

    async findById(id: string): Promise<CertificateResponseDTO | null> {
        const cert = await this.certificateRepository.findById(id);
        return cert ? this.toCertificateDto(cert) : null;
    }

    async findByCode(code: string): Promise<CertificateResponseDTO | null> {
        const cert = await this.certificateRepository.findByCode(code);
        return cert ? this.toCertificateDto(cert) : null;
    }

    async issueCertificate(userId: string, courseRunId: string, enrollmentId: string): Promise<CertificateResponseDTO> {
        try {
            // 1. Check if certificate already exists
            const existing = await this.certificateRepository.findByEnrollmentId(enrollmentId);
            if (existing) {
                return this.toCertificateDto(existing);
            }

            // 2. Fetch data (Run and Course details)
            const run = await this.courseRunRepository.findById(courseRunId);
            if (!run) throw new NotFoundException('Course run not found');

            const course = await this.courseMasterRepository.findById(run.courseMasterId);
            if (!course) throw new NotFoundException('Course not found');

            // Fetch User from Identity service
            let userName = 'Learner';
            try {
                const userResponse = await lastValueFrom(
                    this.natsClient.send({ cmd: 'identity.users.findById' }, { id: userId })
                );
                userName = userResponse?.user?.displayName || userResponse?.user?.email || 'Learner';
            } catch (error) {
                this.logger.warn(`Could not fetch user info for certificate: ${userId}`);
            }

            // 3. Generate Certificate Code
            const certificateCode = `TORII-${uuidv4().split('-')[0].toUpperCase()}-${Date.now().toString().slice(-4)}`;

            // 4. Generate Professional PDF Certificate
            const pdfDoc = await PDFDocument.create();
            const page = pdfDoc.addPage([842, 595]); // A4 landscape
            const { width, height } = page.getSize();
            const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

            // Colors
            const gold = rgb(0.8, 0.6, 0.0);      // Gold accent
            const navy = rgb(0.1, 0.2, 0.4);      // Navy blue
            const lightGold = rgb(0.95, 0.92, 0.85); // Light cream background

            // Background with subtle cream color
            page.drawRectangle({
                x: 0, y: 0, width, height,
                color: lightGold,
            });

            // Outer border - Gold
            page.drawRectangle({
                x: 30, y: 30, width: width - 60, height: height - 60,
                borderColor: gold, borderWidth: 4,
            });

            // Inner border - Navy
            page.drawRectangle({
                x: 40, y: 40, width: width - 80, height: height - 80,
                borderColor: navy, borderWidth: 2,
            });

            // Decorative corner accents
            const cornerSize = 30;
            // Top-left corner
            page.drawLine({ start: { x: 40, y: height - 40 }, end: { x: 40 + cornerSize, y: height - 40 }, thickness: 3, color: gold });
            page.drawLine({ start: { x: 40, y: height - 40 }, end: { x: 40, y: height - 40 - cornerSize }, thickness: 3, color: gold });
            // Top-right corner
            page.drawLine({ start: { x: width - 40, y: height - 40 }, end: { x: width - 40 - cornerSize, y: height - 40 }, thickness: 3, color: gold });
            page.drawLine({ start: { x: width - 40, y: height - 40 }, end: { x: width - 40, y: height - 40 - cornerSize }, thickness: 3, color: gold });
            // Bottom-left corner
            page.drawLine({ start: { x: 40, y: 40 }, end: { x: 40 + cornerSize, y: 40 }, thickness: 3, color: gold });
            page.drawLine({ start: { x: 40, y: 40 }, end: { x: 40, y: 40 + cornerSize }, thickness: 3, color: gold });
            // Bottom-right corner
            page.drawLine({ start: { x: width - 40, y: 40 }, end: { x: width - 40 - cornerSize, y: 40 }, thickness: 3, color: gold });
            page.drawLine({ start: { x: width - 40, y: 40 }, end: { x: width - 40, y: 40 + cornerSize }, thickness: 3, color: gold });

            // Header ribbon effect - Gold background
            page.drawRectangle({
                x: 60, y: height - 130, width: width - 120, height: 60,
                color: gold,
                opacity: 0.2,
            });

            // Title
            const title = 'CERTIFICATE OF COMPLETION';
            const titleSize = 36;
            const titleWidth = fontBold.widthOfTextAtSize(title, titleSize);
            page.drawText(title, {
                x: (width - titleWidth) / 2,
                y: height - 110,
                size: titleSize,
                font: fontBold,
                color: navy,
            });

            // Subtitle
            page.drawText('This is to certify that', {
                x: (width - fontRegular.widthOfTextAtSize('This is to certify that', 14)) / 2,
                y: height - 180,
                size: 14,
                font: fontRegular,
                color: navy,
            });

            // Learner Name (sanitized)
            const sanitizedName = this.sanitizeText(userName);
            const nameSize = 32;
            const nameWidth = fontBold.widthOfTextAtSize(sanitizedName, nameSize);
            page.drawText(sanitizedName, {
                x: (width - nameWidth) / 2,
                y: height - 230,
                size: nameSize,
                font: fontBold,
                color: navy,
            });

            // Underline for name
            page.drawLine({
                start: { x: (width - nameWidth) / 2 - 20, y: height - 240 },
                end: { x: (width - nameWidth) / 2 + nameWidth + 20, y: height - 240 },
                thickness: 1,
                color: gold,
            });

            // Achievement text
            page.drawText('has successfully completed the course', {
                x: (width - fontRegular.widthOfTextAtSize('has successfully completed the course', 13)) / 2,
                y: height - 280,
                size: 13,
                font: fontRegular,
                color: navy,
            });

            // Course Title (sanitized)
            const sanitizedTitle = this.sanitizeText(course.title);
            const titleCourseSize = 22;
            const courseTitleWidth = fontBold.widthOfTextAtSize(sanitizedTitle, titleCourseSize);
            page.drawText(sanitizedTitle, {
                x: (width - courseTitleWidth) / 2,
                y: height - 320,
                size: titleCourseSize,
                font: fontBold,
                color: rgb(0.7, 0.5, 0.0), // Darker gold for course title
            });

            // Date and Certificate ID
            const dateText = `Issued: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`;
            page.drawText(dateText, {
                x: 80,
                y: 110,
                size: 11,
                font: fontRegular,
                color: navy,
            });

            page.drawText(`Certificate ID: ${certificateCode}`, {
                x: 80,
                y: 90,
                size: 9,
                font: fontRegular,
                color: rgb(0.3, 0.3, 0.3),
            });

            // Signature lines
            const sigY = 140;
            const sigLineWidth = 150;

            // Left signature - Instructor
            page.drawLine({
                start: { x: 120, y: sigY },
                end: { x: 120 + sigLineWidth, y: sigY },
                thickness: 1,
                color: navy,
            });
            page.drawText('Instructor', {
                x: 120 + (sigLineWidth - fontItalic.widthOfTextAtSize('Instructor', 10)) / 2,
                y: sigY - 20,
                size: 10,
                font: fontItalic,
                color: navy,
            });

            // Right signature - Director
            page.drawLine({
                start: { x: width - 120 - sigLineWidth - 120, y: sigY },
                end: { x: width - 120 - 120, y: sigY },
                thickness: 1,
                color: navy,
            });
            page.drawText('Director of Education', {
                x: width - 120 - sigLineWidth - 120 + (sigLineWidth - fontItalic.widthOfTextAtSize('Director of Education', 10)) / 2,
                y: sigY - 20,
                size: 10,
                font: fontItalic,
                color: navy,
            });

            // 5. Generate QR Code for Verification
            const verifyUrl = `https://verify.torii.sbs/cert/${certificateCode}`;
            const qrCodeBuffer = await QRCode.toBuffer(verifyUrl);
            const qrImage = await pdfDoc.embedPng(qrCodeBuffer);
            page.drawImage(qrImage, {
                x: width - 170,
                y: 70,
                width: 90,
                height: 90
            });

            const pdfBytes = await pdfDoc.save();

            // 6. Upload to Storage
            const key = `certificates/${userId}/${certificateCode}.pdf`;
            const fileUrl = await this.storageService.upload({
                key,
                file: Buffer.from(pdfBytes),
                contentType: 'application/pdf',
            });

            // 7. Save to DB
            const created = await this.certificateRepository.create({
                user: { connect: { id: userId } },
                courseRun: { connect: { id: courseRunId } },
                enrollment: { connect: { id: enrollmentId } },
                certificateCode,
                fileUrl,
                issueDate: new Date(),
                metadata: {
                    userName,
                    courseTitle: course.title,
                }
            });

            this.logger.log(`Certificate issued: ${certificateCode} for user ${userId}`);
            return this.toCertificateDto(created);
        } catch (error: any) {
            this.logger.error(`Error in issueCertificate: ${error.message}`, error.stack);
            throw error;
        }
    }

    async verifyCertificate(code: string): Promise<{ valid: boolean; certificate?: CertificateResponseDTO }> {
        const cert = await this.certificateRepository.findByCode(code);
        if (!cert) return { valid: false };
        return { valid: true, certificate: this.toCertificateDto(cert) };
    }
}

