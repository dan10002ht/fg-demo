# Nhiệm vụ 4: Kế hoạch triển khai Demo UI

## Tổng quan

Triển khai tính năng "Buy X Get Y" (Free Gift Campaign) vào codebase headless store hiện tại. Gồm 2 phần chính:
- **Admin**: Trang Campaign Setup & Widget Setting (Shopify Polaris)
- **Storefront**: Gift logic, promotion card, gift popup, congratulation bar

---

## Dependencies cần thêm

| Package | Version | Mục đích |
|---------|---------|----------|
| `@shopify/polaris` | Latest | UI components cho Admin pages |
| `@shopify/polaris-icons` | Latest | Icons cho Polaris |

---

## Files cần tạo/sửa

### Tạo mới

| # | File | Mô tả |
|---|------|-------|
| 1 | `src/app/admin/free-gift/page.js` | Admin layout: 2 tabs + routing |
| 2 | `src/components/admin/campaign-setting.jsx` | Tab 1: Campaign Setting form |
| 3 | `src/components/admin/widget-setting.jsx` | Tab 2: Widget Setting form |
| 4 | `src/components/admin/campaign-summary.jsx` | Summary sidebar (1/3 phải) |
| 5 | `src/components/admin/browse-products-modal.jsx` | Modal browse & search products (Polaris) |
| 6 | `src/components/admin/offer-title-modal.jsx` | Modal edit offer title |
| 7 | `src/components/admin/selected-products-list.jsx` | Danh sách SP đã chọn (Customer buys/gets) |
| 8 | `src/components/admin/polaris-provider.jsx` | Polaris AppProvider wrapper |
| 9 | `src/lib/free-gift.js` | Core logic: campaign check, gift calculation, schedule validation |
| 10 | `src/lib/campaign-store.js` | Zustand store cho campaign config (persist to localStorage) |
| 11 | `src/components/gift/gift-popup.jsx` | Popup chọn quà (mode: Customer chooses) |
| 12 | `src/components/gift/congratulation-bar.jsx` | Congratulation bar (mode: Automatically) |
| 13 | `src/components/gift/promotion-card.jsx` | Promotion card trên PDP |

### Sửa

| # | File | Thay đổi |
|---|------|----------|
| 14 | `src/store/cart-store.js` | Hook vào add/remove/update → auto add/remove gift |
| 15 | `src/components/cart/cart-drawer.jsx` | Hiển thị gift item khác biệt (badge, locked qty, ẩn remove) |
| 16 | `src/components/product/product-info.jsx` | Đã có gift banner, cập nhật logic campaign mới |
| 17 | `src/lib/shopify.js` | Thêm query getCollections nếu cần |

---

## Chi tiết từng module

### Module 1: Admin Page (`/admin/free-gift`)

#### Layout structure:
```
page.js
├── PolarisProvider
│   ├── Tabs (Campaign Setting | Widget Setting)
│   ├── Tab 1: CampaignSetting + CampaignSummary (layout 2-1)
│   └── Tab 2: WidgetSetting + WidgetPreview (layout 2-1)
```

#### CampaignSetting component:
- **OfferTitle**: Text display + edit button → OfferTitleModal
- **Schedule**: DatePicker + TimePicker, checkbox "Set end date"
- **CustomerBuys**: NumberInput (min qty) + Select (products/collections) + BrowseProductsModal
- **CustomerGets**: BrowseProductsModal + SelectedProductsList (với gift qty edit + remove)
- **Options**: Multi-apply toggle, Discount config, Combinations checkboxes, Eligibility select

#### BrowseProductsModal component:
- Fetch products từ Shopify Storefront API (realtime)
- Search bar (filter client-side hoặc re-query)
- Product list với expandable variants
- Checkbox multi-select
- Show availability status + price cho mỗi variant
- Footer: "Selected: X products" + Cancel/Confirm buttons

#### CampaignSummary component:
- Reactive summary từ campaign state
- Hiển thị: status, schedule, trigger products, gift products, discount info, eligibility

### Module 2: Campaign Store (`src/lib/campaign-store.js`)

Zustand store với persist middleware (localStorage):

```javascript
{
  // Campaign Setting
  offerTitle: String,
  startDate: Date,
  startTime: String,
  hasEndDate: Boolean,
  endDate: Date | null,
  endTime: String,
  minimumQuantity: Number,
  buyConditionType: 'specificProducts' | 'specificCollections',
  buyProducts: Array<BuyProduct>,
  buyCollections: Array<Collection>,
  getProducts: Array<GiftProduct>,
  multiApply: Boolean,
  discountCode: String,
  discountType: 'free' | 'percentage' | 'fixedAmount',
  discountValue: Number | null,
  combineProductDiscounts: Boolean,
  combineOrderDiscounts: Boolean,
  combineShippingDiscounts: Boolean,
  customerEligibility: String,

  // Widget Setting
  giftSelectionMethod: 'customerChooses' | 'automatically',
  showPromotionCard: Boolean,
  autoDisableWhenOOS: Boolean,

  // Actions
  saveCampaign: () => void,
  loadCampaign: () => void,
  resetCampaign: () => void,
  isCampaignActive: () => boolean,
}
```

### Module 3: Free Gift Logic (`src/lib/free-gift.js`)

Hàm chính:

| Function | Mô tả |
|----------|-------|
| `getCampaignConfig()` | Load campaign từ localStorage |
| `isCampaignActive(config)` | Check schedule + active status |
| `isProductInBuyCondition(product, config)` | Check product match trigger conditions |
| `calculateGiftQuantity(triggerQty, config)` | Tính số quà dựa trên min qty + multi-apply |
| `getAvailableGifts(config)` | Fetch & filter gift products còn hàng |
| `isGiftLineItem(lineItem, config)` | Check line item có phải gift không |
| `generateDiscountCode()` | Generate random GIFT-XXXXXX code |

### Module 4: Cart Store Updates

```
addItem() → after success:
  1. getCampaignConfig()
  2. isCampaignActive()?
  3. isProductInBuyCondition()?
  4. Count trigger items in cart
  5. triggerQty >= minimumQuantity?
  6. calculateGiftQuantity()
  7. Widget mode?
     - "customerChooses" → set showGiftPopup = true
     - "automatically" → auto-add gift + set showCongratBar = true

removeItem() / updateItemQuantity() → after success:
  1. Count remaining trigger items
  2. triggerQty < minimumQuantity? → remove all gifts
  3. Recalculate gift qty if multi-apply ON
```

New state fields:
```javascript
{
  showGiftPopup: false,      // Control gift selection popup
  showCongratBar: false,     // Control congratulation bar
  giftLineIds: [],           // Track which line items are gifts
}
```

### Module 5: Storefront Components

#### GiftPopup (`src/components/gift/gift-popup.jsx`):
- Modal/Dialog overlay
- Fetch gift products từ config
- Grid display: image, title, price (crossed out), "Add to Cart" button
- Close button
- Triggered by cart-store `showGiftPopup`

#### CongratulationBar (`src/components/gift/congratulation-bar.jsx`):
- Fixed position bar (top of page hoặc bottom)
- Animation: slide in from top
- Auto-dismiss after 5 seconds (setTimeout)
- Close button (✕)
- Message: "Congratulations! [Gift Name] has been added to your cart."
- Triggered by cart-store `showCongratBar`

#### PromotionCard (`src/components/gift/promotion-card.jsx`):
- Banner component trên PDP
- Check campaign active + product in buy condition
- Animated appear (Framer Motion)
- Icon + text message

### Module 6: Cart Drawer Updates

Gift items in cart drawer:
- Badge: "🎁 FREE GIFT" (emerald green)
- Price: Giá gốc gạch ngang + "FREE" (hoặc discount amount)
- Quantity: Locked (ẩn +/- buttons)
- Remove: Ẩn nút xóa (🗑)
- Border: dashed border để phân biệt
- Tooltip: "This is a free gift with your purchase"

---

## Flow kỹ thuật

```
┌─────────────────────────────────────────────────────┐
│                    ADD TO CART                        │
│                                                     │
│  addItem(variantId, qty)                            │
│         │                                           │
│         ▼                                           │
│  Shopify: cartLinesAdd                              │
│         │                                           │
│         ▼                                           │
│  Updated cart returned                              │
│         │                                           │
│         ▼                                           │
│  Campaign active? ────── NO → done                  │
│         │                                           │
│        YES                                          │
│         │                                           │
│         ▼                                           │
│  Product in buy condition? ── NO → done             │
│         │                                           │
│        YES                                          │
│         │                                           │
│         ▼                                           │
│  Count trigger items in cart                        │
│         │                                           │
│         ▼                                           │
│  triggerQty >= minQty? ──── NO → show progress      │
│         │                                           │
│        YES                                          │
│         │                                           │
│         ▼                                           │
│  calculateGiftQuantity()                            │
│         │                                           │
│         ▼                                           │
│  Widget mode?                                       │
│     ┌────┴────┐                                     │
│  Customer   Automatic                               │
│  Chooses       │                                    │
│     │          ▼                                    │
│     │    getAvailableGifts()                        │
│     │          │                                    │
│     │          ▼                                    │
│     │    Auto-add to cart                           │
│     │    (client-side $0 display)                   │
│     │          │                                    │
│     │          ▼                                    │
│     │    Show CongratulationBar                     │
│     │    (auto-close 5s)                            │
│     │                                               │
│     ▼                                               │
│  Show GiftPopup                                     │
│  User picks gift → add to cart                      │
│         │                                           │
│         ▼                                           │
│  Apply discount code (cartDiscountCodesUpdate)      │
│         │                                           │
│         ▼                                           │
│  Cart re-render with gift items marked              │
└─────────────────────────────────────────────────────┘
```

---

## Giải pháp giá $0.00 (Client-side Display)

Như đã thống nhất, demo sử dụng **Client-side display**:
- Gift item thêm vào Shopify cart với giá gốc
- Frontend CartDrawer hiển thị $0.00 (hoặc discounted price) cho gift items
- Tracking gift items bằng `giftLineIds` trong cart store
- Lưu ý: Checkout trên Shopify sẽ tính giá gốc (trừ khi dùng discount code)

Để giá đúng ở checkout:
- Dùng `cartDiscountCodesUpdate` để apply discount code tự động
- Discount code config sẽ map với Shopify Automatic Discount (nếu có)

---

## Test Plan

| # | Test Case | Expected | Priority |
|---|-----------|----------|----------|
| 1 | Admin: Save campaign config | Config lưu vào localStorage | HIGH |
| 2 | Admin: Browse & select products | Modal hiện products từ store, search works | HIGH |
| 3 | Admin: Switch tabs Campaign/Widget | Tab content thay đổi, data persist | MEDIUM |
| 4 | Storefront: PDP shows promotion card | Banner hiện cho trigger products | HIGH |
| 5 | Storefront: Add trigger product (Customer chooses) | Gift popup mở | HIGH |
| 6 | Storefront: Add trigger product (Automatically) | Gift auto-added + congrats bar | HIGH |
| 7 | Storefront: Remove trigger from cart | Gift auto-removed | HIGH |
| 8 | Storefront: Cart drawer shows gift correctly | Badge, $0, locked qty | HIGH |
| 9 | Storefront: Min qty not met | No gift triggered, progress shown | MEDIUM |
| 10 | Storefront: Multi-apply ON, increase qty | Gift qty increases | MEDIUM |
| 11 | Storefront: Gift OOS + autoDisable ON | Promotion card hidden | MEDIUM |
| 12 | Storefront: Campaign expired | No gift triggered | MEDIUM |
| 13 | Storefront: Congratulation bar auto-close | Bar closes after 5s | LOW |
| 14 | Storefront: Quick Add from grid | Gift still triggers | MEDIUM |
| 15 | Admin: Edit offer title modal | Title updates correctly | LOW |
| 16 | Admin: Schedule with end date | End date fields appear/hide | LOW |
