# Nhiệm vụ 1: Luồng hoạt động (User Flow)

## Bối cảnh
Khách hàng vào web shop thời trang, mua Áo Thun (T-Shirt) và được tặng kèm đôi Tất (Socks) miễn phí tự động.

---

## User Flow chi tiết

### Bước 1: Khách vào trang sản phẩm Áo Thun

- Khách truy cập trang chi tiết sản phẩm (Product Detail Page - PDP)
- Hiển thị đầy đủ thông tin sản phẩm: hình ảnh, giá, mô tả, variant (size, màu...)
- **Điểm khác biệt:** Xuất hiện một **banner quà tặng** ngay phía trên nút "Add to Cart":
  ```
  ┌────────────────────────────────────────────┐
  │  🎁 Mua sản phẩm này được TẶNG KÈM       │
  │     1 đôi Tất Classic miễn phí!           │
  └────────────────────────────────────────────┘
  ```
- Banner này chỉ hiển thị khi:
  - Rule quà tặng đang **Active**
  - Sản phẩm hiện tại **match** với trigger rule
  - Quà tặng **còn hàng** trong kho

### Bước 2: Khách bấm "Add to Cart"

Khi khách bấm nút "Add to Cart", hệ thống thực hiện tuần tự:

1. **Thêm Áo Thun vào giỏ** → Gọi Shopify Cart API `cartLinesAdd`
2. **Kiểm tra trigger** → App nhận diện Áo Thun là sản phẩm kích hoạt quà tặng
3. **Kiểm tra tồn kho quà** → App query Shopify để check Tất còn hàng không
4. **Kết quả:**
   - **Nếu Tất CÒN HÀNG:** Tự động thêm 1 đôi Tất vào giỏ với giá $0.00 → Mở Cart Drawer
   - **Nếu Tất HẾT HÀNG:** Chỉ thêm Áo Thun → Mở Cart Drawer + hiện toast thông báo: *"Free gift is currently out of stock"*

### Bước 3: Cart Drawer mở ra

Khách thấy giỏ hàng với 2 items (hoặc 1 nếu quà hết hàng):

```
┌─────────────────────────────────────────┐
│  🛒 Your Cart                           │
│                                         │
│  ┌──────────────────────────────────┐   │
│  │  [IMG]  Áo Thun Classic          │   │
│  │         Size: M                  │   │
│  │         [-] 1 [+]      $25.00 🗑 │   │
│  └──────────────────────────────────┘   │
│                                         │
│  ┌──────────────────────────────────┐   │
│  │  [IMG]  🎁 Tất Classic           │   │
│  │         FREE GIFT                │   │
│  │         Qty: 1         $0.00     │   │
│  │  (không có nút +/- và 🗑)        │   │
│  └──────────────────────────────────┘   │
│                                         │
│  Subtotal:                    $25.00    │
│  Shipping & tax at checkout             │
│  [        CHECKOUT         ]            │
└─────────────────────────────────────────┘
```

**Đặc điểm hiển thị quà tặng:**
- Badge "🎁 FREE GIFT" nổi bật (màu xanh/vàng)
- Giá hiển thị: $0.00 (hoặc gạch giá gốc ~~$5.00~~ → FREE)
- **KHÔNG** hiển thị nút tăng/giảm số lượng
- **KHÔNG** hiển thị nút xóa (🗑)
- Background/border khác biệt để phân biệt với sản phẩm thường

### Bước 4: Khách thay đổi giỏ hàng

| Hành động | Kết quả |
|-----------|---------|
| Tăng SL Áo Thun (1→2) | Tùy cấu hình: giữ 1 Tất (Fixed mode) hoặc tăng lên 2 Tất (Per Item mode) |
| Giảm SL Áo Thun (2→1) | Tùy cấu hình: giữ 1 Tất hoặc giảm về 1 Tất |
| Xóa Áo Thun khỏi giỏ | **Tất tự động bị xóa khỏi giỏ** |
| Thêm sản phẩm khác (không phải trigger) | Không ảnh hưởng đến quà tặng |
| Cố gắng chỉnh SL quà tặng | Không cho phép (UI không hiển thị nút chỉnh) |

### Bước 5: Khách bấm "Checkout"

- Redirect tới Shopify Hosted Checkout
- Giỏ hàng chuyển đi gồm: Áo Thun (giá đầy đủ) + Tất ($0.00)
- Shopify xử lý thanh toán, shipping, tax bình thường
- Khách thanh toán và hoàn tất đơn hàng

---

## Sơ đồ Flow tổng quát

```
Khách vào PDP (Áo Thun)
       │
       ▼
  Thấy banner quà tặng
       │
       ▼
  Bấm "Add to Cart"
       │
       ├── Thêm Áo Thun vào Cart ────────────────────┐
       │                                               │
       ▼                                               ▼
  Check quà còn hàng?                           Cart Drawer mở
       │                                               │
   ┌───┴───┐                                           │
   │       │                                           │
  YES     NO                                           │
   │       │                                           │
   ▼       ▼                                           │
 Thêm   Toast                                         │
 Tất    "hết quà"                                     │
 $0.00    │                                            │
   │      │                                            │
   └──────┴────────────────────────────────────────────┘
                        │
                        ▼
              Khách xem giỏ hàng
                        │
            ┌───────────┼───────────┐
            │           │           │
            ▼           ▼           ▼
        Xóa Áo     Đổi SL Áo   Checkout
            │           │           │
            ▼           ▼           ▼
      Auto xóa    Recalc gift   Shopify
        Tất        quantity     Checkout
```

---

## Edge Cases

| # | Tình huống | Xử lý |
|---|-----------|-------|
| 1 | Khách Quick Add từ Product Grid (không vào PDP) | Vẫn trigger quà tặng bình thường |
| 2 | Khách add Áo Thun 2 lần liên tiếp | Lần 2 chỉ tăng SL Áo, quà tặng recalculate theo config |
| 3 | Khách refresh trang khi đã có giỏ hàng | Cart restore từ localStorage, quà tặng vẫn giữ nguyên |
| 4 | Quà hết hàng SAU KHI đã thêm vào giỏ | Giữ nguyên trong giỏ (đã được "reserve" bởi Shopify Cart) |
| 5 | Nhiều rule quà tặng cùng lúc | Phase 1: Chỉ hỗ trợ 1 rule. Phase 2: Mở rộng nhiều rule |
