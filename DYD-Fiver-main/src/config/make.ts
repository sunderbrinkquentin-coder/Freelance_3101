/**
 * Make.com Configuration (Legacy)
 * Re-exports from makeWebhook.ts for backward compatibility
 *
 * DEPRECATED: Use makeWebhook.ts directly instead
 */

export {
  MAKE_WEBHOOK_URL,
  validateMakeWebhookUrl,
  assertMakeWebhookConfigured,
  isMakeWebhookConfigured,
  getMakeWebhookUrl
} from './makeWebhook';
