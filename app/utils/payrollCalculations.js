export const calculatePay = (employee) => {
  const regularPay = employee.hours_worked * employee.hourly_rate;
  const overtimePay = employee.overtime_hours * employee.hourly_rate * 1.5;
  const grossPay = regularPay + overtimePay + employee.bonus;
  const taxes = grossPay * 0.25; // 25% tax rate
  const netPay = grossPay - taxes - employee.deductions;
  
  return {
    regularPay,
    overtimePay,
    grossPay,
    taxes,
    netPay
  };
};

export const getTotalPayroll = (employees) => {
  return employees.reduce((total, emp) => {
    const pay = calculatePay(emp);
    return total + pay.netPay;
  }, 0);
};