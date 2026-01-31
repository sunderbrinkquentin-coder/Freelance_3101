// src/config/makeWebhook.ts

/**
 * Make.com Webhook Configuration
 * Vereinfachte, robuste Konfiguration für CV-Check & CV-Generator
 *
 * WICHTIG:
 * - Hier sind die finalen Webhook-URLs direkt hinterlegt.
 * - Wenn du in Make neue Webhooks erzeugst, TAUSCHST du nur die Strings unten aus.
 */

// 🔹 CV-Check Webhook (für Upload/ATS-Analyse)
export const MAKE_WEBHOOK_URL =
  "https://hook.eu2.make.com/5epcuiq2py8p84vw1328w3y9u1p68mx9";

// 🔹 CV-Generator Webhook (für Optimierung → Editor)
export const MAKE_GENERATOR_WEBHOOK =
  "https://hook.eu2.make.com/tgu7hpllgy3nyslrp2qf5fcjsc06vkuq";

export interface WebhookValidation {
  ok: boolean;
  reason: "ok";
  value: string;
  message: string;
}

// ═══════════════════════════════════════════════════════════════════════
// CV-CHECK WEBHOOK HELPERS
// ═══════════════════════════════════════════════════════════════════════

export function validateMakeWebhookUrl(): WebhookValidation {
  if (!MAKE_WEBHOOK_URL || !MAKE_WEBHOOK_URL.startsWith("https://hook.")) {
    console.warn("[CV-CHECK] ⚠️ MAKE_WEBHOOK_URL sieht komisch aus:", MAKE_WEBHOOK_URL);
  } else {
    console.log("[CV-CHECK] ✅ MAKE_WEBHOOK_URL:", MAKE_WEBHOOK_URL);
  }

  return {
    ok: true,
    reason: "ok",
    value: MAKE_WEBHOOK_URL,
    message: "Webhook URL wird verwendet (Validation nicht blockierend)",
  };
}

export function assertMakeWebhookConfigured(): string {
  return MAKE_WEBHOOK_URL;
}

export function isMakeWebhookConfigured(): boolean {
  return true;
}

export function getMakeWebhookUrl(): string {
  return MAKE_WEBHOOK_URL || "[NOT_CONFIGURED]";
}

// ═══════════════════════════════════════════════════════════════════════
// CV-GENERATOR WEBHOOK HELPERS
// ═══════════════════════════════════════════════════════════════════════

export function validateMakeGeneratorWebhookUrl(): WebhookValidation {
  if (!MAKE_GENERATOR_WEBHOOK || !MAKE_GENERATOR_WEBHOOK.startsWith("https://hook.")) {
    console.warn(
      "[CV-GENERATOR] ⚠️ MAKE_GENERATOR_WEBHOOK sieht komisch aus:",
      MAKE_GENERATOR_WEBHOOK
    );
  } else {
    console.log("[CV-GENERATOR] 🚀 MAKE_GENERATOR_WEBHOOK:", MAKE_GENERATOR_WEBHOOK);
  }

  return {
    ok: true,
    reason: "ok",
    value: MAKE_GENERATOR_WEBHOOK,
    message: "CV-Generator Webhook URL wird verwendet (Validation nicht blockierend)",
  };
}

export function assertMakeGeneratorWebhookConfigured(): string {
  return MAKE_GENERATOR_WEBHOOK;
}

export function isMakeGeneratorWebhookConfigured(): boolean {
  return true;
}

export function getMakeGeneratorWebhookUrl(): string {
  return MAKE_GENERATOR_WEBHOOK || "[NOT_CONFIGURED]";
}
