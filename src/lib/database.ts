// Real payment management database
export interface Employee {
  id: string;
  name: string;
  email: string;
  walletAddress: string;
  salary: number; // in USDC
  paymentSchedule: 'monthly' | 'biweekly' | 'weekly';
  lastPaymentDate?: Date;
  nextPaymentDate: Date;
  status: 'active' | 'inactive' | 'pending';
  department: string;
  role: string;
}

export interface Vendor {
  id: string;
  name: string;
  walletAddress: string;
  email: string;
  paymentTerms: number; // days
  earlyPaymentDiscount: number; // percentage
  totalOwed: number; // in USDC
  lastPaymentDate?: Date;
  status: 'active' | 'inactive';
}

export interface Invoice {
  id: string;
  vendorId: string;
  amount: number; // in USDC
  dueDate: Date;
  invoiceDate: Date;
  description: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  paymentMethod?: 'ACH' | 'wire' | 'USDC' | 'ETH';
  paidDate?: Date;
  transactionHash?: string;
}

export interface APICost {
  id: string;
  service: string;
  endpoint: string;
  costPerCall: number; // in USDC
  callsThisMonth: number;
  totalCostThisMonth: number;
  lastCallDate?: Date;
  x402Enabled: boolean;
}

export interface PaymentTransaction {
  id: string;
  type: 'payroll' | 'vendor' | 'api' | 'expense';
  recipientAddress: string;
  amount: number; // in USDC
  status: 'pending' | 'completed' | 'failed';
  transactionHash?: string;
  gasUsed?: number;
  gasPrice?: number;
  timestamp: Date;
  description: string;
}

// In-memory database (replace with real database in production)
class PaymentDatabase {
  private employees: Employee[] = [];
  private vendors: Vendor[] = [];
  private invoices: Invoice[] = [];
  private apiCosts: APICost[] = [];
  private transactions: PaymentTransaction[] = [];

  // Employee Management
  addEmployee(employee: Omit<Employee, 'id' | 'nextPaymentDate'>): Employee {
    const id = `emp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const nextPaymentDate = this.calculateNextPaymentDate(employee.paymentSchedule);
    
    const newEmployee: Employee = {
      ...employee,
      id,
      nextPaymentDate,
      status: 'active'
    };
    
    this.employees.push(newEmployee);
    return newEmployee;
  }

  getEmployees(): Employee[] {
    return this.employees;
  }

  getEmployee(id: string): Employee | undefined {
    return this.employees.find(emp => emp.id === id);
  }

  updateEmployee(id: string, updates: Partial<Employee>): Employee | null {
    const index = this.employees.findIndex(emp => emp.id === id);
    if (index === -1) return null;
    
    this.employees[index] = { ...this.employees[index], ...updates };
    return this.employees[index];
  }

  // Vendor Management
  addVendor(vendor: Omit<Vendor, 'id'>): Vendor {
    const id = `ven_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newVendor: Vendor = {
      ...vendor,
      id,
      status: 'active'
    };
    
    this.vendors.push(newVendor);
    return newVendor;
  }

  getVendors(): Vendor[] {
    return this.vendors;
  }

  getVendor(id: string): Vendor | undefined {
    return this.vendors.find(ven => ven.id === id);
  }

  // Invoice Management
  addInvoice(invoice: Omit<Invoice, 'id'>): Invoice {
    const id = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newInvoice: Invoice = {
      ...invoice,
      id,
      status: 'pending'
    };
    
    this.invoices.push(newInvoice);
    return newInvoice;
  }

  getInvoices(): Invoice[] {
    return this.invoices;
  }

  getPendingInvoices(): Invoice[] {
    return this.invoices.filter(inv => inv.status === 'pending');
  }

  markInvoicePaid(invoiceId: string, transactionHash: string): Invoice | null {
    const invoice = this.invoices.find(inv => inv.id === invoiceId);
    if (!invoice) return null;
    
    invoice.status = 'paid';
    invoice.paidDate = new Date();
    invoice.transactionHash = transactionHash;
    
    return invoice;
  }

  // API Cost Management
  addAPICost(apiCost: Omit<APICost, 'id' | 'callsThisMonth' | 'totalCostThisMonth'>): APICost {
    const id = `api_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newAPICost: APICost = {
      ...apiCost,
      id,
      callsThisMonth: 0,
      totalCostThisMonth: 0
    };
    
    this.apiCosts.push(newAPICost);
    return newAPICost;
  }

  getAPICosts(): APICost[] {
    return this.apiCosts;
  }

  getAPICost(id: string): APICost | undefined {
    return this.apiCosts.find(api => api.id === id);
  }

  recordAPICall(apiCostId: string): APICost | null {
    const apiCost = this.apiCosts.find(api => api.id === apiCostId);
    if (!apiCost) return null;
    
    apiCost.callsThisMonth++;
    apiCost.totalCostThisMonth += apiCost.costPerCall;
    apiCost.lastCallDate = new Date();
    
    return apiCost;
  }

  // Transaction Management
  addTransaction(transaction: Omit<PaymentTransaction, 'id' | 'timestamp'>): PaymentTransaction {
    const id = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newTransaction: PaymentTransaction = {
      ...transaction,
      id,
      timestamp: new Date()
    };
    
    this.transactions.push(newTransaction);
    return newTransaction;
  }

  getTransactions(): PaymentTransaction[] {
    return this.transactions;
  }

  updateTransactionStatus(id: string, status: PaymentTransaction['status'], transactionHash?: string): PaymentTransaction | null {
    const transaction = this.transactions.find(txn => txn.id === id);
    if (!transaction) return null;
    
    transaction.status = status;
    if (transactionHash) {
      transaction.transactionHash = transactionHash;
    }
    
    return transaction;
  }

  // Utility Methods
  private calculateNextPaymentDate(schedule: Employee['paymentSchedule']): Date {
    const now = new Date();
    const nextPayment = new Date(now);
    
    switch (schedule) {
      case 'weekly':
        nextPayment.setDate(now.getDate() + 7);
        break;
      case 'biweekly':
        nextPayment.setDate(now.getDate() + 14);
        break;
      case 'monthly':
        nextPayment.setMonth(now.getMonth() + 1);
        break;
    }
    
    return nextPayment;
  }

  // Analytics
  getTotalMonthlyPayroll(): number {
    return this.employees
      .filter(emp => emp.status === 'active')
      .reduce((total, emp) => {
        const multiplier = emp.paymentSchedule === 'weekly' ? 4.33 : 
                          emp.paymentSchedule === 'biweekly' ? 2.17 : 1;
        return total + (emp.salary * multiplier);
      }, 0);
  }

  getTotalPendingInvoices(): number {
    return this.invoices
      .filter(inv => inv.status === 'pending')
      .reduce((total, inv) => total + inv.amount, 0);
  }

  getTotalAPICostsThisMonth(): number {
    return this.apiCosts.reduce((total, api) => total + api.totalCostThisMonth, 0);
  }

  getCashFlowForecast(days: number): { date: Date; outflow: number; inflow: number }[] {
    const forecast = [];
    const today = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      let outflow = 0;
      const inflow = 0;
      
      // Calculate payroll outflows
      this.employees.forEach(emp => {
        if (emp.nextPaymentDate.toDateString() === date.toDateString()) {
          outflow += emp.salary;
        }
      });
      
      // Calculate invoice due dates
      this.invoices.forEach(inv => {
        if (inv.dueDate.toDateString() === date.toDateString() && inv.status === 'pending') {
          outflow += inv.amount;
        }
      });
      
      forecast.push({ date, outflow, inflow });
    }
    
    return forecast;
  }
}

// Export singleton instance
export const paymentDB = new PaymentDatabase();

// Initialize with sample data
export function initializeSampleData() {
  // Sample employees
  paymentDB.addEmployee({
    name: 'Alice Johnson',
    email: 'alice@company.com',
    walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    salary: 5000, // $5000 USDC
    paymentSchedule: 'monthly',
    department: 'Engineering',
    role: 'Senior Developer',
    status: 'active'
  });

  paymentDB.addEmployee({
    name: 'Bob Smith',
    email: 'bob@company.com',
    walletAddress: '0x8ba1f109551bD432803012645Hac136c',
    salary: 4500, // $4500 USDC
    paymentSchedule: 'biweekly',
    department: 'Marketing',
    role: 'Marketing Manager',
    status: 'active'
  });

  paymentDB.addEmployee({
    name: 'Carol Davis',
    email: 'carol@company.com',
    walletAddress: '0x1234567890123456789012345678901234567890',
    salary: 6000, // $6000 USDC
    paymentSchedule: 'monthly',
    department: 'Finance',
    role: 'CFO',
    status: 'active'
  });

  // Sample vendors
  paymentDB.addVendor({
    name: 'Cloud Services Inc',
    email: 'billing@cloudservices.com',
    walletAddress: '0x9876543210987654321098765432109876543210',
    paymentTerms: 30,
    earlyPaymentDiscount: 2, // 2% discount
    totalOwed: 0,
    status: 'active'
  });

  paymentDB.addVendor({
    name: 'Office Supplies Co',
    email: 'orders@officesupplies.com',
    walletAddress: '0x1111222233334444555566667777888899990000',
    paymentTerms: 15,
    earlyPaymentDiscount: 1, // 1% discount
    totalOwed: 0,
    status: 'active'
  });

  // Sample invoices
  const cloudVendor = paymentDB.getVendors()[0];
  const officeVendor = paymentDB.getVendors()[1];

  if (cloudVendor) {
    paymentDB.addInvoice({
      vendorId: cloudVendor.id,
      amount: 2500, // $2500 USDC
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      invoiceDate: new Date(),
      description: 'Monthly cloud infrastructure services',
      paymentMethod: 'USDC',
      status: 'pending'
    });
  }

  if (officeVendor) {
    paymentDB.addInvoice({
      vendorId: officeVendor.id,
      amount: 800, // $800 USDC
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      invoiceDate: new Date(),
      description: 'Office supplies and equipment',
      paymentMethod: 'USDC',
      status: 'pending'
    });
  }

  // Sample API costs
  paymentDB.addAPICost({
    service: 'OpenAI GPT-4',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    costPerCall: 0.001, // $0.001 USDC per call
    x402Enabled: true
  });

  paymentDB.addAPICost({
    service: 'Weather API',
    endpoint: 'https://api.weather.com/v1/current',
    costPerCall: 0.0005, // $0.0005 USDC per call
    x402Enabled: true
  });

  paymentDB.addAPICost({
    service: 'Data Analytics API',
    endpoint: 'https://api.analytics.com/v1/insights',
    costPerCall: 0.002, // $0.002 USDC per call
    x402Enabled: false
  });
}
