import { NextRequest, NextResponse } from 'next/server';
import { simpleApiKeyManager } from '@/lib/simpleApiKeyManager';

/**
 * Initial API key generation endpoint - no authentication required
 * This is for users who don't have any API keys yet
 */
async function createInitialAPIKeyHandler(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Simple validation for required fields
    if (!body.name || typeof body.name !== 'string') {
      return createErrorResponse(400, 'API key name is required');
    }

    const { name, permissions: keyPermissions = [] } = body;

    // For initial key generation, we'll use a default user ID
    // In a real application, you might want to implement user registration here
    const defaultUserId = 'default-user-' + Date.now();
    
    // Create new API key
    const result = simpleApiKeyManager.generateAPIKey(defaultUserId, name, keyPermissions);
    console.log(`[API Key Generation] Generated key: ${result.key.substring(0, 20)}...`);
    console.log(`[API Key Generation] Key ID: ${result.keyId}`);

    return NextResponse.json({
      success: true,
      key: {
        id: result.keyId,
        key: result.key, // Only returned once during creation
        name,
        permissions: keyPermissions,
        createdAt: new Date().toISOString(),
        userId: defaultUserId,
      },
      message: 'Initial API key created successfully. Store the key securely as it will not be shown again. Use this key to authenticate future requests.',
      instructions: {
        usage: 'Include this API key in the Authorization header: "Bearer YOUR_API_KEY"',
        example: 'curl -H "Authorization: Bearer YOUR_API_KEY" https://your-domain.com/api/v1/keys',
      },
    });
  } catch (error) {
    console.error('Create initial API key error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create initial API key: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}

// Simplified POST handler without middleware
export const POST = async (req: NextRequest) => {
  try {
    return await createInitialAPIKeyHandler(req);
  } catch (error) {
    console.error('POST handler error:', error);
    return new Response(
      JSON.stringify({
        error: 'Request failed',
        message: 'Failed to create initial API key',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
