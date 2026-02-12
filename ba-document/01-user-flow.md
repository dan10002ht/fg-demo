# Nhiệm vụ 1: Luồng hoạt động (User Flow)

## Bối cảnh

Chủ shop trên Shopify muốn triển khai chương trình khuyến mãi "Buy X Get Y" (Free Gift). Admin cấu hình campaign trên trang admin, chọn sản phẩm trigger và quà tặng. Khách hàng mua sản phẩm đủ điều kiện sẽ được tặng quà miễn phí (hoặc giảm giá).

Có 2 phương thức nhận quà:
- **Customer Chooses**: Khách tự chọn quà từ popup
- **Automatically**: Quà tự động thêm vào giỏ

---

## Flow A: Customer Chooses (Khách tự chọn quà)

### Bước 1: Khách vào trang sản phẩm (PDP)

- Hiển thị thông tin sản phẩm bình thường
- Nếu sản phẩm nằm trong **"Customer buys"** của campaign đang active:
  - Hiển thị **Promotion Card** (nếu bật trong Widget Setting):
    ```
    ┌──────────────────────────────────────────────┐
    │  🎁 Buy this product and get a FREE gift!    │
    │     Choose from our selection of gifts.       │
    └──────────────────────────────────────────────┘
    ```

### Bước 2: Khách bấm "Add to Cart"

1. Sản phẩm trigger được thêm vào giỏ hàng
2. Hệ thống kiểm tra: Khách đã mua đủ **minimum quantity** chưa?
   - **Chưa đủ**: Không trigger gift. Hiển thị progress: "Mua thêm X sản phẩm để nhận quà tặng!"
   - **Đã đủ**: Mở **Gift Selection Popup**

### Bước 3: Gift Selection Popup

```
┌──────────────────────────────────────────────────────┐
│  🎁 Choose Your Free Gift!                           │
│  ─────────────────────────────────────────────────   │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │   IMG    │  │   IMG    │  │   IMG    │           │
│  │          │  │          │  │          │           │
│  │ Ski Wax  │  │ Gift Card│  │ Socks   │           │
│  │ ₫25      │  │ ₫10      │  │ ₫50     │           │
│  │          │  │          │  │         │           │
│  │[Add to   ]│  │[Add to   ]│  │[Add to  ]│           │
│  │[ Cart   ]│  │[ Cart   ]│  │[ Cart  ]│           │
│  └──────────┘  └──────────┘  └──────────┘           │
│                                                      │
│  [Close]                                             │
└──────────────────────────────────────────────────────┘
```

- Hiển thị danh sách sản phẩm quà từ config "Customer gets"
- Mỗi sản phẩm hiển thị: ảnh, tên, giá gốc (gạch ngang), nút "Add to Cart"
- Khách chọn sản phẩm → quà được thêm vào giỏ với discount đã cấu hình (Free / % / Fixed)

### Bước 4: Cart Drawer hiển thị

```
┌─────────────────────────────────────────┐
│  🛒 Your Cart                           │
│                                         │
│  ┌──────────────────────────────────┐   │
│  │  [IMG]  Snowboard Complete       │   │
│  │         Variant: Dawn            │   │
│  │         [-] 2 [+]      ₫1,400 🗑 │   │
│  └──────────────────────────────────┘   │
│                                         │
│  ┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐   │
│  │  [IMG]  🎁 Selling Plans Ski Wax │   │
│  │         FREE GIFT                │   │
│  │         ~~₫25~~ → FREE           │   │
│  │         Qty: 1 (locked)          │   │
│  └─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘   │
│                                         │
│  Discount: GIFT-XXXXXX         -₫25     │
│  Subtotal:                    ₫1,400    │
│  [        CHECKOUT         ]            │
└─────────────────────────────────────────┘
```

---

## Flow B: Automatically (Quà tự động thêm)

### Bước 1-2: Giống Flow A

### Bước 3: Congratulation Bar (thay vì popup)

Khi đủ điều kiện, quà tự động được thêm vào giỏ + hiển thị **Congratulation Bar**:

```
┌──────────────────────────────────────────────────────┐
│  🎉 Congratulations! You've earned a FREE gift!      │
│     Ski Wax has been added to your cart.             │
│                                              [✕]     │
└──────────────────────────────────────────────────────┘
        ↑ Tự động đóng sau 5 giây
        ↑ Có button ✕ cho phép đóng sớm
```

- Quà đầu tiên available được tự động thêm
- Nếu có nhiều gift products: thêm lần lượt theo config

### Bước 4: Cart Drawer hiển thị (giống Flow A)

---

## Flow chung: Thay đổi giỏ hàng

| Hành động | Kết quả |
|-----------|---------|
| Tăng SL trigger product đạt bội số mới (Multi-apply ON) | Thêm quà tặng mới. VD: Buy 2 Get 1, mua 4 → tặng 2 |
| Tăng SL trigger product (Multi-apply OFF) | Giữ nguyên số quà đã tặng |
| Giảm SL trigger product xuống dưới minimum | **Tự động xóa quà tặng khỏi giỏ** |
| Xóa trigger product hoàn toàn | **Tự động xóa quà tặng khỏi giỏ** |
| Cố chỉnh SL quà tặng | Không cho phép (UI locked) |
| Cố xóa quà tặng | Không cho phép (ẩn nút xóa) |

## Flow: Campaign hết hạn / inactive

| Tình huống | Xử lý |
|-----------|-------|
| Campaign chưa bắt đầu (schedule) | Không hiển thị promotion card, không trigger gift |
| Campaign đã hết hạn (end date đã qua) | Như trên |
| Campaign bị admin tắt | Như trên |
| Gift product hết hàng + auto-disable ON | Tự động tắt promotion card, không trigger gift |
| Gift product hết hàng + auto-disable OFF | Ẩn sản phẩm hết hàng khỏi popup, SP khác vẫn hiển thị |

---

## Sơ đồ Flow tổng quát

```
Khách vào PDP
     │
     ▼
Campaign active + SP trong "Customer buys"?
     │
  ┌──┴──┐
  NO   YES
  │     │
  ▼     ▼
Normal  Hiển thị Promotion Card
  │     │
  ▼     ▼
Add to Cart
     │
     ▼
Đủ minimum quantity?
     │
  ┌──┴──┐
  NO   YES
  │     │
  ▼     ▼
Show   Widget mode?
progress   │
     ┌─────┴─────┐
     │           │
  Customer   Automatic
  Chooses       │
     │           ▼
     ▼      Auto-add gift
  Gift      + Congrats bar
  Popup     (5s auto-close)
     │           │
     ▼           ▼
  Pick gift     │
     │           │
     └─────┬─────┘
           ▼
    Cart Drawer hiển thị
    (gift marked as FREE)
           │
           ▼
    Checkout (Shopify)
    Discount code applied
```
