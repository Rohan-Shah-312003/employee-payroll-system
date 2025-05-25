import { Edit, Trash2 } from 'lucide-react';
import { calculatePay } from '../../utils/payrollCalculations';

export const EmployeeCard = ({ employee, onEdit, onDelete, loading }) => {
  const pay = calculatePay(employee);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">{employee.name}</h3>
          <p className="text-gray-600">{employee.position} • {employee.department}</p>
          <p className="text-sm text-gray-500">{employee.email}</p>
          <p className="text-xs text-gray-400 mt-1">
            Last updated: {new Date(employee.updated_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(employee)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            disabled={loading}
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(employee.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            disabled={loading}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <p className="text-gray-500">Hourly Rate</p>
          <p className="font-medium">${employee.hourly_rate}/hr</p>
        </div>
        <div>
          <p className="text-gray-500">Hours Worked</p>
          <p className="font-medium">{employee.hours_worked + employee.overtime_hours}</p>
        </div>
        <div>
          <p className="text-gray-500">Gross Pay</p>
          <p className="font-medium">${pay.grossPay.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-gray-500">Net Pay</p>
          <p className="font-bold text-green-600">${pay.netPay.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};
