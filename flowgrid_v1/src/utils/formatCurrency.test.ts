import { describe, it, expect } from 'vitest';
import { formatCurrency, formatNumber, calculatePercentage } from './formatCurrency';

describe('formatCurrency', () => {
  it('formats positive numbers correctly', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
    expect(formatCurrency(100)).toBe('$100.00');
  });

  it('formats zero correctly', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('formats negative numbers correctly', () => {
    expect(formatCurrency(-1234.56)).toBe('-$1,234.56');
  });

  it('handles large numbers', () => {
    expect(formatCurrency(1000000)).toBe('$1,000,000.00');
  });
});

describe('formatNumber', () => {
  it('formats numbers with commas', () => {
    expect(formatNumber(1234)).toBe('1,234');
    expect(formatNumber(1000000)).toBe('1,000,000');
  });

  it('handles small numbers', () => {
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(99)).toBe('99');
  });
});

describe('calculatePercentage', () => {
  it('calculates percentage correctly', () => {
    expect(calculatePercentage(50, 100)).toBe(50);
    expect(calculatePercentage(25, 100)).toBe(25);
    expect(calculatePercentage(1, 3)).toBe(33);
  });

  it('handles zero total', () => {
    expect(calculatePercentage(10, 0)).toBe(0);
  });

  it('handles zero value', () => {
    expect(calculatePercentage(0, 100)).toBe(0);
  });
});
