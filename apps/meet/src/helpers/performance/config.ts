/**
 * Performance Configuration for Whiteboard and NATS Messaging
 * 
 * This module provides adaptive performance settings based on room size
 * to optimize synchronization for large rooms (up to 30+ users)
 */

export interface PerformanceConfig {
  // Whiteboard throttle timings (in ms)
  whiteboardStrokeThrottle: number;
  whiteboardAppStateThrottle: number;
  whiteboardCursorSyncTimeout: number;
  
  // Message batching
  enableMessageBatching: boolean;
  messageBatchSize: number;
  messageBatchTimeout: number;
  
  // Compression
  enableCompression: boolean;
  compressionThreshold: number; // bytes
  
  // NATS optimization
  natsPublishTimeout: number;
  natsMaxReconnectAttempts: number;
}

/**
 * Get performance configuration based on room size
 */
export function getPerformanceConfig(participantCount: number): PerformanceConfig {
  // Small rooms (1-10 users) - prioritize responsiveness
  if (participantCount <= 10) {
    return {
      whiteboardStrokeThrottle: 50,
      whiteboardAppStateThrottle: 100,
      whiteboardCursorSyncTimeout: 33,
      enableMessageBatching: false,
      messageBatchSize: 1,
      messageBatchTimeout: 0,
      enableCompression: false,
      compressionThreshold: 10000,
      natsPublishTimeout: 5000,
      natsMaxReconnectAttempts: 10,
    };
  }
  
  // Medium rooms (11-20 users) - balanced approach
  if (participantCount <= 20) {
    return {
      whiteboardStrokeThrottle: 100,
      whiteboardAppStateThrottle: 150,
      whiteboardCursorSyncTimeout: 50,
      enableMessageBatching: true,
      messageBatchSize: 3,
      messageBatchTimeout: 50,
      enableCompression: true,
      compressionThreshold: 5000,
      natsPublishTimeout: 3000,
      natsMaxReconnectAttempts: 5,
    };
  }
  
  // Large rooms (21-30 users) - prioritize stability and bandwidth
  if (participantCount <= 30) {
    return {
      whiteboardStrokeThrottle: 150,
      whiteboardAppStateThrottle: 200,
      whiteboardCursorSyncTimeout: 66,
      enableMessageBatching: true,
      messageBatchSize: 5,
      messageBatchTimeout: 100,
      enableCompression: true,
      compressionThreshold: 3000,
      natsPublishTimeout: 2000,
      natsMaxReconnectAttempts: 3,
    };
  }
  
  // Very large rooms (30+ users) - maximum optimization
  return {
    whiteboardStrokeThrottle: 200,
    whiteboardAppStateThrottle: 250,
    whiteboardCursorSyncTimeout: 100,
    enableMessageBatching: true,
    messageBatchSize: 10,
    messageBatchTimeout: 150,
    enableCompression: true,
    compressionThreshold: 2000,
    natsPublishTimeout: 1500,
    natsMaxReconnectAttempts: 3,
  };
}

/**
 * Get static defaults from environment or fallback to medium settings
 */
export function getDefaultPerformanceConfig(): PerformanceConfig {
  return {
    whiteboardStrokeThrottle: parseInt(
      import.meta.env.VITE_WHITEBOARD_STROKE_THROTTLE || '100',
      10
    ),
    whiteboardAppStateThrottle: parseInt(
      import.meta.env.VITE_WHITEBOARD_APPSTATE_THROTTLE || '150',
      10
    ),
    whiteboardCursorSyncTimeout: parseInt(
      import.meta.env.VITE_WHITEBOARD_CURSOR_TIMEOUT || '50',
      10
    ),
    enableMessageBatching: 
      import.meta.env.VITE_ENABLE_MESSAGE_BATCHING === 'true',
    messageBatchSize: parseInt(
      import.meta.env.VITE_MESSAGE_BATCH_SIZE || '3',
      10
    ),
    messageBatchTimeout: parseInt(
      import.meta.env.VITE_MESSAGE_BATCH_TIMEOUT || '50',
      10
    ),
    enableCompression: 
      import.meta.env.VITE_ENABLE_COMPRESSION === 'true',
    compressionThreshold: parseInt(
      import.meta.env.VITE_COMPRESSION_THRESHOLD || '5000',
      10
    ),
    natsPublishTimeout: parseInt(
      import.meta.env.VITE_NATS_PUBLISH_TIMEOUT || '3000',
      10
    ),
    natsMaxReconnectAttempts: parseInt(
      import.meta.env.VITE_NATS_MAX_RECONNECT || '5',
      10
    ),
  };
}

/**
 * Check if adaptive performance is enabled.
 * 
 * Returns true by default (when VITE_ADAPTIVE_PERFORMANCE is undefined).
 * Only returns false when explicitly set to 'false'.
 * 
 * This means adaptive performance is opt-out, not opt-in.
 */
export function isAdaptivePerformanceEnabled(): boolean {
  return import.meta.env.VITE_ADAPTIVE_PERFORMANCE !== 'false';
}
