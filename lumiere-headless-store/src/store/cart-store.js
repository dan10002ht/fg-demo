import { create } from "zustand";
import { createCart, addToCart, updateCart, removeFromCart } from "@/lib/shopify";
import {
  getFreeGiftConfig,
  getGiftProduct,
  getGiftVariantId,
  isGiftAvailable,
  calculateGiftQuantity,
  getTriggerQuantityFromLines,
  findGiftLineItem,
  isGiftLineItem,
} from "@/lib/free-gift";

const useCartStore = create((set, get) => ({
  cart: null,
  isOpen: false,
  loading: false,
  giftNotification: null, // { type: "added" | "outOfStock" | "removed", message: string }

  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  clearGiftNotification: () => set({ giftNotification: null }),

  initCart: async () => {
    const storedCartId =
      typeof window !== "undefined" ? localStorage.getItem("cartId") : null;

    if (storedCartId) {
      set({ cart: { id: storedCartId } });
      return;
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
   * Sync free gift in cart: add, update quantity, or remove as needed.
   * Called after any cart modification.
   */
  _syncFreeGift: async (cart) => {
    const config = getFreeGiftConfig();
    if (!config.isActive) return cart;

    const lines = cart?.lines?.edges?.map((e) => e.node) || [];
    const triggerQty = getTriggerQuantityFromLines(lines, config);
    const desiredGiftQty = calculateGiftQuantity(triggerQty, config);
    const existingGift = findGiftLineItem(lines);

    // Case 1: Need gift but none in cart → add it
    if (desiredGiftQty > 0 && !existingGift) {
      try {
        const giftProduct = await getGiftProduct(config);
        if (!giftProduct || !isGiftAvailable(giftProduct, config)) {
          set({
            giftNotification: {
              type: "outOfStock",
              message: "Free gift is currently out of stock",
            },
          });
          return cart;
        }

        const giftVariantId = getGiftVariantId(giftProduct, config);
        if (!giftVariantId) return cart;

        const updatedCart = await addToCart(cart.id, [
          {
            merchandiseId: giftVariantId,
            quantity: desiredGiftQty,
            attributes: [
              { key: "_isGift", value: "true" },
              { key: "_giftLabel", value: config.giftLabel || "Free Gift" },
            ],
          },
        ]);

        set({
          giftNotification: {
            type: "added",
            message: `${config.giftLabel || "Free Gift"} has been added to your cart!`,
          },
        });

        return updatedCart;
      } catch (error) {
        console.error("Failed to add gift:", error);
        return cart;
      }
    }

    // Case 2: Gift exists but no trigger → remove it
    if (desiredGiftQty === 0 && existingGift) {
      try {
        const updatedCart = await removeFromCart(cart.id, [existingGift.id]);
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

    // Case 3: Gift exists but quantity needs updating
    if (desiredGiftQty > 0 && existingGift && existingGift.quantity !== desiredGiftQty) {
      try {
        const updatedCart = await updateCart(cart.id, [
          { id: existingGift.id, quantity: desiredGiftQty },
        ]);
        return updatedCart;
      } catch (error) {
        console.error("Failed to update gift quantity:", error);
        return cart;
      }
    }

    return cart;
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

    set({ loading: true });

    try {
      let updatedCart;
      if (quantity <= 0) {
        updatedCart = await removeFromCart(cart.id, [lineId]);
      } else {
        updatedCart = await updateCart(cart.id, [
          { id: lineId, quantity },
        ]);
      }

      // Sync free gift after quantity change
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

    set({ loading: true });

    try {
      let updatedCart = await removeFromCart(cart.id, [lineId]);

      // Sync free gift after removal
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
