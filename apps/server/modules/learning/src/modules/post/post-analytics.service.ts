import { Injectable, Logger, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PrismaService } from '@server/shared';

/**
 * Post Analytics Service
 * Handles analytics and statistics for posts
 */
@Injectable()
export class PostAnalyticsService {
  private readonly logger = new Logger(PostAnalyticsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject('NATS_SERVICE')
    private readonly natsClient: ClientProxy,
  ) { }

  /**
   * Generate daily interaction statistics for staff posts
   * This should be called daily at 00:00 to send summary of interactions from the previous day
   * 
   * Logic: 
   * - Find all published posts (must have publishedAt)
   * - For each post, check comments created in the previous day (00:00 to 23:59:59 Asia/Ho_Chi_Minh)
   * - Only process posts that were published before or on the target date
   * - Send notification to staff if there were interactions in the previous day
   * - If no interactions, skip (don't send notification)
   * - Prevent duplicate notifications for the same day
   */
  async generateDailyPostInteractionStats(): Promise<void> {
    try {
      this.logger.log('Starting daily post interaction statistics generation (daily summary at 00:00)...');

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

      // Find all published posts (must have publishedAt)
      // Only process posts that were published before or on the target date
      const allPublishedPosts = await this.prisma.post.findMany({
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

      this.logger.log(`Found ${allPublishedPosts.length} published posts to check`);

      // Filter posts: only process posts that were published before or on the target date
      // (Don't send notification for posts published in the future)
      const targetDate = new Date(dateString + 'T23:59:59Z');
      
      const validPosts = allPublishedPosts.filter(post => {
        if (!post.publishedAt) return false;
        // Convert publishedAt to Asia/Ho_Chi_Minh for comparison
        const publishedAtAsiaHCM = new Date(
          post.publishedAt.getTime() + (asiaHCMOffsetHours * 60 * 60 * 1000)
        );
        const publishedDate = publishedAtAsiaHCM.toISOString().split('T')[0];
        // Only process if post was published on or before the target date
        return publishedDate <= dateString;
      });

      this.logger.log(`Filtered to ${validPosts.length} posts (published on or before ${dateString})`);

      let notificationCount = 0;
      let skippedCount = 0;
      let alreadyNotifiedCount = 0;

      // Process each post and calculate interactions from the target date
      for (const post of validPosts) {
        try {
          // Check if notification already exists for this post and date (prevent duplicate)
          const existingNotifications = await this.prisma.$queryRaw<Array<{ id: string }>>`
            SELECT id
            FROM notifications
            WHERE user_id = ${post.authorId}::uuid
              AND notification_type = 'post_analytics'
              AND data->>'postId' = ${post.id}
              AND data->>'date' = ${dateString}
            LIMIT 1
          `;

          if (existingNotifications && existingNotifications.length > 0) {
            this.logger.log(
              `Skipping post ${post.id} - notification already sent for date ${dateString}`,
            );
            alreadyNotifiedCount++;
            continue;
          }

          // Count comments created in the time range
          const commentsInRange = await this.prisma.comment.count({
            where: {
              postId: post.id,
              status: {
                not: 'deleted',
              },
              createdAt: {
                gte: startUTC,
                lte: endUTC,
              },
            },
          });

          // Count likes on the post (if you track post likes separately)
          // For now, we'll focus on comments only
          // TODO: Add post likes tracking if needed
          const likesInRange = 0; // Placeholder - add if you track post likes by date

          // Only send notification if there are interactions
          if (commentsInRange > 0 || likesInRange > 0) {
            this.logger.log(
              `✅ Post ${post.id} ("${post.title}") had ${commentsInRange} comments in ${dateString} - Sending notification`,
            );

            // Format message based on interactions
            let message = '';
            if (commentsInRange > 0 && likesInRange > 0) {
              message = `Bài viết "${post.title}" của bạn đã nhận được ${commentsInRange} bình luận và ${likesInRange} lượt thích trong ngày ${dateString}`;
            } else if (commentsInRange > 0) {
              message = `Bài viết "${post.title}" của bạn đã nhận được ${commentsInRange} bình luận trong ngày ${dateString}`;
            } else if (likesInRange > 0) {
              message = `Bài viết "${post.title}" của bạn đã nhận được ${likesInRange} lượt thích trong ngày ${dateString}`;
            }

            this.natsClient.emit(
              { cmd: 'send_notification' },
              {
                recipientId: post.authorId,
                type: 'DAILY_SUMMARY',
                payload: {
                  title: 'Thống kê tương tác bài viết',
                  body: message,
                  metadata: {
                    postId: post.id,
                    postTitle: post.title,
                    commentCount: commentsInRange,
                    likeCount: likesInRange,
                    date: dateString,
                    totalInteractions: commentsInRange + likesInRange,
                  },
                },
              },
            );
            notificationCount++;
          } else {
            // Skip if no interactions
            this.logger.log(
              `⏭️ Skipping post ${post.id} ("${post.title}") - no interactions in ${dateString} (Comments: ${commentsInRange}) - No notification sent`,
            );
            skippedCount++;
          }
        } catch (error: any) {
          this.logger.error(`Failed to process post ${post.id}: ${error?.message}`, error);
          // Continue with next post
        }
      }

      this.logger.log(
        `Daily post interaction statistics generation completed. Processed ${validPosts.length} posts, sent ${notificationCount} notifications, skipped ${skippedCount} posts (no interactions), already notified ${alreadyNotifiedCount} posts.`,
      );
    } catch (error: any) {
      this.logger.error('Error generating daily post interaction statistics:', error);
      throw error;
    }
  }
}
