export type PayrollInput = {
  regularMinutes: number;
  overtimeMinutes: number;
  hourlyRate: number;
  overtimeMultiplier?: number;
  deductions: { name: string; type: 'fixed' | 'percent'; value: number }[];
};

export function calculatePayroll(input: PayrollInput) {
  const overtimeMultiplier = input.overtimeMultiplier ?? 1.5;
  const regularHours = input.regularMinutes / 60;
  const overtimeHours = input.overtimeMinutes / 60;
  const gross = regularHours * input.hourlyRate + overtimeHours * input.hourlyRate * overtimeMultiplier;

  const deductionsBreakdown = input.deductions.map((d) => ({
    name: d.name,
    amount: d.type === 'fixed' ? d.value : (gross * d.value) / 100
  }));

  const deductionsTotal = deductionsBreakdown.reduce((sum, d) => sum + d.amount, 0);
  const net = gross - deductionsTotal;

  return {
    regularHours,
    overtimeHours,
    gross,
    deductionsTotal,
    net,
    deductionsBreakdown
  };
}
