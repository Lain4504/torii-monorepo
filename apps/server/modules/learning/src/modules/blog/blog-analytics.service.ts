import { Injectable, Logger, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PrismaService } from '@server/shared';

/**
 * Blog Analytics Service
 * Handles analytics and statistics for blogs
 */
@Injectable()
export class BlogAnalyticsService {
  private readonly logger = new Logger(BlogAnalyticsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject('NATS_SERVICE')
    private readonly natsClient: ClientProxy,
  ) { }

  /**
   * Generate daily interaction statistics for staff blogs
   * This should be called daily at 00:00 to send summary of interactions from the previous day
   * 
   * Logic: 
   * - Find all published blogs (must have publishedAt)
   * - For each blog, check comments created in the previous day (00:00 to 23:59:59 Asia/Ho_Chi_Minh)
   * - Only process blogs that were published before or on the target date
   * - Send notification to staff if there were interactions in the previous day
   * - If no interactions, skip (don't send notification)
   * - Prevent duplicate notifications for the same day
   */
  async generateDailyBlogInteractionStats(): Promise<void> {
    try {
      this.logger.log('Starting daily blog interaction statistics generation (daily summary at 00:00)...');

      // Get current time in Asia/Ho_Chi_Minh timezone
      const now = new Date();
      const asiaHCMOffsetHours = 7;

      // Get current date in Asia/Ho_Chi_Minh
      const nowAsiaHCM = new Date(now.getTime() + (now.getTimezoneOffset() * 60 * 1000) + (asiaHCMOffsetHours * 60 * 60 * 1000));

      // Calculate yesterday (previous day) in Asia/Ho_Chi_Minh
      const yesterdayStart = new Date(nowAsiaHCM);
      yesterdayStart.setUTCDate(yesterdayStart.getUTCDate() - 1);
      yesterdayStart.setUTCHours(0, 0, 0, 0);

      const yesterdayEnd = new Date(yesterdayStart);
      yesterdayEnd.setUTCHours(23, 59, 59, 999);

      // Convert to UTC for database queries
      const startUTC = new Date(yesterdayStart.getTime() - (asiaHCMOffsetHours * 60 * 60 * 1000));
      const endUTC = new Date(yesterdayEnd.getTime() - (asiaHCMOffsetHours * 60 * 60 * 1000));

      // Format date string for metadata (YYYY-MM-DD)
      const dateString = yesterdayStart.toISOString().split('T')[0];

      // Log for debugging
      this.logger.log(`Generating daily summary for: ${dateString} (Asia/Ho_Chi_Minh)`);
      this.logger.log(`  Yesterday start (UTC): ${startUTC.toISOString()}`);
      this.logger.log(`  Yesterday end (UTC): ${endUTC.toISOString()}`);
      this.logger.log(`  Yesterday start (Asia/HCM): ${yesterdayStart.toISOString()}`);
      this.logger.log(`  Yesterday end (Asia/HCM): ${yesterdayEnd.toISOString()}`);

      // Find all published blogs (must have publishedAt)
      // Only process blogs that were published before or on the target date
      const allPublishedBlogs = await this.prisma.blog.findMany({
        where: {
          status: 'published',
          publishedAt: {
            not: null, // Must have publishedAt
          },
        },
        select: {
          id: true,
          title: true,
          authorId: true,
          publishedAt: true,
        },
      });

      this.logger.log(`Found ${allPublishedBlogs.length} published blogs to check`);

      // Filter blogs: only process blogs that were published before or on the target date
      // (Don't send notification for blogs published in the future)
      const targetDate = new Date(dateString + 'T23:59:59Z');

      const validBlogs = allPublishedBlogs.filter(blog => {
        if (!blog.publishedAt) return false;
        // Convert publishedAt to Asia/Ho_Chi_Minh for comparison
        const publishedAtAsiaHCM = new Date(
          blog.publishedAt.getTime() + (asiaHCMOffsetHours * 60 * 60 * 1000)
        );
        const publishedDate = publishedAtAsiaHCM.toISOString().split('T')[0];
        // Only process if blog was published on or before the target date
        return publishedDate <= dateString;
      });

      this.logger.log(`Filtered to ${validBlogs.length} blogs (published on or before ${dateString})`);

      let notificationCount = 0;
      let skippedCount = 0;
      let alreadyNotifiedCount = 0;

      // Process each blog and calculate interactions from the target date
      for (const blog of validBlogs) {
        try {
          // Check if notification already exists for this blog and date (prevent duplicate)
          const existingNotifications = await this.prisma.$queryRaw<Array<{ id: string }>>`
            SELECT id
            FROM notifications
            WHERE user_id = ${blog.authorId}::uuid
              AND notification_type = 'blog_analytics'
              AND data->>'blogId' = ${blog.id}
              AND data->>'date' = ${dateString}
            LIMIT 1
          `;

          if (existingNotifications && existingNotifications.length > 0) {
            this.logger.log(
              `Skipping blog ${blog.id} - notification already sent for date ${dateString}`,
            );
            alreadyNotifiedCount++;
            continue;
          }

          // Count comments created in the time range
          const commentsInRange = await this.prisma.comment.count({
            where: {
              targets: {
                some: {
                  targetId: blog.id,
                  targetType: 'BLOG',
                },
              },
              status: {
                not: 'deleted',
              },
              createdAt: {
                gte: startUTC,
                lte: endUTC,
              },
            },
          });

          // Only send notification if there are interactions
          if (commentsInRange > 0) {
            this.logger.log(
              `✅ Blog ${blog.id} ("${blog.title}") had ${commentsInRange} comments in ${dateString} - Sending notification`,
            );

            // Format message based on interactions
            const message = `Bài viết "${blog.title}" của bạn đã nhận được ${commentsInRange} bình luận trong ngày ${dateString}`;

            this.natsClient.emit(
              { cmd: 'send_notification' },
              {
                recipientId: blog.authorId,
                type: 'DAILY_SUMMARY',
                payload: {
                  title: 'Thống kê tương tác bài viết',
                  body: message,
                  metadata: {
                    blogId: blog.id,
                    blogTitle: blog.title,
                    commentCount: commentsInRange,
                    date: dateString,
                    totalInteractions: commentsInRange,
                  },
                },
              },
            );
            notificationCount++;
          } else {
            // Skip if no interactions
            this.logger.log(
              `⏭️ Skipping blog ${blog.id} ("${blog.title}") - no interactions in ${dateString} (Comments: ${commentsInRange}) - No notification sent`,
            );
            skippedCount++;
          }
        } catch (error: any) {
          this.logger.error(`Failed to process blog ${blog.id}: ${error?.message}`, error);
          // Continue with next blog
        }
      }

      this.logger.log(
        `Daily blog interaction statistics generation completed. Processed ${validBlogs.length} blogs, sent ${notificationCount} notifications, skipped ${skippedCount} blogs (no interactions), already notified ${alreadyNotifiedCount} blogs.`,
      );
    } catch (error: any) {
      this.logger.error('Error generating daily blog interaction statistics:', error);
      throw error;
    }
  }
}
