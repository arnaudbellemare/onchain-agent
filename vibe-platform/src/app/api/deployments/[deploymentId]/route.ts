import { NextRequest, NextResponse } from 'next/server';
import { deploymentStore } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { deploymentId: string } }
) {
  try {
    const { deploymentId } = params;

    const deployment = await deploymentStore.getDeployment(deploymentId);
    
    if (!deployment) {
      return NextResponse.json({
        success: false,
        error: 'Deployment not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      ...deployment
    });

  } catch (error) {
    console.error('Deployment API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch deployment'
    }, { status: 500 });
  }
}
