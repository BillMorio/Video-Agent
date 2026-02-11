// Utility functions for encrypting/decrypting API keys

/**
 * Simple Base64 encoding for API keys (MVP)
 * For production, use proper encryption like AES-256
 */
export function encryptValue(value: string): string {
  if (!value) return '';
  return Buffer.from(value).toString('base64');
}

/**
 * Decode Base64 encoded values
 */
export function decryptValue(encryptedValue: string): string {
  if (!encryptedValue) return '';
  try {
    return Buffer.from(encryptedValue, 'base64').toString('utf-8');
  } catch (error) {
    console.error('Failed to decrypt value:', error);
    return '';
  }
}

/**
 * Mask API key for display (show only last 4 characters)
 */
export function maskApiKey(key: string): string {
  if (!key || key.length < 8) return '***';
  return `${key.slice(0, 3)}${'*'.repeat(key.length - 7)}${key.slice(-4)}`;
}
