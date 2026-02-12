# Nhiệm vụ 2: Cấu hình App (Admin Settings)

## Tổng quan Layout

Layout dạng **2-1 split**: Khu vực chính (2/3) + Summary sidebar (1/3).
Gồm 2 Tab chính:
- **Tab 1: Campaign Setting** — Cấu hình điều kiện, sản phẩm, discount
- **Tab 2: Widget Setting** — Cấu hình cách hiển thị quà cho khách hàng

---

## TAB 1: CAMPAIGN SETTING

### Layout

```
┌────────────────────────────────────────────┬──────────────────┐
│           CAMPAIGN SETTING (2/3)           │  SUMMARY (1/3)   │
│                                            │                  │
│  ┌─ Offer Title ────────────────────┐      │  Campaign:       │
│  │  "Buy X Get Y - Feb 2026"  [✏️]  │      │  ● Active        │
│  └──────────────────────────────────┘      │                  │
│                                            │  Schedule:       │
│  ┌─ Schedule ───────────────────────┐      │  Feb 12, 2026    │
│  │  Start: [2026-02-12] [09:00]     │      │  → No end date   │
│  │  ☐ Set end date                  │      │                  │
│  │  End: [____-__-__] [__:__]       │      │  Trigger:        │
│  └──────────────────────────────────┘      │  2 products      │
│                                            │                  │
│  ┌─ Offer Conditions ──────────────────┐   │  Gift:           │
│  │                                     │   │  1 product       │
│  │  CUSTOMER BUYS                      │   │                  │
│  │  ................................   │   │  Discount:       │
│  │                                     │   │  Free (100%)     │
│  │  CUSTOMER GETS                      │   │                  │
│  │  ................................   │   │  Code:           │
│  │                                     │   │  GIFT-A1B2C3     │
│  └─────────────────────────────────────┘   │                  │
│                                            │                  │
│  ┌─ Options ────────────────────────────┐  │                  │
│  │  Multi-apply / Discount / Combos /   │  │                  │
│  │  Customer eligibility                │  │                  │
│  └──────────────────────────────────────┘  │                  │
│                                            │                  │
│  [💾 Save Campaign]                        │                  │
└────────────────────────────────────────────┴──────────────────┘
```

---

### A. Offer Title

| Field | Type | Mô tả |
|-------|------|-------|
| `offerTitle` | String | Tên campaign, tự động generate (vd: "Buy X Get Y - Feb 2026") |

- Hiển thị dạng text + button icon bút chì (✏️) bên cạnh
- Click button → mở **Modal Edit Offer Title**:
  ```
  ┌─────────────────────────────────────┐
  │  Edit Offer Title                   │
  │                                     │
  │  ┌───────────────────────────────┐  │
  │  │ Buy X Get Y - Feb 2026       │  │
  │  └───────────────────────────────┘  │
  │                                     │
  │  [Cancel]              [Save]       │
  └─────────────────────────────────────┘
  ```

---

### B. Schedule

| Field | Type | Required | Default | Mô tả |
|-------|------|----------|---------|-------|
| `startDate` | Date | Yes | Today | Ngày bắt đầu campaign |
| `startTime` | Time | Yes | "00:00" | Giờ bắt đầu |
| `hasEndDate` | Boolean (Checkbox) | No | false | Checkbox "Set end date" |
| `endDate` | Date | Conditional | null | Ngày kết thúc (chỉ hiện khi hasEndDate = true) |
| `endTime` | Time | Conditional | "23:59" | Giờ kết thúc |

- Mặc định chỉ hiện Start date/time
- Khi tick checkbox "Set end date" → hiện thêm End date/time fields
- End date phải sau Start date (validation)

```
┌─ Schedule ──────────────────────────────────────┐
│                                                 │
│  Start date          Start time                 │
│  ┌──────────────┐    ┌──────────┐               │
│  │ 2026-02-12   │    │ 09:00    │               │
│  └──────────────┘    └──────────┘               │
│                                                 │
│  ☐ Set end date                                 │
│                                                 │
│  (Khi checked:)                                 │
│  End date            End time                   │
│  ┌──────────────┐    ┌──────────┐               │
│  │ 2026-03-12   │    │ 23:59    │               │
│  └──────────────┘    └──────────┘               │
└─────────────────────────────────────────────────┘
```

---

### C. Offer Conditions

#### C1. Customer Buys

| Field | Type | Required | Mô tả |
|-------|------|----------|-------|
| `minimumQuantity` | Number (Input) | Yes | Số lượng tối thiểu khách cần mua để kích hoạt quà |
| `buyConditionType` | Enum (Select) | Yes | `specificProducts` hoặc `specificCollections` |
| `buyProducts` | Array\<Product\> | Conditional | Danh sách products đã chọn (khi type = specificProducts) |
| `buyCollections` | Array\<Collection\> | Conditional | Danh sách collections đã chọn (khi type = specificCollections) |

```
┌─ CUSTOMER BUYS ─────────────────────────────────────┐
│                                                     │
│  Customer buys at least:                            │
│  ┌──────┐                                           │
│  │  1   │  items                                    │
│  └──────┘                                           │
│                                                     │
│  From:                                              │
│  ┌─────────────────────────────┐                    │
│  │ Specific products        ▼  │                    │
│  └─────────────────────────────┘                    │
│                                                     │
│  [📦 Browse products]                                │
│                                                     │
│  Selected products:                                 │
│  ┌──────────────────────────────────────────────┐   │
│  │  [IMG] The Complete Snowboard                │   │
│  │        5 variants | ₫700          [✕]        │   │
│  │  [IMG] Selling Plans Ski Wax                 │   │
│  │        3 variants | ₫10 - ₫50     [✕]        │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

**Browse Products/Collections Modal** (Shopify Polaris):

```
┌──────────────────────────────────────────────────────┐
│  Browse Products                                      │
│                                                      │
│  ┌──────────────────────────────────────────────┐    │
│  │ 🔍 Search products...                        │    │
│  └──────────────────────────────────────────────┘    │
│                                                      │
│  ┌──────────────────────────────────────────────┐    │
│  │  ☐ The Complete Snowboard                    │    │
│  │     ├─ ☐ Ice        (Unavailable)  ₫700     │    │
│  │     ├─ ☑ Dawn       (Available)    ₫700     │    │
│  │     ├─ ☑ Powder     (Available)    ₫700     │    │
│  │     ├─ ☑ Electric   (Available)    ₫700     │    │
│  │     └─ ☑ Sunset     (Available)    ₫700     │    │
│  │                                              │    │
│  │  ☐ Selling Plans Ski Wax                     │    │
│  │     ├─ ☑ Ski Wax          (Available) ₫25   │    │
│  │     ├─ ☑ Special Ski Wax  (Available) ₫50   │    │
│  │     └─ ☑ Sample Ski Wax   (Available) ₫10   │    │
│  │                                              │    │
│  │  ☐ The Compare at Price Snowboard            │    │
│  │     └─ ☑ Default    (Available)    ₫786     │    │
│  │                                              │    │
│  │  ... (more products)                         │    │
│  └──────────────────────────────────────────────┘    │
│                                                      │
│  Selected: 2 products                                │
│  [Cancel]                              [Confirm]     │
└──────────────────────────────────────────────────────┘
```

- Thanh search để tìm kiếm products/collections
- Hiển thị products với variants (expandable)
- Mỗi variant hiển thị: tên, trạng thái (Available/Unavailable), giá
- Cho phép chọn nhiều products (checkbox)
- Khi chọn product → tự động chọn tất cả available variants

---

#### C2. Customer Gets

| Field | Type | Required | Mô tả |
|-------|------|----------|-------|
| `getProducts` | Array\<Product\> | Yes | Danh sách sản phẩm quà tặng |

- Sử dụng **cùng Browse Modal** như phần Customer buys
- Sau khi chọn, hiển thị sản phẩm bên dưới với thêm thông tin:

```
┌─ CUSTOMER GETS ─────────────────────────────────────┐
│                                                     │
│  Gift products:                                     │
│  [📦 Browse products]                                │
│                                                     │
│  ┌──────────────────────────────────────────────┐   │
│  │  [IMG]  Selling Plans Ski Wax                │   │
│  │         All variants (3 of 3)                │   │
│  │         Gift quantity: ┌──────┐              │   │
│  │                        │  1   │         [✕]  │   │
│  │                        └──────┘              │   │
│  ├──────────────────────────────────────────────┤   │
│  │  [IMG]  Gift Card                            │   │
│  │         2 of 4 variants                      │   │
│  │         Gift quantity: ┌──────┐              │   │
│  │                        │  1   │         [✕]  │   │
│  │                        └──────┘              │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

Mỗi gift product hiển thị:
- **Product image** (thumbnail)
- **Product name**
- **Variants info**: "All variants" hoặc "X of Y variants"
- **Gift quantity**: Input cho phép edit số lượng quà tặng cho SP này
- **Remove button** (✕): Xóa SP khỏi danh sách gift

---

### D. Options

#### D1. Multi-apply

| Field | Type | Default | Mô tả |
|-------|------|---------|-------|
| `multiApply` | Boolean (Toggle) | false | Nhân bội quà tặng theo số lượng mua |

```
┌─ Multi-apply ──────────────────────────────────────┐
│                                                    │
│  Multiply the gift "Y"                  [OFF/ON]   │
│  (e.g. "Buy 4 get 2", or "Buy 6 get 3")           │
│                                                    │
└────────────────────────────────────────────────────┘
```

- **OFF** (mặc định): Chỉ tặng 1 lần bất kể mua bao nhiêu
- **ON**: Tặng theo bội số. VD: min qty = 2, mua 6 → tặng 3 lần

#### D2. Discount Configuration

| Field | Type | Required | Mô tả |
|-------|------|----------|-------|
| `discountCode` | String | Yes | Mã giảm giá tự động tạo, cho phép sửa |
| `discountType` | Enum (Select) | Yes | `free`, `percentage`, `fixedAmount` |
| `discountValue` | Number (Input) | Conditional | Giá trị discount (khi type = percentage hoặc fixedAmount) |

```
┌─ Discount Configuration ──────────────────────────────┐
│                                                       │
│  Discount code:                                       │
│  ┌───────────────────────────────────┐                │
│  │ GIFT-A1B2C3                       │                │
│  └───────────────────────────────────┘                │
│  ℹ️ This code will be visible to customers in the cart │
│                                                       │
│  Discount value:                                      │
│  ┌─────────────────────────────┐                      │
│  │ Free                     ▼  │                      │
│  └─────────────────────────────┘                      │
│                                                       │
│  Options:                                             │
│  • Free (100% off)                                    │
│  • Percentage → ┌──────┐ %                            │
│                 │  50  │                              │
│                 └──────┘                              │
│  • Fixed amount → ┌──────────┐                        │
│                   │  ₫100    │                        │
│                   └──────────┘                        │
└───────────────────────────────────────────────────────┘
```

#### D3. Combinations

| Field | Type | Default | Mô tả |
|-------|------|---------|-------|
| `combineProductDiscounts` | Boolean (Checkbox) | false | Kết hợp với Product discounts khác |
| `combineOrderDiscounts` | Boolean (Checkbox) | false | Kết hợp với Order discounts |
| `combineShippingDiscounts` | Boolean (Checkbox) | false | Kết hợp với Shipping discounts |

```
┌─ Combinations ─────────────────────────────────────┐
│                                                    │
│  This discount can be combined with:               │
│                                                    │
│  ☐ Product discounts                               │
│  ☐ Order discounts                                 │
│  ☐ Shipping discounts                              │
└────────────────────────────────────────────────────┘
```

#### D4. Customer Eligibility

| Field | Type | Default | Mô tả |
|-------|------|---------|-------|
| `customerEligibility` | Enum (Select) | `allCustomers` | Ai đủ điều kiện nhận quà |

```
┌─ Customer Eligibility ─────────────────────────────┐
│                                                    │
│  ┌─────────────────────────────┐                   │
│  │ All customers            ▼  │                   │
│  └─────────────────────────────┘                   │
│                                                    │
│  Options:                                          │
│  • All customers                                   │
│  • Customer segment                                │
│  • Specific link                                   │
│  • Customer location                               │
│                                                    │
│  (Chi tiết cho từng option sẽ bổ sung sau)         │
└────────────────────────────────────────────────────┘
```

---

### E. Summary Sidebar (1/3 phải)

Hiển thị tóm tắt realtime cấu hình hiện tại:

```
┌─ Summary ──────────────────┐
│                            │
│  Campaign                  │
│  ● Active                  │
│                            │
│  Schedule                  │
│  Feb 12, 2026 09:00        │
│  → No end date             │
│                            │
│  Customer buys             │
│  At least 2 items from:    │
│  • Complete Snowboard      │
│  • Ski Wax                 │
│                            │
│  Customer gets             │
│  • Gift Card (x1)          │
│                            │
│  Discount                  │
│  Free (100% off)           │
│  Code: GIFT-A1B2C3         │
│                            │
│  Eligibility               │
│  All customers             │
│                            │
│  Combinations              │
│  None                      │
│                            │
└────────────────────────────┘
```

---

## TAB 2: WIDGET SETTING

### Layout

```
┌────────────────────────────────────────────┬──────────────────┐
│          WIDGET SETTING (2/3)              │  PREVIEW (1/3)   │
│                                            │                  │
│  ┌─ Gift Selection Method ──────────┐      │  (Live preview   │
│  │                                  │      │   of how widget  │
│  │  ● Customer chooses              │      │   will appear    │
│  │  ○ Automatically                 │      │   to customers)  │
│  │                                  │      │                  │
│  └──────────────────────────────────┘      │                  │
│                                            │                  │
│  ┌─ Promotion Card ─────────────────┐      │                  │
│  │                                  │      │                  │
│  │  Show promotion card:  [ON/OFF]  │      │                  │
│  │                                  │      │                  │
│  │  ☐ Auto-disable when gift        │      │                  │
│  │    products are out of stock     │      │                  │
│  │                                  │      │                  │
│  └──────────────────────────────────┘      │                  │
│                                            │                  │
│  [💾 Save Widget Settings]                 │                  │
└────────────────────────────────────────────┴──────────────────┘
```

### Fields

| Field | Type | Default | Mô tả |
|-------|------|---------|-------|
| `giftSelectionMethod` | Enum (Radio) | `customerChooses` | Cách khách nhận quà |
| `showPromotionCard` | Boolean (Toggle) | true | Hiển thị promotion card trên PDP |
| `autoDisableWhenOOS` | Boolean (Checkbox) | false | Tự động tắt khi quà hết hàng |

#### Gift Selection Method

| Method | Mô tả | Trải nghiệm khách hàng |
|--------|-------|------------------------|
| **Customer chooses** | Khách tự chọn quà từ danh sách | Mở popup hiển thị các gift products, khách pick và "Add to Cart" |
| **Automatically** | Quà tự động thêm khi đủ điều kiện | Hiển thị **Congratulation Bar** ở top page, tự động đóng sau 5 giây, có button ✕ đóng sớm |

#### Promotion Card

- **Toggle ON** (mặc định): Hiển thị banner quà tặng trên trang sản phẩm (PDP)
- **Toggle OFF**: Không hiển thị banner
- **Checkbox "Auto-disable when OOS"**: Khi TẤT CẢ gift products hết hàng → tự động tắt promotion card

### Preview Sidebar (1/3 phải)

Hiển thị preview realtime:
- Nếu method = "Customer chooses": Preview popup chọn quà
- Nếu method = "Automatically": Preview congratulation bar

---

## BẢNG TỔNG HỢP TẤT CẢ FIELDS

### Tab 1: Campaign Setting

| # | Field | Type | Required | Default | Section |
|---|-------|------|----------|---------|---------|
| 1 | `offerTitle` | String | Yes | Auto-gen | Offer Title |
| 2 | `startDate` | Date | Yes | Today | Schedule |
| 3 | `startTime` | Time | Yes | "00:00" | Schedule |
| 4 | `hasEndDate` | Boolean | No | false | Schedule |
| 5 | `endDate` | Date | Conditional | null | Schedule |
| 6 | `endTime` | Time | Conditional | "23:59" | Schedule |
| 7 | `minimumQuantity` | Number | Yes | 1 | Customer Buys |
| 8 | `buyConditionType` | Enum | Yes | "specificProducts" | Customer Buys |
| 9 | `buyProducts` | Array\<Product\> | Conditional | [] | Customer Buys |
| 10 | `buyCollections` | Array\<Collection\> | Conditional | [] | Customer Buys |
| 11 | `getProducts` | Array\<GiftProduct\> | Yes | [] | Customer Gets |
| 12 | `multiApply` | Boolean | No | false | Options |
| 13 | `discountCode` | String | Yes | Auto-gen | Discount |
| 14 | `discountType` | Enum | Yes | "free" | Discount |
| 15 | `discountValue` | Number | Conditional | null | Discount |
| 16 | `combineProductDiscounts` | Boolean | No | false | Combinations |
| 17 | `combineOrderDiscounts` | Boolean | No | false | Combinations |
| 18 | `combineShippingDiscounts` | Boolean | No | false | Combinations |
| 19 | `customerEligibility` | Enum | Yes | "allCustomers" | Eligibility |

### Tab 2: Widget Setting

| # | Field | Type | Required | Default | Section |
|---|-------|------|----------|---------|---------|
| 20 | `giftSelectionMethod` | Enum | Yes | "customerChooses" | Gift Selection |
| 21 | `showPromotionCard` | Boolean | No | true | Promotion Card |
| 22 | `autoDisableWhenOOS` | Boolean | No | false | Promotion Card |

### Data Types

```
GiftProduct = {
  productId: String,        // Shopify product ID
  handle: String,           // Product handle
  title: String,            // Product name
  image: String,            // Image URL
  selectedVariants: Array,  // Variants đã chọn (hoặc "all")
  giftQuantity: Number      // Số lượng tặng (mặc định: 1)
}

BuyProduct = {
  productId: String,
  handle: String,
  title: String,
  image: String,
  variantCount: Number,
  priceRange: String
}
```
