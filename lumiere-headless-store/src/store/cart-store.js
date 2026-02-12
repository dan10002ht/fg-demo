import { create } from "zustand";
import {
  createCart,
  getCart,
  addToCart,
  updateCart,
  removeFromCart,
  cartDiscountCodesUpdate,
} from "@/lib/shopify";
import {
  getFreeGiftConfig,
  isCampaignActive,
  isProductInBuyCondition,
  calculateGiftQuantity,
  getAvailableGifts,
  getGiftVariantId,
} from "@/lib/free-gift";

/**
 * Check if a cart line item is a gift by its attributes
 */
function isGiftLine(line) {
  const attrs = line.attributes || [];
  return attrs.some((a) => a.key === "_isGift" && a.value === "true");
}

/**
 * Count trigger products in cart lines based on campaign config
 */
function countTriggerItems(lines, config) {
  let count = 0;
  for (const line of lines) {
    if (isGiftLine(line)) continue;
    const product = line.merchandise?.product;
    if (product && isProductInBuyCondition(product, config)) {
      count += line.quantity;
    }
  }
  return count;
}

/**
 * Find existing gift line item in cart
 */
function findGiftLine(lines) {
  return lines.find((line) => isGiftLine(line)) || null;
}

const useCartStore = create((set, get) => ({
  cart: null,
  isOpen: false,
  loading: false,

  // Gift UI state
  showGiftPopup: false,
  showCongratBar: false,
  congratGiftName: "",
  availableGifts: [],
  giftNotification: null,
  giftConfig: null, // Active campaign config for UI texts

  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  clearGiftNotification: () => set({ giftNotification: null }),
  closeGiftPopup: () => set({ showGiftPopup: false }),
  closeCongratBar: () => set({ showCongratBar: false }),

  initCart: async () => {
    const storedCartId =
      typeof window !== "undefined" ? localStorage.getItem("cartId") : null;

    if (storedCartId) {
      try {
        const cart = await getCart(storedCartId);
        if (cart) {
          set({ cart });
          return;
        }
        // Cart expired or invalid — remove stale ID and create new
        localStorage.removeItem("cartId");
      } catch (error) {
        console.error("Failed to fetch cart:", error);
        localStorage.removeItem("cartId");
      }
    }

    try {
      const cart = await createCart();
      set({ cart });
      localStorage.setItem("cartId", cart.id);
    } catch (error) {
      console.error("Failed to create cart:", error);
    }
  },

  /**
   * Sync free gift in cart based on campaign config.
   * Handles add/remove/update gift based on trigger quantity.
   */
  _syncFreeGift: async (cart) => {
    const config = getFreeGiftConfig();
    if (!isCampaignActive(config)) {
      return cart;
    }
    if (!config.getProducts?.length) {
      return cart;
    }

    // Store config for UI components to read
    set({ giftConfig: config });

    const lines = cart?.lines?.edges?.map((e) => e.node) || [];
    const triggerQty = countTriggerItems(lines, config);
    const desiredMultiplier = calculateGiftQuantity(triggerQty, config);
    const existingGift = findGiftLine(lines);

    // Need gift but none in cart → trigger gift flow
    if (desiredMultiplier > 0 && !existingGift) {
      const gifts = await getAvailableGifts(config);

      if (!gifts.length) {
        set({
          giftNotification: {
            type: "outOfStock",
            message: "Free gift is currently out of stock",
          },
        });
        return cart;
      }

      // Check widget mode
      if (config.giftSelectionMethod === "customerChooses") {
        // Show popup for customer to pick
        set({ showGiftPopup: true, availableGifts: gifts });
        return cart;
      }

      // Automatic mode — add first available gift
      const firstGift = gifts[0];
      const variantId = getGiftVariantId(firstGift);
      if (!variantId) return cart;

      const giftQty = desiredMultiplier * (firstGift.giftQuantity || 1);

      try {
        let updatedCart = await addToCart(cart.id, [
          {
            merchandiseId: variantId,
            quantity: giftQty,
            attributes: [
              { key: "_isGift", value: "true" },
              { key: "_giftLabel", value: config.getProducts[0]?.giftLabel || "Free Gift" },
            ],
          },
        ]);

        // Apply discount code so gift is free at checkout
        if (config.discountCode) {
          updatedCart = await cartDiscountCodesUpdate(updatedCart.id, [config.discountCode]);
        }

        set({
          showCongratBar: true,
          congratGiftName: firstGift.title,
        });

        return updatedCart;
      } catch (error) {
        console.error("Failed to add gift:", error);
        return cart;
      }
    }

    // Gift exists but no trigger → remove it + clear discount code
    if (desiredMultiplier === 0 && existingGift) {
      try {
        let updatedCart = await removeFromCart(cart.id, [existingGift.id]);

        // Clear discount codes
        if (config.discountCode) {
          updatedCart = await cartDiscountCodesUpdate(updatedCart.id, []);
        }

        set({
          giftNotification: {
            type: "removed",
            message: "Free gift has been removed from your cart",
          },
        });
        return updatedCart;
      } catch (error) {
        console.error("Failed to remove gift:", error);
        return cart;
      }
    }

    // Gift exists but quantity needs updating (multi-apply)
    if (desiredMultiplier > 0 && existingGift) {
      const giftCfg = config.getProducts[0];
      const desiredQty = desiredMultiplier * (giftCfg?.giftQuantity || 1);

      if (existingGift.quantity !== desiredQty) {
        try {
          const updatedCart = await updateCart(cart.id, [
            { id: existingGift.id, quantity: desiredQty },
          ]);
          return updatedCart;
        } catch (error) {
          console.error("Failed to update gift quantity:", error);
          return cart;
        }
      }
    }

    return cart;
  },

  /**
   * Add a gift item picked by customer from popup
   */
  addGiftItem: async (variantId, giftTitle) => {
    const { cart } = get();
    if (!cart?.id) return;

    set({ loading: true, showGiftPopup: false });

    try {
      const config = getFreeGiftConfig();
      const lines = cart?.lines?.edges?.map((e) => e.node) || [];
      const triggerQty = countTriggerItems(lines, config);
      const multiplier = calculateGiftQuantity(triggerQty, config);
      const giftCfg = config.getProducts?.[0];
      const giftQty = multiplier * (giftCfg?.giftQuantity || 1);

      let updatedCart = await addToCart(cart.id, [
        {
          merchandiseId: variantId,
          quantity: giftQty,
          attributes: [
            { key: "_isGift", value: "true" },
            { key: "_giftLabel", value: "Free Gift" },
          ],
        },
      ]);

      // Apply discount code so gift is free at checkout
      if (config.discountCode) {
        updatedCart = await cartDiscountCodesUpdate(updatedCart.id, [config.discountCode]);
      }

      set({
        cart: updatedCart,
        loading: false,
        isOpen: true,
      });
    } catch (error) {
      console.error("Failed to add gift:", error);
      set({ loading: false });
    }
  },

  addItem: async (variantId, quantity = 1, sellingPlanId = null) => {
    const { cart, _syncFreeGift } = get();
    set({ loading: true });

    try {
      let cartId = cart?.id;

      if (!cartId) {
        const newCart = await createCart();
        cartId = newCart.id;
        localStorage.setItem("cartId", cartId);
      }

      const line = { merchandiseId: variantId, quantity };
      if (sellingPlanId) line.sellingPlanId = sellingPlanId;

      let updatedCart = await addToCart(cartId, [line]);

      // Sync free gift after adding item
      updatedCart = await _syncFreeGift(updatedCart);

      set({ cart: updatedCart, loading: false, isOpen: true });
    } catch (error) {
      console.error("Failed to add item:", error);
      set({ loading: false });
    }
  },

  updateItemQuantity: async (lineId, quantity) => {
    const { cart, _syncFreeGift } = get();
    if (!cart?.id) return;

    // Prevent updating gift items directly
    const lines = cart?.lines?.edges?.map((e) => e.node) || [];
    const line = lines.find((l) => l.id === lineId);
    if (line && isGiftLine(line)) return;

    set({ loading: true });

    try {
      let updatedCart;
      if (quantity <= 0) {
        updatedCart = await removeFromCart(cart.id, [lineId]);
      } else {
        updatedCart = await updateCart(cart.id, [{ id: lineId, quantity }]);
      }

      updatedCart = await _syncFreeGift(updatedCart);
      set({ cart: updatedCart, loading: false });
    } catch (error) {
      console.error("Failed to update item:", error);
      set({ loading: false });
    }
  },

  removeItem: async (lineId) => {
    const { cart, _syncFreeGift } = get();
    if (!cart?.id) return;

    // Prevent removing gift items directly
    const lines = cart?.lines?.edges?.map((e) => e.node) || [];
    const line = lines.find((l) => l.id === lineId);
    if (line && isGiftLine(line)) return;

    set({ loading: true });

    try {
      let updatedCart = await removeFromCart(cart.id, [lineId]);
      updatedCart = await _syncFreeGift(updatedCart);
      set({ cart: updatedCart, loading: false });
    } catch (error) {
      console.error("Failed to remove item:", error);
      set({ loading: false });
    }
  },

  getCartLines: () => {
    const { cart } = get();
    return cart?.lines?.edges?.map((edge) => edge.node) || [];
  },

  getCartTotal: () => {
    const { cart } = get();
    return cart?.cost?.subtotalAmount?.amount || "0";
  },

  getCartCurrency: () => {
    const { cart } = get();
    return cart?.cost?.subtotalAmount?.currencyCode || "USD";
  },

  getTotalQuantity: () => {
    const { cart } = get();
    return cart?.totalQuantity || 0;
  },

  getCheckoutUrl: () => {
    const { cart } = get();
    return cart?.checkoutUrl || "";
  },
}));

export default useCartStore;
export { isGiftLine };
