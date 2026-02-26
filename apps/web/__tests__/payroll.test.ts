import { describe, expect, it } from 'vitest';
import { calculatePayroll } from '@/lib/payroll';

describe('payroll', () => {
  it('computes gross net and deductions', () => {
    const result = calculatePayroll({
      regularMinutes: 2400,
      overtimeMinutes: 300,
      hourlyRate: 10,
      overtimeMultiplier: 1.5,
      deductions: [
        { name: 'Tax', type: 'percent', value: 10 },
        { name: 'Loan', type: 'fixed', value: 20 }
      ]
    });
    expect(result.gross).toBe(475);
    expect(result.deductionsTotal).toBe(67.5);
    expect(result.net).toBe(407.5);
  });
});
