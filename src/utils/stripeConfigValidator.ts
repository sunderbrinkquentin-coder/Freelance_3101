/**
 * Stripe Configuration Validator
 *
 * Validates that all required Stripe Price IDs are configured
 * in environment variables.
 */

export interface StripeConfigValidation {
  isValid: boolean;
  missingKeys: string[];
}

export function validateStripePriceIds(): StripeConfigValidation {
  const requiredKeys = [
    'VITE_STRIPE_PRICE_SINGLE',
    'VITE_STRIPE_PRICE_FIVE',
    'VITE_STRIPE_PRICE_TEN',
  ];

  const missingKeys: string[] = [];

  requiredKeys.forEach((key) => {
    const value = import.meta.env[key];
    if (!value || value.trim() === '') {
      missingKeys.push(key);
    }
  });

  return {
    isValid: missingKeys.length === 0,
    missingKeys,
  };
}
