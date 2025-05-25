"use client"

import React, { useState } from 'react';
import { Users, DollarSign, TrendingUp, Download, Plus } from 'lucide-react';
import { useEmployees } from './hooks/useEmployees';
import { calculatePay, getTotalPayroll } from './utils/payrollCalculations';
import { exportPayrollToPDF } from './utils/exportUtils';

// Import all components
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { ErrorAlert } from './components/common/ErrorAlert';
import { Header } from './components/layout/Header';
import { Navigation } from './components/layout/Navigation';
import { StatsCard } from './components/dashboard/StatsCard';
import { PayrollTable } from './components/dashboard/PayrollTable';
import { EmployeeCard } from './components/employees/EmployeeCard';
import { EmployeeModal } from './components/employees/EmployeeModal';
import { DetailedPayrollTable } from './components/payroll/DetailedPayrollTable';

export default function Home() {
  const {
    employees,
    loading,
    connected,
    error,
    setError,
    addEmployee,
    updateEmployee,
    deleteEmployee
  } = useEmployees();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [exporting, setExporting] = useState(false);

  // Calculate dashboard stats
  const totalEmployees = employees.length;
  const totalPayroll = getTotalPayroll(employees);
  const avgSalary = totalEmployees > 0 ? totalPayroll / totalEmployees : 0;
  const totalHours = employees.reduce((sum, emp) => 
    sum + emp.hours_worked + emp.overtime_hours, 0
  );

  // Handle employee operations
  const handleAddEmployee = async (employeeData) => {
    const result = await addEmployee(employeeData);
    if (result.success) {
      setIsModalOpen(false);
      setEditingEmployee(null);
    }
  };

  const handleUpdateEmployee = async (employeeData) => {
    if (editingEmployee) {
      const result = await updateEmployee(editingEmployee.id, employeeData);
      if (result.success) {
        setIsModalOpen(false);
        setEditingEmployee(null);
      }
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      await deleteEmployee(id);
    }
  };

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
    setIsModalOpen(true);
  };

  const handleExportPayroll = async () => {
    setExporting(true);
    const result = exportPayrollToPDF(employees);
    if (!result.success) {
      setError(result.error);
    }
    setExporting(false);
  };

  const renderDashboard = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Employees"
          value={totalEmployees}
          icon={Users}
          gradient="from-blue-500 to-blue-600"
        />
        <StatsCard
          title="Total Payroll"
          value={`$${totalPayroll.toFixed(0)}`}
          icon={DollarSign}
          gradient="from-green-500 to-green-600"
        />
        <StatsCard
          title="Average Pay"
          value={`$${avgSalary.toFixed(0)}`}
          icon={TrendingUp}
          gradient="from-purple-500 to-purple-600"
        />
        <StatsCard
          title="Total Hours"
          value={totalHours}
          icon={Users}
          gradient="from-orange-500 to-orange-600"
        />
      </div>

      {/* Recent Payroll Overview */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Recent Payroll Overview</h2>
          <button
            onClick={handleExportPayroll}
            disabled={exporting || employees.length === 0}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4" />
            {exporting ? 'Exporting...' : 'Export PDF'}
          </button>
        </div>
        
        {employees.length > 0 ? (
          <PayrollTable employees={employees.slice(0, 10)} />
        ) : (
          <div className="text-center py-8 text-gray-500">
            No employees found. Add some employees to see payroll data.
          </div>
        )}
      </div>
    </div>
  );

  const renderEmployees = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          Employees ({totalEmployees})
        </h2>
        <button
          onClick={() => {
            setEditingEmployee(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Employee
        </button>
      </div>

      {employees.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {employees.map((employee) => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              onEdit={handleEditEmployee}
              onDelete={handleDeleteEmployee}
              loading={loading}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-600 mb-2">No employees yet</h3>
          <p className="text-gray-500 mb-6">
            Get started by adding your first employee to the system.
          </p>
          <button
            onClick={() => {
              setEditingEmployee(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Add First Employee
          </button>
        </div>
      )}
    </div>
  );

  const renderPayroll = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Payroll Details</h2>
          <p className="text-gray-600">
            Detailed breakdown of employee compensation
          </p>
        </div>
        <button
          onClick={handleExportPayroll}
          disabled={exporting || employees.length === 0}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="h-4 w-4" />
          {exporting ? 'Exporting...' : 'Export PDF'}
        </button>
      </div>

      {employees.length > 0 ? (
        <>
          <DetailedPayrollTable employees={employees} />
          
          {/* Payroll Summary */}
          <div className="mt-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
            <h3 className="text-xl font-semibold mb-4">Payroll Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-indigo-100">Total Gross Pay</p>
                <p className="text-2xl font-bold">
                  ${employees.reduce((sum, emp) => sum + calculatePay(emp).grossPay, 0).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-indigo-100">Total Taxes</p>
                <p className="text-2xl font-bold">
                  ${employees.reduce((sum, emp) => sum + calculatePay(emp).taxes, 0).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-indigo-100">Total Deductions</p>
                <p className="text-2xl font-bold">
                  ${employees.reduce((sum, emp) => sum + emp.deductions, 0).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-indigo-100">Total Net Pay</p>
                <p className="text-2xl font-bold">
                  ${totalPayroll.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <DollarSign className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-600 mb-2">No payroll data</h3>
          <p className="text-gray-500">
            Add employees to generate payroll information.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header connected={connected} />
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Error Alert */}
      <ErrorAlert error={error} onDismiss={() => setError(null)} />
      
      {/* Loading State */}
      {loading && employees.length === 0 && <LoadingSpinner />}
      
      {/* Tab Content */}
      {!loading || employees.length > 0 ? (
        <>
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'employees' && renderEmployees()}
          {activeTab === 'payroll' && renderPayroll()}
        </>
      ) : null}
      
      {/* Employee Modal */}
      <EmployeeModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEmployee(null);
        }}
        onSave={editingEmployee ? handleUpdateEmployee : handleAddEmployee}
        editingEmployee={editingEmployee}
        loading={loading}
      />
    </div>
  );
}