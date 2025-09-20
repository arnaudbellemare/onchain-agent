import { NextRequest, NextResponse } from 'next/server';
import { simpleApiKeyManager } from '@/lib/simpleApiKeyManager';

/**
 * Simplified API Keys endpoint - uses in-memory storage
 */

// GET - List API keys
export async function GET(req: NextRequest) {
  try {
    const apiKey = req.headers.get('X-API-Key') || req.headers.get('x-api-key');
    
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'API key is required'
      }, { status: 401 });
    }

    // Validate the API key
    const validation = simpleApiKeyManager.validateAPIKey(apiKey);
    if (!validation.valid || !validation.keyData) {
      return NextResponse.json({
        success: false,
        error: 'Invalid API key'
      }, { status: 401 });
    }

    // Get all keys for this user
    const userKeys = simpleApiKeyManager.getUserAPIKeys(validation.keyData.userId);
    
    // Sanitize keys (remove actual key values)
    const sanitizedKeys = userKeys.map(key => ({
      id: key.id,
      name: key.name,
      keyPreview: simpleApiKeyManager.getKeyPreview(key.key),
      permissions: key.permissions,
      createdAt: key.createdAt,
      lastUsed: null, // We don't track this in simple version
      isActive: key.isActive,
      usage: key.usage
    }));

    return NextResponse.json({
      success: true,
      data: {
        keys: sanitizedKeys,
        total: sanitizedKeys.length
      }
    });

  } catch (error) {
    console.error('List API keys error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to list API keys'
    }, { status: 500 });
  }
}

// POST - Create new API key
export async function POST(req: NextRequest) {
  try {
    const apiKey = req.headers.get('X-API-Key') || req.headers.get('x-api-key');
    
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'API key is required'
      }, { status: 401 });
    }

    // Validate the API key
    const validation = simpleApiKeyManager.validateAPIKey(apiKey);
    if (!validation.valid || !validation.keyData) {
      return NextResponse.json({
        success: false,
        error: 'Invalid API key'
      }, { status: 401 });
    }

    const body = await req.json();
    const { name, permissions = ['read', 'write'] } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'API key name is required'
      }, { status: 400 });
    }

    // Create new API key
    const result = simpleApiKeyManager.generateAPIKey(validation.keyData.userId, name, permissions);

    return NextResponse.json({
      success: true,
      key: {
        id: result.keyId,
        key: result.key, // Only returned once during creation
        name,
        permissions,
        createdAt: new Date().toISOString(),
        userId: validation.keyData.userId,
      },
      message: 'API key created successfully. Store the key securely as it will not be shown again.',
    });

  } catch (error) {
    console.error('Create API key error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create API key'
    }, { status: 500 });
  }
}

// DELETE - Delete API key
export async function DELETE(req: NextRequest) {
  try {
    const apiKey = req.headers.get('X-API-Key') || req.headers.get('x-api-key');
    
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'API key is required'
      }, { status: 401 });
    }

    // Validate the API key
    const validation = simpleApiKeyManager.validateAPIKey(apiKey);
    if (!validation.valid || !validation.keyData) {
      return NextResponse.json({
        success: false,
        error: 'Invalid API key'
      }, { status: 401 });
    }

    const body = await req.json();
    const { keyId } = body;

    if (!keyId) {
      return NextResponse.json({
        success: false,
        error: 'Key ID is required'
      }, { status: 400 });
    }

    // Delete the API key
    const deleted = simpleApiKeyManager.deleteAPIKey(keyId, validation.keyData.userId);
    
    if (!deleted) {
      return NextResponse.json({
        success: false,
        error: 'API key not found or access denied'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'API key deleted successfully'
    });

  } catch (error) {
    console.error('Delete API key error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete API key'
    }, { status: 500 });
  }
}
