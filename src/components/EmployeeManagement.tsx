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
      if (data.success) {
        setEmployees(data.data.employees);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
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
      if (data.success) {
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
      }
    } catch (error) {
      console.error('Error adding employee:', error);
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
      if (data.success) {
        alert(`Payroll processed successfully! ${data.data.transactionCount} employees paid.`);
        fetchEmployees(); // Refresh the list
      } else {
        alert('Failed to process payroll: ' + data.message);
      }
    } catch (error) {
      console.error('Error processing payroll:', error);
      alert('Error processing payroll');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-light text-white">Employee Management</h2>
          <p className="text-gray-400">Manage employee payroll and payment schedules</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 hover:scale-105"
          >
            Add Employee
          </button>
          <button
            onClick={processPayroll}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 hover:scale-105"
          >
            Process Payroll
          </button>
        </div>
      </div>

      {/* Add Employee Form */}
      {showAddForm && (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-medium text-white mb-4">Add New Employee</h3>
          <form onSubmit={handleAddEmployee} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="john@company.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Wallet Address</label>
                <input
                  type="text"
                  value={newEmployee.walletAddress}
                  onChange={(e) => setNewEmployee({...newEmployee, walletAddress: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Salary (USDC)</label>
                <input
                  type="number"
                  value={newEmployee.salary}
                  onChange={(e) => setNewEmployee({...newEmployee, salary: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="5000"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Payment Schedule</label>
                <select
                  value={newEmployee.paymentSchedule}
                  onChange={(e) => setNewEmployee({...newEmployee, paymentSchedule: e.target.value as 'monthly' | 'biweekly' | 'weekly'})}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="monthly">Monthly</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Department</label>
                <input
                  type="text"
                  value={newEmployee.department}
                  onChange={(e) => setNewEmployee({...newEmployee, department: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Engineering"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                <input
                  type="text"
                  value={newEmployee.role}
                  onChange={(e) => setNewEmployee({...newEmployee, role: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Senior Developer"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
              >
                Add Employee
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Employees List */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h3 className="text-xl font-medium text-white mb-4">Employees ({employees.length})</h3>
        <div className="space-y-4">
          {employees.map((employee) => (
            <div key={employee.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-medium text-white">{employee.name}</h4>
                    <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-sm">
                      {employee.role}
                    </span>
                    <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-sm">
                      {employee.department}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Email:</span>
                      <span className="text-white ml-2">{employee.email}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Wallet:</span>
                      <span className="text-white ml-2 font-mono">
                        {employee.walletAddress.slice(0, 6)}...{employee.walletAddress.slice(-4)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Salary:</span>
                      <span className="text-white ml-2">${employee.salary.toLocaleString()} USDC</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Schedule:</span>
                      <span className="text-white ml-2 capitalize">{employee.paymentSchedule}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Next Payment:</span>
                      <span className="text-white ml-2">{employee.nextPaymentDate.toDateString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Status:</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${
                        employee.status === 'active' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {employee.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
