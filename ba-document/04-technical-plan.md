# Nhiệm vụ 4: Kế hoạch triển khai Demo UI

## Tổng quan

Triển khai tính năng "Free Gift" trực tiếp vào codebase headless store hiện tại (Next.js + Shopify Storefront API + Zustand).

---

## Files cần tạo/sửa

| # | File | Action | Mô tả |
|---|------|--------|-------|
| 1 | `src/config/free-gift.json` | **TẠO MỚI** | File cấu hình rule quà tặng |
| 2 | `src/lib/free-gift.js` | **TẠO MỚI** | Core logic: kiểm tra trigger, thêm/xóa quà, check tồn kho |
| 3 | `src/store/cart-store.js` | **SỬA** | Hook vào addItem, removeItem, updateItemQuantity |
| 4 | `src/components/cart/cart-drawer.jsx` | **SỬA** | Hiển thị gift item với badge "FREE GIFT", ẩn nút +/-/🗑 |
| 5 | `src/components/product/product-info.jsx` | **SỬA** | Hiển thị banner quà tặng trên trang sản phẩm |
| 6 | `src/components/gift/gift-banner.jsx` | **TẠO MỚI** | Component banner quà tặng (reusable) |
| 7 | `src/app/admin/free-gift/page.js` | **TẠO MỚI** | Admin page cấu hình quà tặng |
| 8 | `src/lib/shopify.js` | **SỬA** | Thêm query `getProductByHandle` (đã có) - chỉ cần check availability |

---

## Chi tiết từng file

### 1. `src/config/free-gift.json` (TẠO MỚI)

Lưu trữ cấu hình mặc định cho demo:
```json
{
  "isActive": true,
  "triggerType": "productType",
  "triggerValue": "T-Shirt",
  "giftProductHandle": "socks-classic",
  "giftVariantId": null,
  "quantityMode": "fixed",
  "fixedQuantity": 1,
  "maxGiftQuantity": 1,
  "giftLabel": "Free Gift",
  "bannerText": "Buy this product and get FREE Socks!",
  "showBannerOnPDP": true
}
```

> Note: Cho demo, config sẽ được load từ file JSON. Admin page sẽ lưu override vào localStorage.

### 2. `src/lib/free-gift.js` (TẠO MỚI)

Các hàm chính:

| Function | Input | Output | Mô tả |
|----------|-------|--------|-------|
| `getFreeGiftConfig()` | - | Config object | Load config từ JSON + localStorage override |
| `isGiftTriggerProduct(product, config)` | product data, config | boolean | Kiểm tra SP có match trigger không |
| `getGiftVariantId(config)` | config | variantId hoặc null | Lấy variant ID của quà tặng, check availability |
| `calculateGiftQuantity(triggerQty, config)` | số lượng trigger, config | number | Tính số quà cần tặng |
| `isGiftLineItem(lineItem, giftVariantId)` | cart line, variant ID | boolean | Kiểm tra line item có phải quà tặng không |
| `findGiftLineInCart(cartLines, giftVariantId)` | cart lines array, variant ID | line item hoặc null | Tìm gift line item trong cart |
| `countTriggerProducts(cartLines, config)` | cart lines, config | number | Đếm SL sản phẩm trigger trong giỏ |

### 3. `src/store/cart-store.js` (SỬA)

Thay đổi chính:

**addItem():**
```
Sau khi add product thành công
  → Load free gift config
  → Kiểm tra product vừa add có phải trigger không
  → Nếu YES:
    → Check gift còn hàng không
    → Tính số lượng gift cần thêm
    → Auto-add gift vào cart
  → Nếu NO: không làm gì thêm
```

**removeItem():**
```
Sau khi remove product thành công
  → Kiểm tra còn trigger product nào trong cart không
  → Nếu KHÔNG CÒN trigger nào:
    → Tìm và remove gift line item khỏi cart
  → Nếu VẪN CÒN trigger:
    → Recalculate gift quantity (nếu per-item mode)
```

**updateItemQuantity():**
```
Sau khi update thành công
  → Nếu quantity = 0 (xóa): xử lý như removeItem
  → Nếu quantity thay đổi + product là trigger:
    → Recalculate gift quantity
    → Update gift line item quantity trong cart
```

### 4. `src/components/cart/cart-drawer.jsx` (SỬA)

Thay đổi trong CartItem component:
- Nhận thêm prop `isGift` (boolean)
- Nếu `isGift = true`:
  - Hiển thị badge "🎁 FREE GIFT" (màu xanh/vàng)
  - Hiện giá: $0.00 (hoặc gạch giá gốc nếu có)
  - ẨN nút Minus (-), Plus (+)
  - ẨN nút Delete (🗑)
  - Thêm border-dashed hoặc background nhạt khác biệt
  - Tooltip: "This item is a free gift with your purchase"

### 5. `src/components/gift/gift-banner.jsx` (TẠO MỚI)

Component hiển thị banner quà tặng trên PDP:
```
Props: { bannerText, giftProduct }

UI:
┌─────────────────────────────────────────────┐
│  🎁  Buy this product and get FREE Socks!   │
│      [IMG: Socks thumbnail]                 │
└─────────────────────────────────────────────┘
```

Style:
- Background: bg-warm/5 hoặc bg-green-50
- Border: border-warm hoặc border-green-200
- Icon: Gift icon (from Lucide)
- Text: font-medium, text-sm

### 6. `src/components/product/product-info.jsx` (SỬA)

Thêm GiftBanner component ngay phía trên nút "Add to Cart":
- Load free gift config
- Kiểm tra product hiện tại có match trigger
- Nếu match + quà còn hàng → hiển thị GiftBanner
- Nếu không match hoặc quà hết hàng → không hiển thị

### 7. `src/app/admin/free-gift/page.js` (TẠO MỚI)

Admin page với form cấu hình:
- Toggle Active/Inactive
- Radio buttons cho Trigger Type
- Text input cho Trigger Value
- Product search/select cho Gift Product
- Radio buttons cho Quantity Mode
- Number inputs cho quantities
- Text inputs cho display settings
- Save button → lưu vào localStorage
- Load defaults từ `free-gift.json`

---

## Flow kỹ thuật chi tiết

```
┌────────────────────────────────────────────────────┐
│                   ADD TO CART                        │
│                                                    │
│  User clicks "Add to Cart"                         │
│         │                                          │
│         ▼                                          │
│  cart-store.addItem(variantId)                     │
│         │                                          │
│         ▼                                          │
│  Shopify API: cartLinesAdd(Áo Thun)               │
│         │                                          │
│         ▼                                          │
│  Updated cart returned                             │
│         │                                          │
│         ▼                                          │
│  free-gift.js: getFreeGiftConfig()                 │
│         │                                          │
│         ▼                                          │
│  Check: product matches trigger?                   │
│         │                                          │
│     ┌───┴───┐                                      │
│    YES     NO ──→ Done (set cart state)            │
│     │                                              │
│     ▼                                              │
│  free-gift.js: getGiftVariantId()                  │
│  → Fetch gift product from Shopify                 │
│  → Check availableForSale                          │
│         │                                          │
│     ┌───┴───┐                                      │
│  Available  Unavailable ──→ Toast("gift OOS")     │
│     │                         → Done              │
│     ▼                                              │
│  calculateGiftQuantity()                           │
│         │                                          │
│         ▼                                          │
│  Check: gift already in cart?                      │
│         │                                          │
│     ┌───┴───┐                                      │
│    YES     NO                                      │
│     │       │                                      │
│     ▼       ▼                                      │
│  updateCart  addToCart                              │
│  (adjust    (add gift                              │
│   qty)       line)                                 │
│     │       │                                      │
│     └───┬───┘                                      │
│         ▼                                          │
│  Set cart state + open drawer                      │
└────────────────────────────────────────────────────┘
```

---

## Giải pháp kỹ thuật cho "Giá $0.00"

Vì Shopify Storefront API **không cho phép set giá tùy ý** khi thêm vào cart, có 2 cách tiếp cận:

### Cách 1: Tạo variant giá $0 trên Shopify (Khuyến nghị cho demo)
- Tạo 1 variant của sản phẩm Tất với giá = $0.00
- Hoặc tạo 1 sản phẩm "Gift - Socks" riêng với giá $0.00
- Config `giftVariantId` trỏ tới variant $0 này

### Cách 2: Sử dụng Automatic Discount trên Shopify
- Tạo Automatic Discount 100% cho sản phẩm Tất khi mua kèm Áo
- Cart hiển thị giá gốc + discount line
- Phức tạp hơn nhưng chuyên nghiệp hơn

### Cách 3: Hiển thị $0.00 ở client-side (cho demo nhanh)
- Thêm quà vào cart với giá gốc
- Phía client (CartDrawer) hiển thị $0.00 cho gift items
- **Lưu ý:** Giá thực tế ở checkout vẫn tính đầy đủ → cần kết hợp với discount code

**Đề xuất cho demo: Cách 1** - Đơn giản nhất, hoạt động end-to-end.

---

## Test Plan

| # | Test Case | Expected Result | Priority |
|---|-----------|-----------------|----------|
| 1 | Add T-Shirt vào cart | Socks tự động xuất hiện với label "FREE GIFT" | HIGH |
| 2 | Remove T-Shirt khỏi cart | Socks tự động bị xóa | HIGH |
| 3 | Add 2 T-Shirts (Fixed mode) | Chỉ có 1 Socks | HIGH |
| 4 | Gift product hết hàng | Chỉ add T-Shirt + toast "out of stock" | HIGH |
| 5 | Quick Add T-Shirt từ Product Grid | Gift vẫn được trigger | MEDIUM |
| 6 | Toggle rule Off trong Admin | Không có gift khi add to cart | MEDIUM |
| 7 | Thay đổi gift product trong Admin | Gift mới được áp dụng | MEDIUM |
| 8 | Per Item mode: Add 3 T-Shirts | 3 Socks (hoặc max nếu set) | MEDIUM |
| 9 | Gift item không cho chỉnh SL | Nút +/- và 🗑 bị ẩn | HIGH |
| 10 | Refresh page với cart có gift | Gift vẫn hiển thị đúng | MEDIUM |
| 11 | Banner hiển thị trên PDP | Banner quà tặng xuất hiện đúng | MEDIUM |
| 12 | Checkout flow | Gift đi cùng vào Shopify checkout | HIGH |
