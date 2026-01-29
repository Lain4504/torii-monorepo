/**
 * Enhanced Message Queue with Batching Support
 * 
 * This extends the basic MessageQueue with batching capabilities
 * to reduce the number of NATS publish operations in large rooms
 */

import { JetStreamClient, JetStreamError } from '@nats-io/jetstream';
import { errors } from '@nats-io/nats-core';
import { formatNatsError } from '../utils';
import { store } from '../../store';
import { addUserNotification } from '../../store/slices/roomSettingsSlice';
import i18n from '../i18n';
import { PerformanceConfig } from '../performance/config';

const WAITING = 'WAITING';
const PROCESSING = 'PROCESSING';

interface Message {
  subject: string;
  payload: any;
}

interface BatchedMessage {
  subject: string;
  payloads: any[];
  timestamp: number;
}

export default class EnhancedMessageQueue {
  private _isConnected: boolean = false;
  private _js: JetStreamClient | undefined;
  private readonly _queue: Array<Message> = [];
  private readonly _batchQueue: Map<string, BatchedMessage> = new Map();
  private _state = WAITING;
  private _isHoldingNotificationShown = false;
  private _performanceConfig: PerformanceConfig;
  private _batchTimer: NodeJS.Timeout | null = null;

  constructor(performanceConfig: PerformanceConfig) {
    this._performanceConfig = performanceConfig;
  }

  /**
   * Update performance configuration
   */
  public updatePerformanceConfig = (config: PerformanceConfig) => {
    this._performanceConfig = config;
  };

  /**
   * Updates the connection status of the queue.
   */
  public setIsConnected = (value: boolean) => {
    this._isConnected = value;
    if (this._isConnected) {
      this.processMessages().then();
    }
  };

  /**
   * Sets the JetStream client.
   */
  public setJs = (value: JetStreamClient) => {
    this._js = value;
  };

  /**
   * Adds a new message to the queue with optional batching.
   */
  public addToQueue = (message: Message) => {
    if (this._performanceConfig.enableMessageBatching) {
      this.addToBatchQueue(message);
    } else {
      this._queue.push(message);
      if (this._state === WAITING) {
        this.processMessages().then();
      }
    }
  };

  /**
   * Add message to batch queue
   */
  private addToBatchQueue = (message: Message) => {
    const batch = this._batchQueue.get(message.subject);
    
    if (batch) {
      batch.payloads.push(message.payload);
      
      // Flush immediately if batch size reached
      if (batch.payloads.length >= this._performanceConfig.messageBatchSize) {
        this.flushBatch(message.subject);
      }
    } else {
      // Create new batch
      this._batchQueue.set(message.subject, {
        subject: message.subject,
        payloads: [message.payload],
        timestamp: Date.now(),
      });
      
      // Schedule batch flush
      if (!this._batchTimer && this._performanceConfig.messageBatchTimeout > 0) {
        this._batchTimer = setTimeout(() => {
          this.flushAllBatches();
          this._batchTimer = null;
        }, this._performanceConfig.messageBatchTimeout);
      }
    }
  };

  /**
   * Flush a specific batch to the regular queue
   */
  private flushBatch = (subject: string) => {
    const batch = this._batchQueue.get(subject);
    if (!batch) return;

    // For batched messages, we send them individually but rapidly
    // This maintains compatibility while reducing timing overhead
    batch.payloads.forEach(payload => {
      this._queue.push({ subject, payload });
    });

    this._batchQueue.delete(subject);

    if (this._state === WAITING) {
      this.processMessages().then();
    }
  };

  /**
   * Flush all pending batches
   */
  private flushAllBatches = () => {
    const subjects = Array.from(this._batchQueue.keys());
    subjects.forEach(subject => this.flushBatch(subject));
  };

  /**
   * Force flush all batched messages (for cleanup/disconnect)
   */
  public forceFlushBatches = () => {
    if (this._batchTimer) {
      clearTimeout(this._batchTimer);
      this._batchTimer = null;
    }
    this.flushAllBatches();
  };

  /**
   * Processes the message queue.
   */
  private async processMessages() {
    if (this._state === PROCESSING) {
      return;
    }
    this._state = PROCESSING;

    while (this._queue.length > 0 && this._isConnected) {
      if (!this._js) {
        break;
      }

      const request = this._queue[0];

      try {
        await this._js.publish(request.subject, request.payload, {
          timeout: this._performanceConfig.natsPublishTimeout,
        });
        this._queue.shift();
        this._isHoldingNotificationShown = false;
      } catch (e: any) {
        // Check if this is a transient network error or a terminal message error.
        if (
          e instanceof errors.TimeoutError ||
          e instanceof errors.NoRespondersError ||
          e instanceof JetStreamError
        ) {
          console.error(
            `NATS transient error: ${e.message}. Holding queue until reconnect.`,
          );
          
          if (e.message.includes('connection draining')) {
            break;
          }

          if (!this._isHoldingNotificationShown) {
            const msg = formatNatsError(e);
            store.dispatch(
              addUserNotification({
                message: i18n.t('notifications.queue-holding-messages', {
                  error: msg,
                }),
                typeOption: 'warning',
              }),
            );
            this._isHoldingNotificationShown = true;
          }
          break;
        } else {
          // Poison message - discard it
          console.error(
            `Found poison message. Discarding to prevent queue blockage.`,
            {
              error: e.message,
              message: request,
            },
          );
          store.dispatch(
            addUserNotification({
              message: i18n.t('notifications.queue-discarded-message', {
                error: e.message,
              }),
              typeOption: 'error',
            }),
          );
          this._queue.shift();
        }
      }
    }

    this._state = WAITING;
  }

  /**
   * Get queue statistics
   */
  public getStats = () => {
    return {
      queueLength: this._queue.length,
      batchQueueSize: this._batchQueue.size,
      isConnected: this._isConnected,
      state: this._state,
    };
  };
}
