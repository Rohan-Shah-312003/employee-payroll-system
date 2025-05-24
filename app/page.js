"use client"

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, DollarSign, Users, Calculator, Download, Database, Wifi, WifiOff } from 'lucide-react';

// Supabase client configuration
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';

// Mock Supabase client for demo purposes
const createSupabaseClient = () => {
  // In a real implementation, you would use: import { createClient } from '@supabase/supabase-js'
  // const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  
  // Mock implementation for demo
  let mockData = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@company.com',
      position: 'Senior Software Engineer',
      department: 'Engineering',
      hourly_rate: 75,
      hours_worked: 40,
      overtime_hours: 5,
      bonus: 500,
      deductions: 200,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@company.com',
      position: 'Product Manager',
      department: 'Product',
      hourly_rate: 65,
      hours_worked: 40,
      overtime_hours: 2,
      bonus: 300,
      deductions: 150,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike.johnson@company.com',
      position: 'Frontend Developer',
      department: 'Engineering',
      hourly_rate: 55,
      hours_worked: 38,
      overtime_hours: 0,
      bonus: 200,
      deductions: 100,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  return {
    from: (table) => ({
      select: (columns = '*') => ({
        eq: (column, value) => ({
          single: () => Promise.resolve({
            data: mockData.find(item => item[column] === value) || null,
            error: null
          })
        }),
        then: (callback) => callback({
          data: mockData,
          error: null
        })
      }),
      insert: (data) => ({
        select: () => Promise.resolve({
          data: [{ ...data, id: Math.max(...mockData.map(d => d.id)) + 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }],
          error: null
        })
      }),
      update: (data) => ({
        eq: (column, value) => ({
          select: () => {
            const index = mockData.findIndex(item => item[column] === value);
            if (index !== -1) {
              mockData[index] = { ...mockData[index], ...data, updated_at: new Date().toISOString() };
              return Promise.resolve({
                data: [mockData[index]],
                error: null
              });
            }
            return Promise.resolve({ data: null, error: { message: 'Record not found' } });
          }
        })
      }),
      delete: () => ({
        eq: (column, value) => {
          const index = mockData.findIndex(item => item[column] === value);
          if (index !== -1) {
            const deleted = mockData.splice(index, 1);
            return Promise.resolve({
              data: deleted,
              error: null
            });
          }
          return Promise.resolve({ data: null, error: { message: 'Record not found' } });
        }
      })
    }),
    channel: (name) => ({
      on: (event, table, callback) => ({
        subscribe: () => ({
          unsubscribe: () => {}
        })
      })
    })
  };
};

export default function Home() {
  const [employees, setEmployees] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(true);
  const [error, setError] = useState(null);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    position: '',
    department: '',
    hourly_rate: '',
    hours_worked: 40,
    overtime_hours: 0,
    bonus: 0,
    deductions: 0
  });

  const supabase = createSupabaseClient();

  // Load employees from Supabase
  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('employees')
        .select('*');

      if (error) throw error;

      setEmployees(data || []);
      setConnected(true);
    } catch (err) {
      console.error('Error loading employees:', err);
      setError('Failed to load employees from database');
      setConnected(false);
    } finally {
      setLoading(false);
    }
  };

  // Initialize data on component mount
  useEffect(() => {
    loadEmployees();

    // Set up real-time subscription
    const subscription = supabase
      .channel('employees_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'employees' 
        }, 
        (payload) => {
          console.log('Real-time update:', payload);
          loadEmployees(); // Reload data on any change
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const calculatePay = (employee) => {
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

  const getTotalPayroll = () => {
    return employees.reduce((total, emp) => {
      const pay = calculatePay(emp);
      return total + pay.netPay;
    }, 0);
  };

  const handleAddEmployee = async () => {
    if (newEmployee.name && newEmployee.email && newEmployee.position) {
      try {
        setLoading(true);
        setError(null);

        const employeeData = {
          name: newEmployee.name,
          email: newEmployee.email,
          position: newEmployee.position,
          department: newEmployee.department,
          hourly_rate: parseFloat(newEmployee.hourly_rate) || 0,
          hours_worked: parseInt(newEmployee.hours_worked) || 40,
          overtime_hours: parseInt(newEmployee.overtime_hours) || 0,
          bonus: parseFloat(newEmployee.bonus) || 0,
          deductions: parseFloat(newEmployee.deductions) || 0
        };

        const { data, error } = await supabase
          .from('employees')
          .insert([employeeData])
          .select();

        if (error) throw error;

        setEmployees([...employees, data[0]]);
        resetForm();
        setShowAddEmployee(false);
      } catch (err) {
        console.error('Error adding employee:', err);
        setError('Failed to add employee to database');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
    setNewEmployee({
      name: employee.name,
      email: employee.email,
      position: employee.position,
      department: employee.department,
      hourly_rate: employee.hourly_rate.toString(),
      hours_worked: employee.hours_worked,
      overtime_hours: employee.overtime_hours,
      bonus: employee.bonus,
      deductions: employee.deductions
    });
    setShowAddEmployee(true);
  };

  const handleUpdateEmployee = async () => {
    if (!editingEmployee) return;

    try {
      setLoading(true);
      setError(null);

      const employeeData = {
        name: newEmployee.name,
        email: newEmployee.email,
        position: newEmployee.position,
        department: newEmployee.department,
        hourly_rate: parseFloat(newEmployee.hourly_rate) || 0,
        hours_worked: parseInt(newEmployee.hours_worked) || 40,
        overtime_hours: parseInt(newEmployee.overtime_hours) || 0,
        bonus: parseFloat(newEmployee.bonus) || 0,
        deductions: parseFloat(newEmployee.deductions) || 0
      };

      const { data, error } = await supabase
        .from('employees')
        .update(employeeData)
        .eq('id', editingEmployee.id)
        .select();

      if (error) throw error;

      setEmployees(employees.map(emp => 
        emp.id === editingEmployee.id ? data[0] : emp
      ));
      
      resetForm();
      setEditingEmployee(null);
      setShowAddEmployee(false);
    } catch (err) {
      console.error('Error updating employee:', err);
      setError('Failed to update employee in database');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (!confirm('Are you sure you want to delete this employee?')) return;

    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setEmployees(employees.filter(emp => emp.id !== id));
    } catch (err) {
      console.error('Error deleting employee:', err);
      setError('Failed to delete employee from database');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewEmployee({
      name: '',
      email: '',
      position: '',
      department: '',
      hourly_rate: '',
      hours_worked: 40,
      overtime_hours: 0,
      bonus: 0,
      deductions: 0
    });
  };

  const exportPayroll = async () => {
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
      
      // In a real implementation, you might want to store this export in Supabase as well
      console.log('Payroll Export:', payrollData);
      alert('Payroll data exported to console (In production, this would generate a CSV/PDF)');
    } catch (err) {
      console.error('Error exporting payroll:', err);
      setError('Failed to export payroll data');
    }
  };

  const DatabaseStatus = () => (
    <div className="flex items-center gap-2 text-sm">
      {connected ? (
        <>
          <Wifi className="h-4 w-4 text-green-500" />
          <span className="text-green-600">Connected to Supabase</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 text-red-500" />
          <span className="text-red-600">Database Connection Error</span>
        </>
      )}
    </div>
  );

  const ErrorAlert = () => (
    error && (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="text-red-600 font-medium">Database Error</div>
        </div>
        <div className="text-red-700 text-sm mt-1">{error}</div>
        <button 
          onClick={() => setError(null)}
          className="text-red-600 text-sm underline mt-2"
        >
          Dismiss
        </button>
      </div>
    )
  );

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      <span className="ml-2 text-gray-600">Loading...</span>
    </div>
  );

  const DashboardTab = () => (
    <div className="space-y-6">
      <ErrorAlert />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Employees</p>
              <p className="text-3xl font-bold">{employees.length}</p>
            </div>
            <Users className="h-8 w-8 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Total Payroll</p>
              <p className="text-3xl font-bold">${getTotalPayroll().toFixed(2)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Avg Salary</p>
              <p className="text-3xl font-bold">
                ${employees.length > 0 ? (getTotalPayroll() / employees.length).toFixed(2) : '0.00'}
              </p>
            </div>
            <Calculator className="h-8 w-8 text-purple-200" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Recent Payroll</h3>
          <div className="flex items-center gap-4">
            <DatabaseStatus />
            <button 
              onClick={exportPayroll}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
              disabled={loading}
            >
              <Download className="h-4 w-4" />
              Export Payroll
            </button>
          </div>
        </div>
        
        {loading ? (
          <LoadingSpinner />
        ) : (
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
        )}
      </div>
    </div>
  );

  const EmployeesTab = () => (
    <div className="space-y-6">
      <ErrorAlert />
      
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Employee Management</h2>
        <button
          onClick={() => setShowAddEmployee(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          disabled={loading}
        >
          <Plus className="h-4 w-4" />
          Add Employee
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid gap-6">
          {employees.map((employee) => {
            const pay = calculatePay(employee);
            return (
              <div key={employee.id} className="bg-white rounded-xl shadow-lg p-6">
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
                      onClick={() => handleEditEmployee(employee)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      disabled={loading}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteEmployee(employee.id)}
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
          })}
        </div>
      )}
    </div>
  );

  const PayrollTab = () => (
    <div className="space-y-6">
      <ErrorAlert />
      
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Payroll Details</h2>
        <DatabaseStatus />
      </div>
      
      {loading ? (
        <LoadingSpinner />
      ) : (
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
                    ${getTotalPayroll().toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Database className="h-8 w-8 text-indigo-600" />
                Payroll System
              </h1>
              <p className="text-gray-600">Manage employees and calculate payroll with Supabase</p>
            </div>
            <DatabaseStatus />
          </div>
          
          <nav className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'employees', label: 'Employees' },
              { id: 'payroll', label: 'Payroll' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'employees' && <EmployeesTab />}
        {activeTab === 'payroll' && <PayrollTab />}
      </div>

      {showAddEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold mb-4">
              {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                <input
                  type="text"
                  value={newEmployee.position}
                  onChange={(e) => setNewEmployee({...newEmployee, position: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  value={newEmployee.department}
                  onChange={(e) => setNewEmployee({...newEmployee, department: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate</label>
                  <input
                    type="number"
                    value={newEmployee.hourly_rate}
                    onChange={(e) => setNewEmployee({...newEmployee, hourly_rate: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    disabled={loading}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hours Worked</label>
                  <input
                    type="number"
                    value={newEmployee.hours_worked}
                    onChange={(e) => setNewEmployee({...newEmployee, hours_worked: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Overtime Hours</label>
                  <input
                    type="number"
                    value={newEmployee.overtime_hours}
                    onChange={(e) => setNewEmployee({...newEmployee, overtime_hours: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    disabled={loading}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bonus</label>
                  <input
                    type="number"
                    value={newEmployee.bonus}
                    onChange={(e) => setNewEmployee({...newEmployee, bonus: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    disabled={loading}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deductions</label>
                  <input
                    type="number"
                    value={newEmployee.deductions}
                    onChange={(e) => setNewEmployee({...newEmployee, deductions: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={editingEmployee ? handleUpdateEmployee : handleAddEmployee}
                className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Saving...' : (editingEmployee ? 'Update Employee' : 'Add Employee')}
              </button>
              <button
                onClick={() => {
                  setShowAddEmployee(false);
                  setEditingEmployee(null);
                  resetForm();
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

