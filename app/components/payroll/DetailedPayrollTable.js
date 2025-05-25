import { calculatePay } from '../../utils/payrollCalculations';

export const DetailedPayrollTable = ({ employees }) => (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left py-4 px-6 font-medium text-gray-600">Employee</th>
            <th className="text-right py-4 px-6 font-medium text-gray-600">Regular</th>
            <th className="text-right py-4 px-6 font-medium text-gray-600">Overtime</th>
            <th className="text-right py-4 px-6 font-medium text-gray-600">Bonus</th>
            <th className="text-right py-4 px-6 font-medium text-gray-600">Gross</th>
            <th className="text-right py-4 px-6 font-medium text-gray-600">Taxes</th>
            <th className="text-right py-4 px-6 font-medium text-gray-600">Deductions</th>
            <th className="text-right py-4 px-6 font-medium text-gray-600">Net Pay</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => {
            const pay = calculatePay(employee);
            return (
              <tr key={employee.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-6">
                  <div>
                    <div className="font-medium text-gray-900">{employee.name}</div>
                    <div className="text-sm text-gray-500">{employee.position}</div>
                  </div>
                </td>
                <td className="py-4 px-6 text-right">${pay.regularPay.toFixed(2)}</td>
                <td className="py-4 px-6 text-right">${pay.overtimePay.toFixed(2)}</td>
                <td className="py-4 px-6 text-right">${employee.bonus.toFixed(2)}</td>
                <td className="py-4 px-6 text-right font-medium">${pay.grossPay.toFixed(2)}</td>
                <td className="py-4 px-6 text-right text-red-600">${pay.taxes.toFixed(2)}</td>
                <td className="py-4 px-6 text-right text-red-600">${employee.deductions.toFixed(2)}</td>
                <td className="py-4 px-6 text-right font-bold text-green-600">${pay.netPay.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot className="bg-gray-50">
          <tr>
            <td className="py-4 px-6 font-bold">Totals</td>
            <td className="py-4 px-6 text-right font-bold">
              ${employees.reduce((sum, emp) => sum + calculatePay(emp).regularPay, 0).toFixed(2)}
            </td>
            <td className="py-4 px-6 text-right font-bold">
              ${employees.reduce((sum, emp) => sum + calculatePay(emp).overtimePay, 0).toFixed(2)}
            </td>
            <td className="py-4 px-6 text-right font-bold">
              ${employees.reduce((sum, emp) => sum + emp.bonus, 0).toFixed(2)}
            </td>
            <td className="py-4 px-6 text-right font-bold">
              ${employees.reduce((sum, emp) => sum + calculatePay(emp).grossPay, 0).toFixed(2)}
            </td>
            <td className="py-4 px-6 text-right font-bold text-red-600">
              ${employees.reduce((sum, emp) => sum + calculatePay(emp).taxes, 0).toFixed(2)}
            </td>
            <td className="py-4 px-6 text-right font-bold text-red-600">
              ${employees.reduce((sum, emp) => sum + emp.deductions, 0).toFixed(2)}
            </td>
            <td className="py-4 px-6 text-right font-bold text-green-600">
              ${employees.reduce((sum, emp) => sum + calculatePay(emp).netPay, 0).toFixed(2)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
);
