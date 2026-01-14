/**
 * Notification Event Interface
 * Unified message contract for all notification events
 */
export interface NotificationEvent {
  pattern: 'send_notification';
  data: {
    recipientId: string;
    type: 'COMMENT_REPLY' | 'DAILY_SUMMARY';
    payload: {
      title: string;
      body: string;
      metadata: Record<string, any>;
    };
  };
}

/**
 * Notification Event Data (for NATS payload)
 */
export interface NotificationEventData {
  recipientId: string;
  type: 'COMMENT_REPLY' | 'DAILY_SUMMARY';
  payload: {
    title: string;
    body: string;
    metadata: Record<string, any>;
  };
}
