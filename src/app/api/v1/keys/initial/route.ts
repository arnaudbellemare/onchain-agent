import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit, rateLimitConfigs } from '@/lib/rateLimiter';
import { withMonitoring } from '@/lib/monitoring';
import { validateRequestBody, validationSchemas, createErrorResponse } from '@/lib/validation';
import { apiKeyRotation } from '@/lib/apiKeyRotation';

/**
 * Initial API key generation endpoint - no authentication required
 * This is for users who don't have any API keys yet
 */
async function createInitialAPIKeyHandler(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = validateRequestBody(validationSchemas.apiKey)(req, async (req, data) => {
      const { name, permissions: keyPermissions = [] } = data;

      // For initial key generation, we'll use a default user ID
      // In a real application, you might want to implement user registration here
      const defaultUserId = 'default-user-' + Date.now();
      
      // Create new API key
      const result = await apiKeyRotation.createAPIKey(defaultUserId, name, keyPermissions);

      return NextResponse.json({
        success: true,
        key: {
          id: result.keyId,
          key: result.key, // Only returned once during creation
          name,
          permissions: keyPermissions,
          created_at: new Date().toISOString(),
          user_id: defaultUserId,
        },
        message: 'Initial API key created successfully. Store the key securely as it will not be shown again. Use this key to authenticate future requests.',
        instructions: {
          usage: 'Include this API key in the Authorization header: "Bearer YOUR_API_KEY"',
          example: 'curl -H "Authorization: Bearer YOUR_API_KEY" https://your-domain.com/api/v1/keys',
        },
      });
    });

    return validation;
  } catch (error) {
    console.error('Create initial API key error:', error);
    return createErrorResponse(500, 'Failed to create initial API key');
  }
}

// Apply middleware stack (no authentication required)
export const POST = async (req: NextRequest) => {
  try {
    return await withRateLimit(req, rateLimitConfigs.public, async (req: NextRequest) => {
      return await createInitialAPIKeyHandler(req);
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Request failed',
        message: 'Failed to create initial API key',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
