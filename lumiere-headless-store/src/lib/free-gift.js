import { getProductByHandle } from "@/lib/shopify";
import { loadFromStorage, getDefaultState } from "@/lib/campaign-store";

/**
 * Get the current campaign configuration
 */
export function getFreeGiftConfig() {
  if (typeof window === "undefined") return getDefaultState();
  const stored = loadFromStorage();
  return stored || getDefaultState();
}

/**
 * Check if the campaign is currently active based on schedule and status
 */
export function isCampaignActive(config) {
  if (!config || !config.isActive) return false;

  const now = new Date();

  if (config.startDate && config.startTime) {
    const start = new Date(`${config.startDate}T${config.startTime}`);
    if (now < start) return false;
  }

  if (config.hasEndDate && config.endDate && config.endTime) {
    const end = new Date(`${config.endDate}T${config.endTime}`);
    if (now > end) return false;
  }

  return true;
}

/**
 * Check if a product is in the "Customer buys" condition
 */
export function isProductInBuyCondition(product, config) {
  if (!config || !product) return false;

  if (config.buyConditionType === "specificProducts") {
    return config.buyProducts.some(
      (bp) => bp.productId === product.id || bp.handle === product.handle
    );
  }

  return false;
}

/**
 * Legacy alias — checks campaign active AND product matches
 */
export function isGiftTriggerProduct(product, config) {
  return isCampaignActive(config) && isProductInBuyCondition(product, config);
}

/**
 * Calculate how many gift sets to give based on trigger quantity and config
 */
export function calculateGiftQuantity(triggerQty, config) {
  if (!config || triggerQty < config.minimumQuantity) return 0;

  if (config.multiApply) {
    return Math.floor(triggerQty / config.minimumQuantity);
  }

  return 1;
}

/**
 * Fetch the first gift product from Shopify
 */
export async function getGiftProduct(config) {
  if (!config?.getProducts?.length) return null;

  try {
    return await getProductByHandle(config.getProducts[0].handle);
  } catch (e) {
    console.error("Failed to fetch gift product:", e);
    return null;
  }
}

/**
 * Get all available gift products (for popup / auto-add)
 */
export async function getAvailableGifts(config) {
  if (!config?.getProducts?.length) return [];

  const results = [];
  for (const giftCfg of config.getProducts) {
    try {
      const product = await getProductByHandle(giftCfg.handle);
      if (product?.availableForSale) {
        results.push({
          ...product,
          giftQuantity: giftCfg.giftQuantity || 1,
          configProductId: giftCfg.productId,
        });
      }
    } catch (e) {
      console.error(`Failed to fetch gift ${giftCfg.handle}:`, e);
    }
  }
  return results;
}

/**
 * Check if a gift product has available variants
 */
export function isGiftAvailable(product) {
  if (!product) return false;
  const variants = product.variants?.edges?.map((e) => e.node) || [];
  return variants.some((v) => v.availableForSale);
}

/**
 * Check if a cart line is a gift by its ID being in giftLineIds
 */
export function isGiftLineItem(lineItem, giftLineIds) {
  if (!giftLineIds?.length) return false;
  return giftLineIds.includes(lineItem.id);
}

/**
 * Count trigger products in cart lines
 */
export function countTriggerProductsInCart(cartLines, config) {
  if (!cartLines || !config) return 0;

  let count = 0;
  for (const line of cartLines) {
    const product = line.merchandise?.product;
    if (product && isProductInBuyCondition(product, config)) {
      count += line.quantity;
    }
  }
  return count;
}

/**
 * Get the first available gift variant ID
 */
export function getGiftVariantId(product) {
  if (!product) return null;
  const variants = product.variants?.edges?.map((e) => e.node) || [];
  const available = variants.find((v) => v.availableForSale);
  return available?.id || null;
}
