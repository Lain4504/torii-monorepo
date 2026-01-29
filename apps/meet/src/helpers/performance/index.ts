/**
 * Performance Optimization Module
 * 
 * Exports utilities for adaptive performance configuration,
 * message compression, and enhanced message queue
 */

export {
  PerformanceConfig,
  getPerformanceConfig,
  getDefaultPerformanceConfig,
  isAdaptivePerformanceEnabled,
} from './config';

export {
  compressMessage,
  decompressMessage,
  shouldCompress,
  getMessageSize,
  isCompressionSupported,
} from './compression';

export { useAdaptivePerformance } from './useAdaptivePerformance';
