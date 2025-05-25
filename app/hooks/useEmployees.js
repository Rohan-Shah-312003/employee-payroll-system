import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const useEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(true);
  const [error, setError] = useState(null);

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

  const addEmployee = async (employeeData) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('employees')
        .insert([employeeData])
        .select();

      if (error) throw error;

      setEmployees([...employees, data[0]]);
      return { success: true, data: data[0] };
    } catch (err) {
      console.error('Error adding employee:', err);
      setError('Failed to add employee to database');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateEmployee = async (id, employeeData) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('employees')
        .update(employeeData)
        .eq('id', id)
        .select();

      if (error) throw error;

      setEmployees(employees.map(emp => 
        emp.id === id ? data[0] : emp
      ));
      return { success: true, data: data[0] };
    } catch (err) {
      console.error('Error updating employee:', err);
      setError('Failed to update employee in database');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const deleteEmployee = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setEmployees(employees.filter(emp => emp.id !== id));
      return { success: true };
    } catch (err) {
      console.error('Error deleting employee:', err);
      setError('Failed to delete employee from database');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();

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
          loadEmployees();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    employees,
    loading,
    connected,
    error,
    setError,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    loadEmployees
  };
};
