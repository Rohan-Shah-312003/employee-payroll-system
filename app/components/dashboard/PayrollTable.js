import { calculatePay } from '../../utils/payrollCalculations';

export const PayrollTable = ({ employees }) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="border-b border-gray-200">
          <th className="text-left py-3 px-4 font-medium text-gray-600">Employee</th>
          <th className="text-left py-3 px-4 font-medium text-gray-600">Position</th>
          <th className="text-right py-3 px-4 font-medium text-gray-600">Hours</th>
          <th className="text-right py-3 px-4 font-medium text-gray-600">Gross Pay</th>
          <th className="text-right py-3 px-4 font-medium text-gray-600">Net Pay</th>
        </tr>
      </thead>
      <tbody>
        {employees.map((employee) => {
          const pay = calculatePay(employee);
          return (
            <tr key={employee.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-4">
                <div>
                  <div className="font-medium text-gray-900">{employee.name}</div>
                  <div className="text-sm text-gray-500">{employee.email}</div>
                </div>
              </td>
              <td className="py-3 px-4 text-gray-600">{employee.position}</td>
              <td className="py-3 px-4 text-right text-gray-600">
                {employee.hours_worked + employee.overtime_hours}
              </td>
              <td className="py-3 px-4 text-right font-medium text-gray-900">
                ${pay.grossPay.toFixed(2)}
              </td>
              <td className="py-3 px-4 text-right font-bold text-green-600">
                ${pay.netPay.toFixed(2)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);
