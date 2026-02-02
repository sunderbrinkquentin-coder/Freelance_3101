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

// Helper to safely read webhook URL without throwing - for fallback use
function getSafeWebhookUrl(envKey: string): string | null {
  try {
    const url = import.meta.env[envKey];
    if (!url || url.trim() === "") {
      console.warn(`[WEBHOOK] ${envKey} is not configured in environment`);
      return null;
    }
    return url;
  } catch (error) {
    console.warn(`[WEBHOOK] Error reading ${envKey}:`, error);
    return null;
  }
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
      message: `CV-Check webhook configured: ${maskWebhookUrl(url)}`,
    };
  } catch (error: any) {
    console.error("[CV-CHECK] Webhook validation failed:", error.message);
    const fallbackUrl = getSafeWebhookUrl("VITE_MAKE_WEBHOOK_CVCHECK");
    if (fallbackUrl) {
      console.warn("[CV-CHECK] Using fallback URL from environment");
      return {
        ok: true,
        message: `CV-Check webhook available (fallback): ${maskWebhookUrl(fallbackUrl)}`,
      };
    }
    return {
      ok: false,
      message: error.message,
    };
  }
}

// Helper to mask webhook URL for logging (show first/last segments only)
export function maskWebhookUrl(url: string): string {
  if (!url) return "[no-url]";
  try {
    const parts = url.split("/");
    if (parts.length >= 2) {
      const hash = parts[parts.length - 1];
      return `https://hook.eu2.make.com/${hash.substring(0, 8)}...${hash.slice(-8)}`;
    }
    return url;
  } catch {
    return "[masked-url]";
  }
}

// Export safe URL reader for use in services
export function getSafeWebhookUrlForService(): string | null {
  return getSafeWebhookUrl("VITE_MAKE_WEBHOOK_CVCHECK");
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
