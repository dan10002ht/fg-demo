"use client";

import { create } from "zustand";

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function generateDiscountCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "GIFT-";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function generateOfferTitle() {
  const now = new Date();
  const month = now.toLocaleString("en-US", { month: "short" });
  const year = now.getFullYear();
  return `Buy X Get Y - ${month} ${year}`;
}

/** Default demo campaign for first-time visitors (demo purposes) */
function getDefaultDemoCampaign() {
  const now = new Date();
  return {
    id: "demo-campaign-1",
    offerTitle: "Buy X Get Y - Feb 2026",
    campaignType: "freeGift",
    startDate: now.toISOString().split("T")[0],
    startTime: "00:00",
    hasEndDate: false,
    endDate: "",
    endTime: "23:59",
    minimumQuantity: 1,
    buyConditionType: "specificProducts",
    buyProducts: [
      {
        productId: "gid://shopify/Product/8810536272028",
        title: "Retro Logo Print T-Shirt",
        handle: "retro-logo-print-t-shirt",
        imageUrl: "https://cdn.shopify.com/s/files/1/0732/4264/0540/files/retro-logo-print-t-shirt.png?v=1770970454",
        variants: [{ id: "gid://shopify/ProductVariant/46199093461148", title: "Default Title", availableForSale: true, quantityAvailable: 20000, price: { amount: "34.0", currencyCode: "USD" }, compareAtPrice: null, selectedOptions: [{ name: "Title", value: "Default Title" }], image: { url: "https://cdn.shopify.com/s/files/1/0732/4264/0540/files/retro-logo-print-t-shirt.png?v=1770970454", altText: null, width: 1248, height: 832 } }],
        totalVariants: 1,
        priceRange: { minVariantPrice: { amount: "34.0", currencyCode: "USD" }, maxVariantPrice: { amount: "34.0", currencyCode: "USD" } },
      },
      {
        productId: "gid://shopify/Product/8810535977116",
        title: "V-Neck Basic T-Shirt",
        handle: "v-neck-basic-t-shirt",
        imageUrl: "https://cdn.shopify.com/s/files/1/0732/4264/0540/files/v-neck-basic-t-shirt.png?v=1770970334",
        variants: [{ id: "gid://shopify/ProductVariant/46199092215964", title: "Default Title", availableForSale: true, quantityAvailable: 4000, price: { amount: "20.0", currencyCode: "USD" }, compareAtPrice: null, selectedOptions: [{ name: "Title", value: "Default Title" }], image: { url: "https://cdn.shopify.com/s/files/1/0732/4264/0540/files/v-neck-basic-t-shirt.png?v=1770970334", altText: null, width: 1024, height: 1024 } }],
        totalVariants: 1,
        priceRange: { minVariantPrice: { amount: "20.0", currencyCode: "USD" }, maxVariantPrice: { amount: "20.0", currencyCode: "USD" } },
      },
      {
        productId: "gid://shopify/Product/8810535747740",
        title: "Vintage Graphic T-Shirt",
        handle: "vintage-graphic-t-shirt",
        imageUrl: "https://cdn.shopify.com/s/files/1/0732/4264/0540/files/vintage-graphic-t-shirt.png?v=1770970166",
        variants: [{ id: "gid://shopify/ProductVariant/46199089692828", title: "Default Title", availableForSale: true, quantityAvailable: 22000, price: { amount: "40.0", currencyCode: "USD" }, compareAtPrice: null, selectedOptions: [{ name: "Title", value: "Default Title" }], image: { url: "https://cdn.shopify.com/s/files/1/0732/4264/0540/files/vintage-graphic-t-shirt.png?v=1770970166", altText: null, width: 1024, height: 1024 } }],
        totalVariants: 1,
        priceRange: { minVariantPrice: { amount: "40.0", currencyCode: "USD" }, maxVariantPrice: { amount: "40.0", currencyCode: "USD" } },
      },
      {
        productId: "gid://shopify/Product/8810535092380",
        title: "Oversized Relaxed Fit T-Shirt",
        handle: "oversized-relaxed-fit-t-shirt",
        imageUrl: "https://cdn.shopify.com/s/files/1/0732/4264/0540/files/o-ph-ng-m-u-tr-n-oversize-unisex.png?v=1770969972",
        variants: [{ id: "gid://shopify/ProductVariant/46199085039772", title: "Default Title", availableForSale: true, quantityAvailable: 40000, price: { amount: "40.0", currencyCode: "USD" }, compareAtPrice: null, selectedOptions: [{ name: "Title", value: "Default Title" }], image: { url: "https://cdn.shopify.com/s/files/1/0732/4264/0540/files/o-ph-ng-m-u-tr-n-oversize-unisex.png?v=1770969972", altText: null, width: 1248, height: 832 } }],
        totalVariants: 1,
        priceRange: { minVariantPrice: { amount: "40.0", currencyCode: "USD" }, maxVariantPrice: { amount: "40.0", currencyCode: "USD" } },
      },
      {
        productId: "gid://shopify/Product/8810534895772",
        title: "Classic Cotton T-Shirt",
        handle: "classic-cotton-t-shirt",
        imageUrl: "https://cdn.shopify.com/s/files/1/0732/4264/0540/files/th-i-trang-h-n.png?v=1770968690",
        variants: [{ id: "gid://shopify/ProductVariant/46199084122268", title: "Default Title", availableForSale: true, quantityAvailable: 20000, price: { amount: "35.0", currencyCode: "USD" }, compareAtPrice: { amount: "40.0", currencyCode: "USD" }, selectedOptions: [{ name: "Title", value: "Default Title" }], image: { url: "https://cdn.shopify.com/s/files/1/0732/4264/0540/files/th-i-trang-h-n.png?v=1770968690", altText: null, width: 1248, height: 832 } }],
        totalVariants: 1,
        priceRange: { minVariantPrice: { amount: "35.0", currencyCode: "USD" }, maxVariantPrice: { amount: "35.0", currencyCode: "USD" } },
      },
      {
        productId: "gid://shopify/Product/8810530111644",
        title: "Short T-shirt",
        handle: "short-t-shirt",
        imageUrl: "https://cdn.shopify.com/s/files/1/0732/4264/0540/files/t-shirts.png?v=1770968148",
        variants: [{ id: "gid://shopify/ProductVariant/46199061545116", title: "Default Title", availableForSale: true, quantityAvailable: 10000, price: { amount: "30.0", currencyCode: "USD" }, compareAtPrice: { amount: "32.0", currencyCode: "USD" }, selectedOptions: [{ name: "Title", value: "Default Title" }], image: { url: "https://cdn.shopify.com/s/files/1/0732/4264/0540/files/t-shirts.png?v=1770968148", altText: null, width: 1024, height: 1024 } }],
        totalVariants: 1,
        priceRange: { minVariantPrice: { amount: "30.0", currencyCode: "USD" }, maxVariantPrice: { amount: "30.0", currencyCode: "USD" } },
      },
    ],
    buyCollections: [],
    getProducts: [
      {
        productId: "gid://shopify/Product/8810538205340",
        title: "Classic Striped Crew Socks",
        handle: "classic-striped-crew-socks",
        imageUrl: "https://cdn.shopify.com/s/files/1/0732/4264/0540/files/sock.png?v=1770970612",
        variants: [{ id: "gid://shopify/ProductVariant/46199107879068", title: "Default Title", availableForSale: true, quantityAvailable: 20000, price: { amount: "12.0", currencyCode: "USD" }, compareAtPrice: null, selectedOptions: [{ name: "Title", value: "Default Title" }], image: { url: "https://cdn.shopify.com/s/files/1/0732/4264/0540/files/sock.png?v=1770970612", altText: null, width: 1024, height: 1024 } }],
        totalVariants: 1,
        priceRange: { minVariantPrice: { amount: "12.0", currencyCode: "USD" }, maxVariantPrice: { amount: "12.0", currencyCode: "USD" } },
        giftQuantity: 1,
      },
    ],
    multiApply: false,
    discountCode: generateDiscountCode(),
    discountType: "free",
    discountValue: null,
    combineProductDiscounts: false,
    combineOrderDiscounts: false,
    combineShippingDiscounts: false,
    customerEligibility: "allCustomers",
    giftSelectionMethod: "customerChooses",
    showPromotionCard: true,
    autoDisableWhenOOS: false,
    promotionBadgeEnabled: true,
    promotionBadgeText: "🎁 FREE GIFT!!",
    congratsBarTitle: "A free gift has been added to your cart!",
    congratsBarDuration: 5,
    popupTitle: "You've unlocked a free gift!",
    popupDescription: "Choose your free gift below and add it to your cart before checkout.",
    showOosMessage: false,
    oosMessage: "Sorry, the free gift is currently unavailable due to limited stock.",
    isActive: true,
    shopifyDiscountId: null,
  };
}

/** Default fields for a single campaign */
function getDefaultCampaignFields() {
  const now = new Date();
  return {
    // Campaign Setting
    offerTitle: generateOfferTitle(),
    campaignType: "freeGift",
    startDate: now.toISOString().split("T")[0],
    startTime: "00:00",
    hasEndDate: false,
    endDate: "",
    endTime: "23:59",
    minimumQuantity: 1,
    buyConditionType: "specificProducts",
    buyProducts: [],
    buyCollections: [],
    getProducts: [],
    multiApply: false,
    discountCode: generateDiscountCode(),
    discountType: "free",
    discountValue: null,
    combineProductDiscounts: false,
    combineOrderDiscounts: false,
    combineShippingDiscounts: false,
    customerEligibility: "allCustomers",

    // Widget Setting
    giftSelectionMethod: "customerChooses",
    showPromotionCard: true,
    autoDisableWhenOOS: false,

    // Promotion Badge
    promotionBadgeEnabled: true,
    promotionBadgeText: "🎁 FREE GIFT!!",

    // Widget Setting (Congrats bar / Pop-up)
    congratsBarTitle: "A free gift has been added to your cart!",
    congratsBarDuration: 5,
    popupTitle: "You've unlocked a free gift!",
    popupDescription: "Choose your free gift below and add it to your cart before checkout.",

    // Out-of-stock message
    showOosMessage: false,
    oosMessage: "Sorry, the free gift is currently unavailable due to limited stock.",

    // Meta
    isActive: true,
    shopifyDiscountId: null, // Shopify Admin API discount node ID
  };
}

/** Backward-compat: old single-campaign shape → campaigns array */
function getDefaultState() {
  return getDefaultCampaignFields();
}

const STORAGE_KEY = "free-gift-campaign";
const CAMPAIGNS_STORAGE_KEY = "free-gift-campaigns";

/** Load campaigns array from localStorage (handles migration from old single-campaign format) */
function loadCampaignsFromStorage() {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(CAMPAIGNS_STORAGE_KEY);
    if (stored) return JSON.parse(stored);

    // Migrate old single-campaign format
    const legacy = localStorage.getItem(STORAGE_KEY);
    if (legacy) {
      const old = JSON.parse(legacy);
      const migrated = { ...getDefaultCampaignFields(), ...old, id: generateId() };
      const arr = [migrated];
      localStorage.setItem(CAMPAIGNS_STORAGE_KEY, JSON.stringify(arr));
      return arr;
    }

    // Seed default demo campaign on first visit
    const demo = [getDefaultDemoCampaign()];
    localStorage.setItem(CAMPAIGNS_STORAGE_KEY, JSON.stringify(demo));
    return demo;
  } catch (e) {
    console.error("Failed to load campaigns:", e);
  }
  return [];
}

function saveCampaignsToStorage(campaigns) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CAMPAIGNS_STORAGE_KEY, JSON.stringify(campaigns));
  } catch (e) {
    console.error("Failed to save campaigns:", e);
  }
}

/** Backward-compat: used by free-gift.js */
function loadFromStorage() {
  const campaigns = loadCampaignsFromStorage();
  const active = campaigns.find((c) => c.isActive && c.campaignType === "freeGift");
  return active || null;
}

/* ── Campaign fields that should NOT be persisted (action names) ── */
const ACTION_KEYS = [
  "setField",
  "saveCampaign",
  "loadCampaigns",
  "resetEditor",
  "addBuyProduct",
  "removeBuyProduct",
  "addBuyCollection",
  "removeBuyCollection",
  "addGetProduct",
  "removeGetProduct",
  "updateGetProductQuantity",
  "regenerateDiscountCode",
  "regenerateOfferTitle",
  "editCampaign",
  "createNewCampaign",
  "deleteCampaign",
  "toggleCampaignActive",
  "campaigns",
  "editingCampaignId",
  "syncDefaultCampaignDiscount",
  // legacy
  "loadCampaign",
  "resetCampaign",
];

/** Extract only campaign data fields from store state */
function extractCampaignFields(state) {
  const fields = {};
  for (const key of Object.keys(state)) {
    if (!ACTION_KEYS.includes(key)) {
      fields[key] = state[key];
    }
  }
  return fields;
}

const useCampaignStore = create((set, get) => ({
  // ── Campaigns list ──
  campaigns: [],
  editingCampaignId: null,

  // ── Current editor fields (form state) ──
  ...getDefaultCampaignFields(),

  // ── Field setter ──
  setField: (field, value) => {
    set({ [field]: value });
  },

  // ── Load all campaigns from storage ──
  loadCampaigns: () => {
    const campaigns = loadCampaignsFromStorage();
    set({ campaigns });
  },

  // ── Create new campaign (reset editor) ──
  createNewCampaign: () => {
    set({
      ...getDefaultCampaignFields(),
      editingCampaignId: null,
    });
  },

  // ── Load existing campaign into editor ──
  editCampaign: (id) => {
    const { campaigns } = get();
    const campaign = campaigns.find((c) => c.id === id);
    if (!campaign) return;
    const fields = { ...campaign };
    delete fields.id;
    set({ ...fields, editingCampaignId: id });
  },

  // ── Save current editor fields to campaigns array ──
  saveCampaign: () => {
    const state = get();
    const { campaigns, editingCampaignId } = state;
    const fields = extractCampaignFields(state);

    let updated;
    if (editingCampaignId) {
      // Update existing
      updated = campaigns.map((c) =>
        c.id === editingCampaignId ? { ...fields, id: editingCampaignId } : c
      );
    } else {
      // Create new
      const newId = generateId();
      updated = [...campaigns, { ...fields, id: newId }];
      set({ editingCampaignId: newId });
    }

    set({ campaigns: updated });
    saveCampaignsToStorage(updated);
  },

  // ── Delete campaign ──
  deleteCampaign: (id) => {
    const { campaigns } = get();
    const updated = campaigns.filter((c) => c.id !== id);
    set({ campaigns: updated });
    saveCampaignsToStorage(updated);
  },

  // ── Toggle active (one active per type) ──
  toggleCampaignActive: (id) => {
    const { campaigns } = get();
    const target = campaigns.find((c) => c.id === id);
    if (!target) return;

    const willBeActive = !target.isActive;

    const updated = campaigns.map((c) => {
      if (c.id === id) {
        return { ...c, isActive: willBeActive };
      }
      // Deactivate other campaigns of the same type
      if (willBeActive && c.campaignType === target.campaignType && c.isActive) {
        return { ...c, isActive: false };
      }
      return c;
    });

    set({ campaigns: updated });
    saveCampaignsToStorage(updated);
  },

  // ── Product actions (for editor form) ──
  addBuyProduct: (product) => {
    const { buyProducts } = get();
    if (buyProducts.find((p) => p.productId === product.productId)) return;
    set({ buyProducts: [...buyProducts, product] });
  },

  removeBuyProduct: (productId) => {
    const { buyProducts } = get();
    set({ buyProducts: buyProducts.filter((p) => p.productId !== productId) });
  },

  addBuyCollection: (collection) => {
    const { buyCollections } = get();
    if (buyCollections.find((c) => c.collectionId === collection.collectionId)) return;
    set({ buyCollections: [...buyCollections, collection] });
  },

  removeBuyCollection: (collectionId) => {
    const { buyCollections } = get();
    set({ buyCollections: buyCollections.filter((c) => c.collectionId !== collectionId) });
  },

  addGetProduct: (product) => {
    const { getProducts } = get();
    if (getProducts.find((p) => p.productId === product.productId)) return;
    set({ getProducts: [...getProducts, { ...product, giftQuantity: 1 }] });
  },

  removeGetProduct: (productId) => {
    const { getProducts } = get();
    set({ getProducts: getProducts.filter((p) => p.productId !== productId) });
  },

  updateGetProductQuantity: (productId, quantity) => {
    const { getProducts } = get();
    set({
      getProducts: getProducts.map((p) =>
        p.productId === productId ? { ...p, giftQuantity: Math.max(1, quantity) } : p
      ),
    });
  },

  regenerateDiscountCode: () => {
    set({ discountCode: generateDiscountCode() });
  },

  regenerateOfferTitle: () => {
    set({ offerTitle: generateOfferTitle() });
  },

  // ── Sync default campaign discount to Shopify (called once on first visit) ──
  syncDefaultCampaignDiscount: async () => {
    const { campaigns } = get();
    // Find campaigns that need a Shopify discount created
    const needsSync = campaigns.filter(
      (c) => c.isActive && !c.shopifyDiscountId
    );
    if (needsSync.length === 0) return;

    for (const campaign of needsSync) {
      try {
        const res = await fetch("/api/discount", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "create",
            campaign: {
              offerTitle: campaign.offerTitle,
              discountCode: campaign.discountCode,
              discountType: campaign.discountType,
              discountValue: campaign.discountValue,
              startDate: campaign.startDate,
              startTime: campaign.startTime,
              hasEndDate: campaign.hasEndDate,
              endDate: campaign.endDate,
              endTime: campaign.endTime,
              minimumQuantity: campaign.minimumQuantity,
              buyConditionType: campaign.buyConditionType,
              buyProducts: campaign.buyProducts,
              buyCollections: campaign.buyCollections,
              getProducts: campaign.getProducts,
              multiApply: campaign.multiApply,
              combineProductDiscounts: campaign.combineProductDiscounts,
              combineOrderDiscounts: campaign.combineOrderDiscounts,
              combineShippingDiscounts: campaign.combineShippingDiscounts,
            },
          }),
        });

        const result = await res.json();
        if (res.ok && result.discountId) {
          // Update campaign with the new Shopify discount ID
          const updated = get().campaigns.map((c) =>
            c.id === campaign.id
              ? { ...c, shopifyDiscountId: result.discountId }
              : c
          );
          set({ campaigns: updated });
          saveCampaignsToStorage(updated);
        }
      } catch (err) {
        console.error("Failed to create default discount:", err);
      }
    }
  },

  // ── Legacy aliases ──
  loadCampaign: () => {
    get().loadCampaigns();
  },
  resetCampaign: () => {
    get().createNewCampaign();
  },
  resetEditor: () => {
    get().createNewCampaign();
  },
}));

export default useCampaignStore;
export { STORAGE_KEY, CAMPAIGNS_STORAGE_KEY, loadFromStorage, getDefaultState, loadCampaignsFromStorage };
