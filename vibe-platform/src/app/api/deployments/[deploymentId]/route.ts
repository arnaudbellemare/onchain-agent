import { NextRequest, NextResponse } from 'next/server';

// Global deployment store (in production, use a database)
declare global {
  var deploymentStore: Map<string, any> | undefined;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { deploymentId: string } }
) {
  try {
    const { deploymentId } = params;

    if (!globalThis.deploymentStore) {
      return NextResponse.json({
        success: false,
        error: 'Deployment not found'
      }, { status: 404 });
    }

    const deployment = globalThis.deploymentStore.get(deploymentId);
    
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
