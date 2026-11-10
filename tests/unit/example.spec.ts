import { describe, expect, test } from 'vitest';
import { normalizeReference } from '@/services/donationService';
describe('ReliefGO reference normalization', () => {
  test('strips punctuation and uppercases', () => expect(normalizeReference(' gc- 123 a ')).toBe('GC123A'));
});
