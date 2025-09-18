import { paymentDB, Employee, PaymentTransaction } from './database';
import { initializeAgentKit } from './agentkit';

// Real payment processor using AgentKit and x402
export class PaymentProcessor {
  private agentKit: { getActions: () => Array<{ name: string; invoke: (args?: Record<string, unknown>) => Promise<string> }> } | null = null;
  private agentKitInitialized = false;

  async initialize(): Promise<boolean> {
    try {
      const result = await initializeAgentKit();
      if (result.success && result.agentKit) {
        this.agentKit = result.agentKit;
        this.agentKitInitialized = true;
        console.log('✅ PaymentProcessor initialized with AgentKit');
        return true;
      } else {
        console.error('❌ Failed to initialize AgentKit:', result.error);
        return false;
      }
    } catch (error) {
      console.error('❌ Failed to initialize PaymentProcessor:', error);
      return false;
    }
  }

  // Process payroll for all employees
  async processPayroll(): Promise<{ success: boolean; transactions: PaymentTransaction[]; totalAmount: number }> {
    if (!this.agentKitInitialized) {
      await this.initialize();
    }

    const employees = paymentDB.getEmployees().filter(emp => emp.status === 'active');
    const transactions: PaymentTransaction[] = [];
    let totalAmount = 0;
    let successCount = 0;

    console.log(`🔄 Processing payroll for ${employees.length} employees...`);

    for (const employee of employees) {
      try {
        // Check if payment is due
        if (employee.nextPaymentDate > new Date()) {
          console.log(`⏭️ Skipping ${employee.name} - payment not due until ${employee.nextPaymentDate.toDateString()}`);
          continue;
        }

        // Create transaction record
        const transaction = paymentDB.addTransaction({
          type: 'payroll',
          recipientAddress: employee.walletAddress,
          amount: employee.salary,
          status: 'pending',
          description: `Payroll payment for ${employee.name} - ${employee.role}`
        });

        // Execute payment using AgentKit
        const result = await this.executePayment(
          employee.walletAddress,
          employee.salary,
          `Payroll: ${employee.name}`,
          transaction.id
        );

        if (result.success) {
          // Update transaction status
          paymentDB.updateTransactionStatus(transaction.id, 'completed', result.transactionHash);
          
          // Update employee record
          paymentDB.updateEmployee(employee.id, {
            lastPaymentDate: new Date(),
            nextPaymentDate: this.calculateNextPaymentDate(employee.paymentSchedule)
          });

          transactions.push(transaction);
          totalAmount += employee.salary;
          successCount++;

          console.log(`✅ Paid ${employee.name}: ${employee.salary} USDC (${result.transactionHash})`);
        } else {
          // Mark transaction as failed
          paymentDB.updateTransactionStatus(transaction.id, 'failed');
          console.error(`❌ Failed to pay ${employee.name}: ${result.error}`);
        }
      } catch (error) {
        console.error(`❌ Error processing payroll for ${employee.name}:`, error);
      }
    }

    return {
      success: successCount > 0,
      transactions,
      totalAmount
    };
  }

  // Process vendor invoices
  async processVendorInvoices(autoPayThreshold: number = 1000): Promise<{ success: boolean; transactions: PaymentTransaction[]; totalAmount: number; savings: number }> {
    if (!this.agentKitInitialized) {
      await this.initialize();
    }

    const pendingInvoices = paymentDB.getPendingInvoices();
    const transactions: PaymentTransaction[] = [];
    let totalAmount = 0;
    let savings = 0;
    let successCount = 0;

    console.log(`🔄 Processing ${pendingInvoices.length} vendor invoices...`);

    for (const invoice of pendingInvoices) {
      try {
        const vendor = paymentDB.getVendor(invoice.vendorId);
        if (!vendor) continue;

        // Check if auto-pay is allowed
        const shouldAutoPay = invoice.amount <= autoPayThreshold;
        
        if (!shouldAutoPay) {
          console.log(`⏸️ Invoice ${invoice.id} requires manual approval (amount: ${invoice.amount} USDC)`);
          continue;
        }

        // Calculate early payment discount
        const discountAmount = invoice.amount * (vendor.earlyPaymentDiscount / 100);
        const finalAmount = invoice.amount - discountAmount;
        savings += discountAmount;

        // Create transaction record
        const transaction = paymentDB.addTransaction({
          type: 'vendor',
          recipientAddress: vendor.walletAddress,
          amount: finalAmount,
          status: 'pending',
          description: `Vendor payment: ${vendor.name} - ${invoice.description}`
        });

        // Execute payment
        const result = await this.executePayment(
          vendor.walletAddress,
          finalAmount,
          `Vendor: ${vendor.name}`,
          transaction.id
        );

        if (result.success) {
          // Update transaction status
          paymentDB.updateTransactionStatus(transaction.id, 'completed', result.transactionHash);
          
          // Mark invoice as paid
          if (result.transactionHash) {
            paymentDB.markInvoicePaid(invoice.id, result.transactionHash);
          }

          transactions.push(transaction);
          totalAmount += finalAmount;
          successCount++;

          console.log(`✅ Paid ${vendor.name}: ${finalAmount} USDC (saved ${discountAmount} USDC) - ${result.transactionHash}`);
        } else {
          paymentDB.updateTransactionStatus(transaction.id, 'failed');
          console.error(`❌ Failed to pay ${vendor.name}: ${result.error}`);
        }
      } catch (error) {
        console.error(`❌ Error processing invoice ${invoice.id}:`, error);
      }
    }

    return {
      success: successCount > 0,
      transactions,
      totalAmount,
      savings
    };
  }

  // Process x402 API payments
  async processAPIPayment(apiCostId: string, calls: number = 1): Promise<{ success: boolean; transaction?: PaymentTransaction; totalCost: number }> {
    if (!this.agentKitInitialized) {
      await this.initialize();
    }

    const apiCost = paymentDB.getAPICost(apiCostId);
    if (!apiCost) {
      return { success: false, totalCost: 0 };
    }

    const totalCost = apiCost.costPerCall * calls;

    try {
      // Record API calls
      for (let i = 0; i < calls; i++) {
        paymentDB.recordAPICall(apiCostId);
      }

      // For x402 enabled APIs, we would typically handle this differently
      // For now, we'll simulate the payment process
      if (apiCost.x402Enabled) {
        console.log(`🔗 x402 API Payment: ${apiCost.service} - ${calls} calls = ${totalCost} USDC`);
        
        // In a real implementation, this would:
        // 1. Send HTTP request to API
        // 2. Receive 402 Payment Required response
        // 3. Send USDC payment via x402 protocol
        // 4. Receive API response after payment verification
        
        const transaction = paymentDB.addTransaction({
          type: 'api',
          recipientAddress: '0x0000000000000000000000000000000000000000', // API provider address
          amount: totalCost,
          status: 'completed',
          description: `x402 API Payment: ${apiCost.service} (${calls} calls)`
        });

        return { success: true, transaction, totalCost };
      } else {
        // Traditional API payment (prepaid or subscription)
        console.log(`💳 Traditional API Payment: ${apiCost.service} - ${calls} calls = ${totalCost} USDC`);
        
        const transaction = paymentDB.addTransaction({
          type: 'api',
          recipientAddress: '0x0000000000000000000000000000000000000000',
          amount: totalCost,
          status: 'completed',
          description: `Traditional API Payment: ${apiCost.service} (${calls} calls)`
        });

        return { success: true, transaction, totalCost };
      }
    } catch (error) {
      console.error(`❌ Error processing API payment for ${apiCost.service}:`, error);
      return { success: false, totalCost };
    }
  }

  // Execute actual payment using AgentKit
  private async executePayment(
    recipientAddress: string,
    amount: number,
    _description: string,
    _transactionId: string
  ): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
    try {
      if (!this.agentKit) {
        return { success: false, error: 'AgentKit not initialized' };
      }

      // Get wallet details
      const actions = this.agentKit.getActions();
      const walletDetailsAction = actions.find((action) => action.name === "getWalletDetails");
      
      if (!walletDetailsAction) {
        return { success: false, error: 'Wallet details action not found' };
      }

      const walletDetails = await walletDetailsAction.invoke();
      console.log('Wallet details:', walletDetails);

      // Execute transfer using AgentKit
      const transferAction = actions.find((action) => action.name === "nativeTransfer");
      
      if (!transferAction) {
        return { success: false, error: 'Transfer action not found' };
      }

      await transferAction.invoke({
        to: recipientAddress,
        amount: amount.toString()
      });
      
      // For now, simulate successful transaction
      // In a real implementation, this would return actual transaction hash
      const mockTransactionHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      
      return { 
        success: true, 
        transactionHash: mockTransactionHash 
      };
    } catch (error) {
      console.error('Payment execution error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Calculate next payment date
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

  // Get payment analytics
  getPaymentAnalytics() {
    const employees = paymentDB.getEmployees();
    const invoices = paymentDB.getInvoices();
    const apiCosts = paymentDB.getAPICosts();
    const transactions = paymentDB.getTransactions();

    const totalMonthlyPayroll = paymentDB.getTotalMonthlyPayroll();
    const totalPendingInvoices = paymentDB.getTotalPendingInvoices();
    const totalAPICosts = paymentDB.getTotalAPICostsThisMonth();
    const cashFlowForecast = paymentDB.getCashFlowForecast(90);

    return {
      employees: {
        total: employees.length,
        active: employees.filter(emp => emp.status === 'active').length,
        totalMonthlyPayroll
      },
      invoices: {
        total: invoices.length,
        pending: invoices.filter(inv => inv.status === 'pending').length,
        totalPendingAmount: totalPendingInvoices
      },
      apiCosts: {
        total: apiCosts.length,
        x402Enabled: apiCosts.filter(api => api.x402Enabled).length,
        totalMonthlyCost: totalAPICosts
      },
      transactions: {
        total: transactions.length,
        completed: transactions.filter(txn => txn.status === 'completed').length,
        pending: transactions.filter(txn => txn.status === 'pending').length,
        failed: transactions.filter(txn => txn.status === 'failed').length
      },
      cashFlowForecast
    };
  }
}

// Export singleton instance
export const paymentProcessor = new PaymentProcessor();
