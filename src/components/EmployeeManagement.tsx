"use client";

import { useState, useEffect } from 'react';
import { Employee } from '@/lib/database';

interface EmployeeManagementProps {
  onEmployeeAdded?: (employee: Employee) => void;
}

export default function EmployeeManagement({ onEmployeeAdded }: EmployeeManagementProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    walletAddress: '',
    salary: '',
    paymentSchedule: 'monthly' as 'monthly' | 'biweekly' | 'weekly',
    department: '',
    role: ''
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/payments/payroll');
      const data = await response.json();
      if (data.success && data.data && data.data.employees) {
        setEmployees(data.data.employees);
      } else {
        console.warn('No employee data received:', data);
        setEmployees([]);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmployees([]);
    }
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/payments/payroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newEmployee,
          salary: parseFloat(newEmployee.salary)
        }),
      });

      const data = await response.json();
      if (data.success && data.data && data.data.employee) {
        setEmployees([...employees, data.data.employee]);
        setNewEmployee({
          name: '',
          email: '',
          walletAddress: '',
          salary: '',
          paymentSchedule: 'monthly',
          department: '',
          role: ''
        });
        setShowAddForm(false);
        onEmployeeAdded?.(data.data.employee);
      } else {
        console.error('Failed to add employee:', data);
        alert('Failed to add employee. Please try again.');
      }
    } catch (error) {
      console.error('Error adding employee:', error);
      alert('Error adding employee. Please try again.');
    }
  };

  const processPayroll = async () => {
    try {
      const response = await fetch('/api/payments/payroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success && data.data) {
        alert(`Payroll processed successfully! ${data.data.transactionCount || 0} employees paid.`);
        fetchEmployees(); // Refresh the list
      } else {
        alert('Failed to process payroll: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error processing payroll:', error);
      alert('Error processing payroll. Please try again.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Employees</h1>
          <p className="text-gray-700">Manage your team and automate payroll</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-900 px-4 py-2 rounded-lg font-medium transition-all duration-200 border border-gray-300"
          >
            Add Employee
          </button>
          <button
            onClick={processPayroll}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
          >
            Process Payroll
          </button>
        </div>
      </div>

      {/* Add Employee Form */}
      {showAddForm && (
        <div className="bg-white border border-gray-200 rounded-2xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Add Employee</h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              ✕
            </button>
          </div>
          <form onSubmit={handleAddEmployee} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm text-gray-700 font-medium">Full Name</label>
                <input
                  type="text"
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-700 font-medium">Email</label>
                <input
                  type="email"
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                  placeholder="john@company.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-700 font-medium">Wallet Address</label>
                <input
                  type="text"
                  value={newEmployee.walletAddress}
                  onChange={(e) => setNewEmployee({...newEmployee, walletAddress: e.target.value})}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors font-mono text-sm"
                  placeholder="0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-700 font-medium">Salary (USDC)</label>
                <input
                  type="number"
                  value={newEmployee.salary}
                  onChange={(e) => setNewEmployee({...newEmployee, salary: e.target.value})}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                  placeholder="5000"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-700 font-medium">Payment Schedule</label>
                <select
                  value={newEmployee.paymentSchedule}
                  onChange={(e) => setNewEmployee({...newEmployee, paymentSchedule: e.target.value as 'monthly' | 'biweekly' | 'weekly'})}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                >
                  <option value="monthly">Monthly</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-700 font-medium">Department</label>
                <input
                  type="text"
                  value={newEmployee.department}
                  onChange={(e) => setNewEmployee({...newEmployee, department: e.target.value})}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                  placeholder="Engineering"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-700 font-medium">Role</label>
                <input
                  type="text"
                  value={newEmployee.role}
                  onChange={(e) => setNewEmployee({...newEmployee, role: e.target.value})}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                  placeholder="Senior Developer"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
              >
                Add Employee
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Employees List */}
      <div className="bg-white border border-gray-200 rounded-2xl p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Team ({employees.length})</h3>
          <div className="text-sm text-gray-700">
            Total Monthly Payroll: ${employees.reduce((sum, emp) => sum + (emp.salary || 0), 0).toLocaleString()} USDC
          </div>
        </div>
        
        {!employees || employees.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-700 mb-4">No employees added yet</div>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-900 px-4 py-2 rounded-lg font-medium transition-all duration-200 border border-gray-300"
            >
              Add Your First Employee
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {employees.map((employee) => {
              if (!employee || !employee.id) return null;
              
              return (
                <div key={employee.id} className="bg-gray-50 border border-gray-200 rounded-xl p-6 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-lg">
                          {employee.name ? employee.name.split(' ').map(n => n[0]).join('').toUpperCase() : '??'}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{employee.name || 'Unknown'}</h4>
                        <div className="flex items-center space-x-3 text-sm text-gray-700">
                          <span>{employee.role || 'No role'}</span>
                          <span>•</span>
                          <span>{employee.department || 'No department'}</span>
                          <span>•</span>
                          <span className="font-mono">
                            {employee.walletAddress ? 
                              `${employee.walletAddress.slice(0, 6)}...${employee.walletAddress.slice(-4)}` : 
                              'No wallet'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">
                        ${employee.salary ? employee.salary.toLocaleString() : '0'} USDC
                      </div>
                      <div className="text-sm text-gray-700 capitalize">
                        {employee.paymentSchedule || 'monthly'}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <div className="text-gray-700">
                        Next payment: {employee.nextPaymentDate ? employee.nextPaymentDate.toDateString() : 'Not set'}
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          employee.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <span className="text-gray-700 capitalize">{employee.status || 'unknown'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
