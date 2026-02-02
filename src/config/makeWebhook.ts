// src/config/makeWebhook.ts

/**
 * Make.com Webhook Configuration
 * Centralized configuration for CV-Check & CV-Generator
 *
 * IMPORTANT:
 * - Webhook URLs are loaded from .env (VITE_MAKE_WEBHOOK_CVCHECK, VITE_MAKE_WEBHOOK_CVGENERATOR)
 * - All Make requests must go through this configuration
 * - Environment variables MUST be set, otherwise errors are thrown
 */

// Helper to safely get and validate ENV variables
function getWebhookUrl(envKey: string, name: string): string {
  const url = import.meta.env[envKey];

  if (!url || url.trim() === "") {
    throw new Error(
      `Make.com webhook not configured: ${envKey} is missing or empty. ` +
      `Please set ${envKey} in your .env file.`
    );
  }

  if (!url.startsWith("https://hook.")) {
    console.warn(`[${name}] WARNING: Webhook URL does not look like a valid Make.com URL:`, url);
  }

  return url;
}

// CV-Check Webhook (for upload/ATS analysis)
let cvCheckUrl: string | null = null;
export function getMakeWebhookUrl(): string {
  if (!cvCheckUrl) {
    cvCheckUrl = getWebhookUrl("VITE_MAKE_WEBHOOK_CVCHECK", "CV-CHECK");
  }
  return cvCheckUrl;
}

// CV-Generator Webhook (for optimization → editor)
let cvGeneratorUrl: string | null = null;
export function getMakeGeneratorWebhookUrl(): string {
  if (!cvGeneratorUrl) {
    cvGeneratorUrl = getWebhookUrl("VITE_MAKE_WEBHOOK_CVGENERATOR", "CV-GENERATOR");
  }
  return cvGeneratorUrl;
}

// Check if webhooks are properly configured (must have both URLs)
export function isMakeWebhookConfigured(): boolean {
  try {
    getMakeWebhookUrl();
    getMakeGeneratorWebhookUrl();
    return true;
  } catch {
    return false;
  }
}

// Assertion helper - throws if webhook not configured
export function assertMakeWebhookConfigured(): void {
  if (!isMakeWebhookConfigured()) {
    throw new Error(
      "Make.com webhooks are not properly configured. " +
      "Please set VITE_MAKE_WEBHOOK_CVCHECK and VITE_MAKE_WEBHOOK_CVGENERATOR in your .env file."
    );
  }
}

// Validation helper
export interface WebhookValidation {
  ok: boolean;
  message: string;
}

export function validateMakeWebhookUrl(): WebhookValidation {
  try {
    const url = getMakeWebhookUrl();
    console.log("[CV-CHECK] MAKE_WEBHOOK_URL is properly configured");
    return {
      ok: true,
      message: `CV-Check webhook configured: ${url}`,
    };
  } catch (error: any) {
    console.error("[CV-CHECK] Webhook validation failed:", error.message);
    return {
      ok: false,
      message: error.message,
    };
  }
}

export function validateMakeGeneratorWebhookUrl(): WebhookValidation {
  try {
    const url = getMakeGeneratorWebhookUrl();
    console.log("[CV-GENERATOR] MAKE_GENERATOR_WEBHOOK is properly configured");
    return {
      ok: true,
      message: `CV-Generator webhook configured: ${url}`,
    };
  } catch (error: any) {
    console.error("[CV-GENERATOR] Webhook validation failed:", error.message);
    return {
      ok: false,
      message: error.message,
    };
  }
}
