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
    congratsBarTitle: "Yay! Your cart with auto-added gifts is waiting - check now!",
    congratsBarDuration: 5,
    popupTitle: "Woohoo, a special surprise awaits!",
    popupDescription: "Your cart qualifies for special gifts. Add them now before checking out!",

    // Meta
    isActive: false,
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
