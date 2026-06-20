import { describe, it, expect } from 'vitest';
import { getWeekNumber, formatDate, getDayName } from './dateUtils';

describe('dateUtils', () => {
  describe('getWeekNumber', () => {
    it('should return correct ISO week number for a given date', () => {
      // 2023-01-01 is a Sunday, belongs to week 52 of 2022
      expect(getWeekNumber(new Date('2023-01-01T00:00:00'))).toBe(52);
      // 2023-01-05 is a Thursday, belongs to week 1 of 2023
      expect(getWeekNumber(new Date('2023-01-05T00:00:00'))).toBe(1);
    });
  });

  describe('formatDate', () => {
    it('should format date as M/D without leading zeros', () => {
      expect(formatDate(new Date('2023-01-05T00:00:00'))).toBe('1/5');
      expect(formatDate(new Date('2023-12-10T00:00:00'))).toBe('12/10');
    });
  });

  describe('getDayName', () => {
    it('should return correct Chinese day name', () => {
      expect(getDayName(new Date('2023-01-01T00:00:00'))).toBe('日');
      expect(getDayName(new Date('2023-01-02T00:00:00'))).toBe('一');
      expect(getDayName(new Date('2023-01-03T00:00:00'))).toBe('二');
      expect(getDayName(new Date('2023-01-04T00:00:00'))).toBe('三');
      expect(getDayName(new Date('2023-01-05T00:00:00'))).toBe('四');
      expect(getDayName(new Date('2023-01-06T00:00:00'))).toBe('五');
      expect(getDayName(new Date('2023-01-07T00:00:00'))).toBe('六');
    });
  });
});
