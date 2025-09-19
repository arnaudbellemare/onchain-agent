'use client';

import React, { useState } from 'react';

export default function CachingWarning() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <span className="text-2xl">⚠️</span>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800" style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}>
            Caching Implementation Notice
          </h3>
          <div className="mt-2 text-sm text-yellow-700" style={{ fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif' }}>
            <p>
              <strong>Current Status:</strong> The caching system is using simple in-memory storage which has several limitations:
            </p>
            <ul className="mt-2 list-disc list-inside space-y-1">
              <li>Cache data is lost when the server restarts</li>
              <li>No persistent storage for long-term caching</li>
              <li>Memory usage grows indefinitely</li>
              <li>No security checks for sensitive data</li>
              <li>Won&apos;t work with multiple server instances</li>
            </ul>
            <p className="mt-2">
              <strong>Solution:</strong> We&apos;ve created a proper multi-layer caching system with Redis and database storage. 
              See <code className="bg-yellow-100 px-1 rounded">CACHING_STRATEGY.md</code> for implementation details.
            </p>
          </div>
          <div className="mt-4">
            <div className="-mx-2 -my-1.5 flex">
              <button
                type="button"
                onClick={() => setIsVisible(false)}
                className="bg-yellow-50 px-2 py-1.5 rounded-md text-sm font-medium text-yellow-800 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-yellow-50 focus:ring-yellow-600"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
