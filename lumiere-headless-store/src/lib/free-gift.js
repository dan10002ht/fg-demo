import defaultConfig from "@/config/free-gift.json";
import { getProductByHandle } from "@/lib/shopify";

const STORAGE_KEY = "freeGiftConfig";

/**
 * Get the free gift configuration.
 * Merges default config with any admin overrides stored in localStorage.
 */
export function getFreeGiftConfig() {
  if (typeof window === "undefined") return defaultConfig;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...defaultConfig, ...JSON.parse(stored) };
    }
  } catch {
    // ignore parse errors
  }
  return defaultConfig;
}

/**
 * Save free gift configuration to localStorage (admin use).
 */
export function saveFreeGiftConfig(config) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

/**
 * Check if a product matches the gift trigger criteria.
 * Works with both full product objects (PDP) and cart line merchandise.
 */
export function isGiftTriggerProduct(product, config = null) {
  const cfg = config || getFreeGiftConfig();
  if (!cfg.isActive) return false;

  switch (cfg.triggerType) {
    case "productType":
      return (
        product.productType?.toLowerCase() ===
        cfg.triggerValue.toLowerCase()
      );
    case "tag":
      return (product.tags || []).some(
        (tag) => tag.toLowerCase() === cfg.triggerValue.toLowerCase()
      );
    case "specificProduct":
      return product.handle === cfg.triggerValue;
    default:
      return false;
  }
}

/**
 * Fetch the gift product from Shopify by handle.
 * Returns the product with its variants, or null if not found.
 */
export async function getGiftProduct(config = null) {
  const cfg = config || getFreeGiftConfig();
  try {
    const product = await getProductByHandle(cfg.giftProductHandle);
    return product;
  } catch (error) {
    console.error("Failed to fetch gift product:", error);
    return null;
  }
}

/**
 * Get the variant ID to use for the gift product.
 * Uses configured variantId if set, otherwise the first available variant.
 */
export function getGiftVariantId(giftProduct, config = null) {
  const cfg = config || getFreeGiftConfig();

  if (cfg.giftVariantId) {
    return cfg.giftVariantId;
  }

  const variants = giftProduct.variants.edges.map((e) => e.node);
  const available = variants.find((v) => v.availableForSale);
  return available?.id || variants[0]?.id || null;
}

/**
 * Check if a gift variant is available for sale.
 */
export function isGiftAvailable(giftProduct, config = null) {
  const cfg = config || getFreeGiftConfig();

  const variants = giftProduct.variants.edges.map((e) => e.node);

  if (cfg.giftVariantId) {
    const variant = variants.find((v) => v.id === cfg.giftVariantId);
    return variant?.availableForSale ?? false;
  }

  return variants.some((v) => v.availableForSale);
}

/**
 * Calculate how many gift items should be in the cart based on trigger quantity.
 */
export function calculateGiftQuantity(triggerQuantity, config = null) {
  const cfg = config || getFreeGiftConfig();

  if (triggerQuantity <= 0) return 0;

  let giftQty;
  if (cfg.quantityMode === "perItem") {
    giftQty = triggerQuantity;
  } else {
    // fixed mode
    giftQty = cfg.fixedQuantity || 1;
  }

  // Apply max limit
  if (cfg.maxGiftQuantity && cfg.maxGiftQuantity > 0) {
    giftQty = Math.min(giftQty, cfg.maxGiftQuantity);
  }

  return giftQty;
}

/**
 * Check if a cart line item is a free gift by looking at its attributes.
 */
export function isGiftLineItem(line) {
  const attributes = line.attributes || [];
  return attributes.some(
    (attr) => attr.key === "_isGift" && attr.value === "true"
  );
}

/**
 * Get the total quantity of trigger products in the cart lines.
 */
export function getTriggerQuantityFromLines(lines, config = null) {
  const cfg = config || getFreeGiftConfig();
  let total = 0;

  for (const line of lines) {
    if (isGiftLineItem(line)) continue;

    const product = line.merchandise?.product;
    if (!product) continue;

    const matches = isGiftTriggerProduct(product, cfg);
    if (matches) {
      total += line.quantity;
    }
  }

  return total;
}

/**
 * Find the gift line item in cart lines.
 */
export function findGiftLineItem(lines) {
  return lines.find((line) => isGiftLineItem(line)) || null;
}
