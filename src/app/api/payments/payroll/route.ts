import { NextRequest, NextResponse } from 'next/server';
import { paymentProcessor } from '@/lib/paymentProcessor';
import { paymentDB } from '@/lib/database';

export async function POST() {
  try {
    console.log('🔄 Processing payroll request...');
    
    // Process payroll for all employees
    const result = await paymentProcessor.processPayroll();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Successfully processed payroll for ${result.transactions.length} employees`,
        data: {
          totalAmount: result.totalAmount,
          transactionCount: result.transactions.length,
          transactions: result.transactions.map(txn => ({
            id: txn.id,
            recipient: txn.recipientAddress,
            amount: txn.amount,
            status: txn.status,
            transactionHash: txn.transactionHash,
            description: txn.description
          }))
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Failed to process payroll',
        error: 'No employees were paid successfully'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('❌ Payroll processing error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const employees = paymentDB.getEmployees();
    const analytics = paymentProcessor.getPaymentAnalytics();
    
    return NextResponse.json({
      success: true,
      data: {
        employees: employees.map(emp => ({
          id: emp.id,
          name: emp.name,
          email: emp.email,
          walletAddress: emp.walletAddress,
          salary: emp.salary,
          paymentSchedule: emp.paymentSchedule,
          nextPaymentDate: emp.nextPaymentDate,
          lastPaymentDate: emp.lastPaymentDate,
          status: emp.status,
          department: emp.department,
          role: emp.role
        })),
        analytics: analytics.employees
      }
    });
  } catch (error) {
    console.error('❌ Error fetching payroll data:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch payroll data',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
