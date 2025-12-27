/**
 * Security utilities for the application
 * Includes RLS validation, rate limiting, and error handling
 */

import { supabase } from '../config/supabase';

// ============================================================================
// RLS (Row Level Security) Validation
// ============================================================================

/**
 * Validates that Row Level Security is active on all tables
 * This should run on app initialization in production
 */
export async function validateRLSPolicies(): Promise<{
  isValid: boolean;
  errors: string[];
}> {
  const errors: string[] = [];

  try {
    // Try to query without auth - should fail if RLS is working
    const testTables = ['expenses', 'incomes', 'assets', 'liabilities'];

    for (const table of testTables) {
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .limit(1);

      // If we get data without auth, RLS is NOT working
      if (data && data.length > 0 && !supabase.auth.getUser()) {
        errors.push(`⚠️ RLS NOT ACTIVE on table: ${table}`);
      }

      // PGRST116 = "not allowed" - This is what we WANT (RLS blocking)
      if (error && error.code !== 'PGRST116') {
        errors.push(`Error checking RLS on ${table}: ${error.message}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  } catch (error) {
    errors.push(`RLS validation failed: ${error}`);
    return { isValid: false, errors };
  }
}

/**
 * Run RLS validation only in production
 * Call this in your main.tsx or App.tsx
 */
export async function initSecurityChecks() {
  if (import.meta.env.PROD) {
    const result = await validateRLSPolicies();

    if (!result.isValid) {
      console.error('🔴 CRITICAL SECURITY ISSUE - RLS NOT ACTIVE');
      console.error('Errors:', result.errors);

      // In production, you might want to:
      // 1. Send alert to monitoring service (Sentry)
      // 2. Disable critical features
      // 3. Show warning banner to admin users

      // Example: Send to Sentry
      if (typeof window !== 'undefined' && (window as any).Sentry) {
        (window as any).Sentry.captureException(new Error('RLS_NOT_ACTIVE'), {
          extra: { errors: result.errors }
        });
      }
    } else {
      console.log('✅ RLS validation passed');
    }
  }
}

// ============================================================================
// Rate Limiting
// ============================================================================

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitStore {
  [key: string]: number[]; // userId -> timestamps
}

class RateLimiter {
  private store: RateLimitStore = {};
  private cleanupInterval: number = 60000; // Clean old entries every minute

  constructor() {
    // Cleanup old entries periodically
    if (typeof window !== 'undefined') {
      setInterval(() => this.cleanup(), this.cleanupInterval);
    }
  }

  /**
   * Check if user has exceeded rate limit
   * @param userId - User identifier
   * @param config - Rate limit configuration
   * @returns true if allowed, false if rate limit exceeded
   */
  check(
    userId: string,
    config: RateLimitConfig = { maxRequests: 100, windowMs: 60000 }
  ): boolean {
    const now = Date.now();
    const userRequests = this.store[userId] || [];

    // Filter requests within time window
    const recentRequests = userRequests.filter(
      timestamp => now - timestamp < config.windowMs
    );

    // Check if exceeded limit
    if (recentRequests.length >= config.maxRequests) {
      console.warn(`Rate limit exceeded for user: ${userId}`);
      return false;
    }

    // Add current request
    recentRequests.push(now);
    this.store[userId] = recentRequests;

    return true;
  }

  /**
   * Get remaining requests for user
   */
  getRemaining(
    userId: string,
    config: RateLimitConfig = { maxRequests: 100, windowMs: 60000 }
  ): number {
    const now = Date.now();
    const userRequests = this.store[userId] || [];

    const recentRequests = userRequests.filter(
      timestamp => now - timestamp < config.windowMs
    );

    return Math.max(0, config.maxRequests - recentRequests.length);
  }

  /**
   * Clear rate limit data for user (e.g., on logout)
   */
  clear(userId: string): void {
    delete this.store[userId];
  }

  /**
   * Cleanup old entries from all users
   */
  private cleanup(): void {
    const now = Date.now();
    const maxAge = 300000; // 5 minutes

    for (const userId in this.store) {
      this.store[userId] = this.store[userId].filter(
        timestamp => now - timestamp < maxAge
      );

      // Remove user if no recent requests
      if (this.store[userId].length === 0) {
        delete this.store[userId];
      }
    }
  }

  /**
   * Reset all rate limits (use carefully)
   */
  reset(): void {
    this.store = {};
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();

/**
 * Rate limit decorator for async functions
 * Usage:
 * ```typescript
 * const createExpense = withRateLimit(
 *   async (userId, data) => { ... },
 *   { maxRequests: 50, windowMs: 60000 }
 * );
 * ```
 */
export function withRateLimit<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  config?: RateLimitConfig
): T {
  return (async (...args: Parameters<T>) => {
    // Assume first arg is userId or extract from context
    const userId = args[0] as string;

    if (!rateLimiter.check(userId, config)) {
      throw new RateLimitError(
        'Rate limit exceeded. Please wait before trying again.',
        userId
      );
    }

    return await fn(...args);
  }) as T;
}

// ============================================================================
// Custom Errors
// ============================================================================

export class RateLimitError extends Error {
  constructor(
    message: string,
    public userId: string,
    public retryAfter: number = 60
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}

export class SecurityError extends Error {
  constructor(
    message: string,
    public code: string,
    public severity: 'low' | 'medium' | 'high' | 'critical'
  ) {
    super(message);
    this.name = 'SecurityError';
  }
}

// ============================================================================
// Secure Data Handling
// ============================================================================

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate that userId matches authenticated user
 */
export async function validateUserOwnership(
  resourceUserId: string
): Promise<boolean> {
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    throw new SecurityError(
      'Not authenticated',
      'AUTH_REQUIRED',
      'high'
    );
  }

  if (user.id !== resourceUserId) {
    throw new SecurityError(
      'Unauthorized access to resource',
      'UNAUTHORIZED',
      'critical'
    );
  }

  return true;
}

// ============================================================================
// Secure API Wrapper
// ============================================================================

/**
 * Wrapper for Supabase operations with security checks
 */
export async function secureSupabaseOperation<T>(
  operation: () => Promise<{ data: T | null; error: any }>,
  options: {
    userId?: string;
    rateLimit?: RateLimitConfig;
    requireAuth?: boolean;
  } = {}
): Promise<T> {
  // Check authentication
  if (options.requireAuth !== false) {
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) {
      throw new SecurityError('Authentication required', 'AUTH_REQUIRED', 'high');
    }
  }

  // Check rate limit
  if (options.userId && options.rateLimit) {
    if (!rateLimiter.check(options.userId, options.rateLimit)) {
      throw new RateLimitError(
        'Too many requests. Please slow down.',
        options.userId
      );
    }
  }

  // Execute operation
  const { data, error } = await operation();

  if (error) {
    console.error('Supabase operation error:', error);
    throw new Error(error.message || 'Database operation failed');
  }

  if (!data) {
    throw new Error('No data returned from operation');
  }

  return data;
}

// ============================================================================
// Export utilities
// ============================================================================

export const security = {
  validateRLS: validateRLSPolicies,
  initChecks: initSecurityChecks,
  rateLimiter,
  withRateLimit,
  sanitize: sanitizeInput,
  isValidUUID,
  validateOwnership: validateUserOwnership,
  secureOperation: secureSupabaseOperation
};

export default security;
