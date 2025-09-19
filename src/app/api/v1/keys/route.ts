import { NextRequest, NextResponse } from 'next/server';
import { withCORSAndSecurity, getCORSConfig } from '@/lib/cors';
import { withRateLimit, rateLimitConfigs } from '@/lib/rateLimiter';
import { withMonitoring } from '@/lib/monitoring';
import { withAPIKeyAuth } from '@/lib/apiKeyRotation';
import { validateRequestBody, validationSchemas, createErrorResponse } from '@/lib/validation';
import { apiKeyRotation } from '@/lib/apiKeyRotation';

async function createAPIKeyHandler(req: NextRequest, userId: string, permissions: string[]) {
  try {
    const body = await req.json();
    const validation = validateRequestBody(validationSchemas.apiKey)(req, async (req, data) => {
      const { name, permissions: keyPermissions = [] } = data;

      // Create new API key
      const result = await apiKeyRotation.createAPIKey(userId, name, keyPermissions);

      return NextResponse.json({
        success: true,
        key: {
          id: result.keyId,
          key: result.key, // Only returned once during creation
          name,
          permissions: keyPermissions,
          created_at: new Date().toISOString(),
        },
        message: 'API key created successfully. Store the key securely as it will not be shown again.',
      });
    });

    return validation;
  } catch (error) {
    console.error('Create API key error:', error);
    return createErrorResponse(500, 'Failed to create API key');
  }
}

async function listAPIKeysHandler(req: NextRequest, userId: string, permissions: string[]) {
  try {
    const keys = await apiKeyRotation.getUserAPIKeys(userId);

    // Remove sensitive information
    const sanitizedKeys = keys.map(key => ({
      id: key.id,
      name: key.name,
      permissions: key.permissions,
      last_used: key.last_used,
      expires_at: key.expires_at,
      created_at: key.created_at,
      is_active: key.is_active,
    }));

    return NextResponse.json({
      success: true,
      keys: sanitizedKeys,
      count: sanitizedKeys.length,
    });
  } catch (error) {
    console.error('List API keys error:', error);
    return createErrorResponse(500, 'Failed to retrieve API keys');
  }
}

async function rotateAPIKeysHandler(req: NextRequest, userId: string, permissions: string[]) {
  try {
    const rotatedKeys = await apiKeyRotation.rotateUserAPIKeys(userId);

    return NextResponse.json({
      success: true,
      rotated_keys: rotatedKeys.length,
      message: 'API keys rotated successfully. Old keys are now invalid.',
      new_keys: rotatedKeys.map(key => ({
        key: key.newKey,
        expires_at: key.expiresAt,
      })),
    });
  } catch (error) {
    console.error('Rotate API keys error:', error);
    return createErrorResponse(500, 'Failed to rotate API keys');
  }
}

async function revokeAPIKeyHandler(req: NextRequest, userId: string, permissions: string[]) {
  try {
    const url = new URL(req.url);
    const keyId = url.searchParams.get('id');

    if (!keyId) {
      return createErrorResponse(400, 'API key ID is required');
    }

    const success = await apiKeyRotation.revokeAPIKey(keyId);

    if (!success) {
      return createErrorResponse(404, 'API key not found or already revoked');
    }

    return NextResponse.json({
      success: true,
      message: 'API key revoked successfully',
    });
  } catch (error) {
    console.error('Revoke API key error:', error);
    return createErrorResponse(500, 'Failed to revoke API key');
  }
}

async function getAPIKeyStatsHandler(req: NextRequest, userId: string, permissions: string[]) {
  try {
    const stats = await apiKeyRotation.getAPIKeyStats();

    return NextResponse.json({
      success: true,
      stats: {
        total_keys: stats.totalKeys,
        active_keys: stats.activeKeys,
        expired_keys: stats.expiredKeys,
        expiring_soon: stats.expiringSoon,
        rotation_due: stats.rotationDue,
      },
    });
  } catch (error) {
    console.error('Get API key stats error:', error);
    return createErrorResponse(500, 'Failed to retrieve API key statistics');
  }
}

// Main handler with method routing
async function keysHandler(req: NextRequest, userId: string, permissions: string[]) {
  const method = req.method;
  const url = new URL(req.url);
  const action = url.searchParams.get('action');

  switch (method) {
    case 'POST':
      if (action === 'rotate') {
        return rotateAPIKeysHandler(req, userId, permissions);
      }
      return createAPIKeyHandler(req, userId, permissions);

    case 'GET':
      if (action === 'stats') {
        return getAPIKeyStatsHandler(req, userId, permissions);
      }
      return listAPIKeysHandler(req, userId, permissions);

    case 'DELETE':
      return revokeAPIKeyHandler(req, userId, permissions);

    default:
      return createErrorResponse(405, 'Method not allowed');
  }
}

// Apply middleware stack
export const POST = async (req: NextRequest) => {
  try {
    return await withAPIKeyAuth(async (req: NextRequest, userId: string, permissions: string[]) => {
      return await withRateLimit(req, rateLimitConfigs.api, async (req: NextRequest) => {
        return await keysHandler(req, userId, permissions);
      });
    })(req);
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Request failed',
        message: 'API key authentication failed',
      }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

export const GET = async (req: NextRequest) => {
  try {
    return await withAPIKeyAuth(async (req: NextRequest, userId: string, permissions: string[]) => {
      return await withRateLimit(req, rateLimitConfigs.api, async (req: NextRequest) => {
        return await keysHandler(req, userId, permissions);
      });
    })(req);
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Request failed',
        message: 'API key authentication failed',
      }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

export const DELETE = async (req: NextRequest) => {
  try {
    return await withAPIKeyAuth(async (req: NextRequest, userId: string, permissions: string[]) => {
      return await withRateLimit(req, rateLimitConfigs.api, async (req: NextRequest) => {
        return await keysHandler(req, userId, permissions);
      });
    })(req);
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Request failed',
        message: 'API key authentication failed',
      }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};