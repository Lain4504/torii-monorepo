import { Controller, Logger, Inject } from '@nestjs/common';
import { MessagePattern, Payload, ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { CouponService } from '@server/billing/modules/coupon/coupon.service';
import { CouponValidateRequestDTO } from '@workspace/schemas';

@Controller()
export class CouponHandler {
  private readonly logger = new Logger(CouponHandler.name);

  constructor(
    private readonly couponService: CouponService,
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) {
    this.logger.log(
      '🔥 CouponHandler initialized with string pattern listener',
    );
  }

  @MessagePattern({ cmd: 'billing.coupon.validate' })
  async validate(@Payload() data: CouponValidateRequestDTO) {
    this.logger.log(
      `[CouponHandler] Received validation request for code: ${data.code}, userId: ${data.userId}, courseMasterId: ${data.courseMasterId}, courseRunId: ${data.courseRunId}`,
    );

    let orderAmount = 0;

    if (data.courseRunId) {
      try {
        const run = await lastValueFrom(
          this.natsClient.send(
            { cmd: 'learning.courserun.findById' },
            { id: data.courseRunId },
          ),
        );
        if (run && run.price) {
          orderAmount = Number(run.price);
        } else if (run && run.courseMasterId) {
          const master = await lastValueFrom(
            this.natsClient.send(
              { cmd: 'learning.coursemaster.findById' },
              { id: run.courseMasterId },
            ),
          );
          if (master && master.price) {
            orderAmount = Number(master.price);
          }
        }
      } catch (error: any) {
        this.logger.warn(
          `[CouponHandler] Failed to fetch run ${data.courseRunId}: ${error.message}`,
        );
      }
    } else if (data.courseMasterId) {
      try {
        const master = await lastValueFrom(
          this.natsClient.send(
            { cmd: 'learning.coursemaster.findById' },
            { id: data.courseMasterId },
          ),
        );
        if (master && master.price) {
          orderAmount = Number(master.price);
        }
      } catch (error: any) {
        this.logger.warn(
          `[CouponHandler] Failed to fetch master ${data.courseMasterId}: ${error.message}`,
        );
      }
    }

    try {
      const result = await this.couponService.validateCoupon(
        data.code,
        data.userId || '',
        orderAmount,
        data.courseMasterId,
        data.courseRunId,
      );
      this.logger.log(
        `[CouponHandler] Validation result: ${JSON.stringify(result)}`,
      );
      return result;
    } catch (error: any) {
      this.logger.error(
        `[CouponHandler] Validation error: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  @MessagePattern({ cmd: 'billing.coupon.createRedeemed' })
  async createRedeemed(
    @Payload()
    data: {
      userId: string;
      name: string;
      discountType: any;
      discountValue: number;
      maxDiscountAmount?: number;
      minOrderAmount?: number;
      validDurationDays?: number;
    },
  ) {
    this.logger.log(
      `[CouponHandler] Creating redeemed coupon for user: ${data.userId}`,
    );
    console.log('🔴 CouponHandler.createRedeemed CALLED', data);
    try {
      const coupon = await this.couponService.createRedeemedCoupon(data);
      return coupon;
    } catch (error: any) {
      this.logger.error(
        `[CouponHandler] Failed to create redeemed coupon: ${error.message}`,
      );
      throw error;
    }
  }

  @MessagePattern({ cmd: 'billing.coupon.getMyCoupons' })
  async getMyCoupons(@Payload() data: { userId: string }) {
    this.logger.log(`[CouponHandler] Getting coupons for user: ${data.userId}`);
    try {
      return await this.couponService.getCouponsForUser(data.userId);
    } catch (error: any) {
      this.logger.error(
        `[CouponHandler] Failed to get coupons for user: ${error.message}`,
      );
      throw error;
    }
  }
}
