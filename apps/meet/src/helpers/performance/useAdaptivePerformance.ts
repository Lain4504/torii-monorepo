/**
 * Hook for managing adaptive performance configuration
 */

import { useEffect, useState } from 'react';
import { useAppSelector } from '../../../store';
import {
  PerformanceConfig,
  getPerformanceConfig,
  getDefaultPerformanceConfig,
  isAdaptivePerformanceEnabled,
} from '../../performance/config';

export function useAdaptivePerformance(): PerformanceConfig {
  const participants = useAppSelector((state) => state.participants);
  const participantCount = participants.length;
  
  const [config, setConfig] = useState<PerformanceConfig>(() => {
    if (isAdaptivePerformanceEnabled()) {
      return getPerformanceConfig(participantCount);
    }
    return getDefaultPerformanceConfig();
  });

  useEffect(() => {
    if (isAdaptivePerformanceEnabled()) {
      const newConfig = getPerformanceConfig(participantCount);
      setConfig(newConfig);
      
      // Log configuration changes for debugging
      console.log(
        `[Performance] Adaptive config updated for ${participantCount} participants:`,
        {
          strokeThrottle: newConfig.whiteboardStrokeThrottle,
          appStateThrottle: newConfig.whiteboardAppStateThrottle,
          batching: newConfig.enableMessageBatching,
          compression: newConfig.enableCompression,
        }
      );
    }
  }, [participantCount]);

  return config;
}
