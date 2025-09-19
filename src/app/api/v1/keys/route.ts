import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory storage for demo purposes
// In production, this would use a proper database
const apiKeys = new Map<string, {
  key: string;
  name: string;
  createdAt: string;
  lastUsed: string | null;
  usage: {
    calls: number;
    totalCost: number;
    totalSaved: number;
  };
  permissions: string[];
}>();

// Generate a secure API key
function generateAPIKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'oa_'; // onchain-agent prefix
  
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

// Validate API key format
function validateAPIKeyFormat(key: string): boolean {
  return key.startsWith('oa_') && key.length === 35;
}

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

    const apiKey = generateAPIKey();
    const keyId = Date.now().toString();

    apiKeys.set(keyId, {
      key: apiKey,
      name,
      createdAt: new Date().toISOString(),
      lastUsed: null,
      usage: {
        calls: 0,
        totalCost: 0,
        totalSaved: 0
      },
      permissions
    });

    return NextResponse.json({
      success: true,
      data: {
        id: keyId,
        key: apiKey,
        name,
        createdAt: new Date().toISOString(),
        permissions
      },
      message: 'API key created successfully. Save this key securely - it will not be shown again.'
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create API key' },
      { status: 500 }
    );
  }
}

// List API keys (without showing the actual keys)
export async function GET(req: NextRequest) {
  try {
    const keys = Array.from(apiKeys.entries()).map(([id, data]) => ({
      id,
      name: data.name,
      createdAt: data.createdAt,
      lastUsed: data.lastUsed,
      usage: data.usage,
      permissions: data.permissions,
      keyPreview: data.key.substring(0, 8) + '...' + data.key.substring(data.key.length - 4)
    }));

    return NextResponse.json({
      success: true,
      data: {
        keys,
        total: keys.length
      }
    });

  } catch (error) {
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

    if (!apiKeys.has(keyId)) {
      return NextResponse.json(
        { error: 'API key not found' },
        { status: 404 }
      );
    }

    apiKeys.delete(keyId);

    return NextResponse.json({
      success: true,
      message: 'API key deleted successfully'
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete API key' },
      { status: 500 }
    );
  }
}

// Validate an API key (used by other endpoints)
export function validateAPIKey(key: string): boolean {
  if (!validateAPIKeyFormat(key)) {
    return false;
  }

  // Check if key exists in our storage
  for (const [, data] of apiKeys) {
    if (data.key === key) {
      // Update last used timestamp
      data.lastUsed = new Date().toISOString();
      data.usage.calls++;
      return true;
    }
  }

  return false;
}

// Get API key usage stats
export function getAPIKeyUsage(key: string): any {
  for (const [, data] of apiKeys) {
    if (data.key === key) {
      return data.usage;
    }
  }
  return null;
}

// Update API key usage (called by other endpoints after successful requests)
export function updateAPIKeyUsage(key: string, cost: number, saved: number) {
  for (const [, data] of apiKeys) {
    if (data.key === key) {
      data.usage.totalCost += cost;
      data.usage.totalSaved += saved;
      data.lastUsed = new Date().toISOString();
      break;
    }
  }
}
