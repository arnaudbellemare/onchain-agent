import { NextRequest, NextResponse } from 'next/server';
import { paymentProcessor } from '@/lib/paymentProcessor';
import { paymentDB } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { autoPayThreshold = 1000 } = body;
    
    console.log(`🔄 Processing vendor invoices with auto-pay threshold: ${autoPayThreshold} USDC...`);
    
    // Process vendor invoices
    const result = await paymentProcessor.processVendorInvoices(autoPayThreshold);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Successfully processed ${result.transactions.length} vendor payments`,
        data: {
          totalAmount: result.totalAmount,
          savings: result.savings,
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
        message: 'Failed to process vendor payments',
        error: 'No invoices were paid successfully'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('❌ Vendor payment processing error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const vendors = paymentDB.getVendors();
    const invoices = paymentDB.getInvoices();
    const analytics = paymentProcessor.getPaymentAnalytics();
    
    return NextResponse.json({
      success: true,
      data: {
        vendors: vendors.map(vendor => ({
          id: vendor.id,
          name: vendor.name,
          email: vendor.email,
          walletAddress: vendor.walletAddress,
          paymentTerms: vendor.paymentTerms,
          earlyPaymentDiscount: vendor.earlyPaymentDiscount,
          totalOwed: vendor.totalOwed,
          status: vendor.status
        })),
        invoices: invoices.map(invoice => ({
          id: invoice.id,
          vendorId: invoice.vendorId,
          amount: invoice.amount,
          dueDate: invoice.dueDate,
          invoiceDate: invoice.invoiceDate,
          description: invoice.description,
          status: invoice.status,
          paymentMethod: invoice.paymentMethod,
          paidDate: invoice.paidDate,
          transactionHash: invoice.transactionHash
        })),
        analytics: analytics.invoices
      }
    });
  } catch (error) {
    console.error('❌ Error fetching vendor data:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch vendor data',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
