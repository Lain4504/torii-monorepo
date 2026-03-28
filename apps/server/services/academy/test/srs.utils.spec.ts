import { calculateSrsInterval } from '../src/modules/study-set/srs.utils';
import { SrsState } from '@prisma/generated';

describe('srs.utils', () => {
  describe('calculateSrsInterval', () => {
    it('should reset to LEARNING if quality is 0', () => {
      const result = calculateSrsInterval('MASTERED' as any, 86400, 0);
      expect(result.srsState).toBe('LEARNING');
      expect(result.interval).toBe(60);
    });

    it('should move to MASTERED if quality is 1 and current is LEARNING', () => {
      const result = calculateSrsInterval('LEARNING' as any, 60, 1);
      expect(result.srsState).toBe('MASTERED');
      expect(result.interval).toBe(86400); // 1 day
    });

    it('should increase interval if quality is 1 and current is MASTERED', () => {
      const result = calculateSrsInterval('MASTERED' as any, 86400, 1);
      expect(result.srsState).toBe('MASTERED');
      expect(result.interval).toBe(216000); // 86400 * 2.5
    });
  });
});
