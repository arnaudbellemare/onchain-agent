import { NextRequest, NextResponse } from 'next/server';
import { paymentProcessor } from '@/lib/paymentProcessor';
import { paymentDB } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const days = parseInt(url.searchParams.get('days') || '90');
    
    const analytics = paymentProcessor.getPaymentAnalytics();
    const cashFlowForecast = paymentDB.getCashFlowForecast(days);
    
    // Calculate additional metrics
    const totalMonthlyPayroll = paymentDB.getTotalMonthlyPayroll();
    const totalPendingInvoices = paymentDB.getTotalPendingInvoices();
    const totalAPICosts = paymentDB.getTotalAPICostsThisMonth();
    
    // Calculate cost savings from early payment discounts
    const vendors = paymentDB.getVendors();
    const pendingInvoices = paymentDB.getPendingInvoices();
    let potentialSavings = 0;
    
    pendingInvoices.forEach(invoice => {
      const vendor = vendors.find(v => v.id === invoice.vendorId);
      if (vendor) {
        potentialSavings += invoice.amount * (vendor.earlyPaymentDiscount / 100);
      }
    });
    
    // Calculate API cost optimization opportunities
    const apiCosts = paymentDB.getAPICosts();
    // const x402EnabledAPIs = apiCosts.filter(api => api.x402Enabled);
    const traditionalAPIs = apiCosts.filter(api => !api.x402Enabled);
    
    const x402Savings = traditionalAPIs.reduce((total, api) => {
      // Assume x402 could save 30% on API costs through better pricing
      return total + (api.totalCostThisMonth * 0.3);
    }, 0);
    
    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalEmployees: analytics.employees.total,
          activeEmployees: analytics.employees.active,
          totalVendors: analytics.invoices.total,
          pendingInvoices: analytics.invoices.pending,
          totalAPIServices: analytics.apiCosts.total,
          x402EnabledAPIs: analytics.apiCosts.x402Enabled
        },
        financial: {
          totalMonthlyPayroll: totalMonthlyPayroll,
          totalPendingInvoices: totalPendingInvoices,
          totalAPICostsThisMonth: totalAPICosts,
          potentialSavings: potentialSavings,
          x402OptimizationSavings: x402Savings,
          totalMonthlyOutflow: totalMonthlyPayroll + totalPendingInvoices + totalAPICosts
        },
        transactions: {
          total: analytics.transactions.total,
          completed: analytics.transactions.completed,
          pending: analytics.transactions.pending,
          failed: analytics.transactions.failed,
          successRate: analytics.transactions.total > 0 ? 
            (analytics.transactions.completed / analytics.transactions.total * 100).toFixed(2) : 0
        },
        cashFlowForecast: cashFlowForecast.map(day => ({
          date: day.date.toISOString().split('T')[0],
          outflow: day.outflow,
          inflow: day.inflow,
          netFlow: day.inflow - day.outflow
        })),
        recommendations: [
          {
            type: 'cost_optimization',
            title: 'Enable x402 for Traditional APIs',
            description: `Switch ${traditionalAPIs.length} traditional APIs to x402 protocol to save $${x402Savings.toFixed(2)} per month`,
            impact: 'high',
            effort: 'medium'
          },
          {
            type: 'cash_flow',
            title: 'Optimize Payment Timing',
            description: `Take advantage of early payment discounts to save $${potentialSavings.toFixed(2)} on pending invoices`,
            impact: 'medium',
            effort: 'low'
          },
          {
            type: 'automation',
            title: 'Increase Payroll Automation',
            description: `${analytics.employees.active - analytics.employees.active} employees could benefit from automated payroll`,
            impact: 'high',
            effort: 'low'
          }
        ]
      }
    });
  } catch (error) {
    console.error('❌ Error fetching analytics:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
