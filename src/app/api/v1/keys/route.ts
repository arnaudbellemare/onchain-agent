import { NextRequest, NextResponse } from 'next/server';
import { 
  createAPIKey, 
  validateAndGetAPIKey, 
  listAPIKeys, 
  deleteAPIKey, 
  getAPIKeyData,
  getAPIKeyAnalytics,
  auditAPIKeySecurity,
  checkRateLimit,
  updateAPIKeyUsage as updateSecureAPIKeyUsage
} from '@/lib/secureApiKeys';

// Create a new API key
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, permissions = ['read', 'write'] } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'API key name is required' },
        { status: 400 }
      );
    }

    const { id, key, data } = createAPIKey(name, permissions);

    return NextResponse.json({
      success: true,
      data: {
        id,
        key,
        name: data.name,
        createdAt: data.createdAt,
        permissions: data.permissions,
        rateLimit: data.rateLimit
      },
      message: 'API key created successfully. Save this key securely - it will not be shown again.'
    });

  } catch (error) {
    console.error('API key creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create API key' },
      { status: 500 }
    );
  }
}

// List API keys (without showing the actual keys)
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    const keyId = url.searchParams.get('keyId');
    const timeframe = url.searchParams.get('timeframe') as 'hour' | 'day' | 'week' | 'month' || 'day';

    if (action === 'analytics' && keyId) {
      const analytics = getAPIKeyAnalytics(keyId, timeframe);
      if (!analytics) {
        return NextResponse.json(
          { error: 'API key not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        data: analytics
      });
    }

    if (action === 'audit' && keyId) {
      const audit = auditAPIKeySecurity(keyId);
      if (!audit) {
        return NextResponse.json(
          { error: 'API key not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        data: audit
      });
    }

    const keys = listAPIKeys();

    return NextResponse.json({
      success: true,
      data: {
        keys,
        total: keys.length
      }
    });

  } catch (error) {
    console.error('API keys listing error:', error);
    return NextResponse.json(
      { error: 'Failed to list API keys' },
      { status: 500 }
    );
  }
}

// Delete an API key
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { keyId } = body;

    if (!keyId) {
      return NextResponse.json(
        { error: 'Key ID is required' },
        { status: 400 }
      );
    }

    const success = deleteAPIKey(keyId);
    if (!success) {
      return NextResponse.json(
        { error: 'API key not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'API key deleted successfully'
    });

  } catch (error) {
    console.error('API key deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete API key' },
      { status: 500 }
    );
  }
}

// Validate an API key (used by other endpoints)
export function validateAPIKey(key: string, clientIP?: string, userAgent?: string): any {
  return validateAndGetAPIKey(key, clientIP, userAgent);
}

// Get API key usage stats
export function getAPIKeyUsage(keyId: string): any {
  const data = getAPIKeyData(keyId);
  return data ? data.usage : null;
}

// Update API key usage (called by other endpoints after successful requests)
export function updateAPIKeyUsage(keyId: string, endpoint: string, cost: number, saved: number, provider: string): boolean {
  return updateSecureAPIKeyUsage(keyId, endpoint, cost, saved, provider);
}
