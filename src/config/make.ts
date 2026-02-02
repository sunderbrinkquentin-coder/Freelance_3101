/**
 * Make.com Configuration (Legacy)
 * Re-exports from makeWebhook.ts for backward compatibility
 *
 * DEPRECATED: Use makeWebhook.ts directly instead
 */

export {
  validateMakeWebhookUrl,
  validateMakeGeneratorWebhookUrl,
  assertMakeWebhookConfigured,
  isMakeWebhookConfigured,
  getMakeWebhookUrl,
  getMakeGeneratorWebhookUrl,
  type WebhookValidation
} from './makeWebhook';
