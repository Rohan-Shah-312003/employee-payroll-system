import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { calculatePay } from './payrollCalculations';

export const exportPayrollToPDF = (employees) => {
  try {
    const payrollData = employees.map(emp => {
      const pay = calculatePay(emp);
      return {
        Name: emp.name,
        Position: emp.position,
        Department: emp.department,
        'Hours Worked': emp.hours_worked,
        'Overtime Hours': emp.overtime_hours,
        'Hourly Rate': `$${emp.hourly_rate}`,
        'Regular Pay': `$${pay.regularPay.toFixed(2)}`,
        'Overtime Pay': `$${pay.overtimePay.toFixed(2)}`,
        'Bonus': `$${emp.bonus}`,
        'Gross Pay': `$${pay.grossPay.toFixed(2)}`,
        'Taxes': `$${pay.taxes.toFixed(2)}`,
        'Deductions': `$${emp.deductions}`,
        'Net Pay': `$${pay.netPay.toFixed(2)}`
      };
    });

    const doc = new jsPDF();
    const headers = Object.keys(payrollData[0]);
    const rows = payrollData.map(entry => headers.map(h => entry[h]));

    doc.text("Payroll Report", 14, 15);

    autoTable(doc, {
      startY: 20,
      head: [headers],
      body: rows,
      styles: {
        fontSize: 8,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [41, 128, 185]
      }
    });

    doc.save("payroll_export.pdf");
    return { success: true };
  } catch (err) {
    console.error('Error exporting payroll:', err);
    return { success: false, error: 'Failed to export payroll data' };
  }
};