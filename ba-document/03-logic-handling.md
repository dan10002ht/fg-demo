# Nhiệm vụ 3: Xử lý tình huống (Logic)

## Trường hợp 1: Khách mua 2 cái Áo Thun → Tặng bao nhiêu Tất?

### Đề xuất: Tặng 1 đôi Tất (Fixed Mode - mặc định)

### Lý do chọn phương án này:

**1. Kiểm soát chi phí cho chủ shop**
- Nếu tặng theo số lượng (per item): 1 đơn hàng 10 áo = 10 đôi tất → chi phí quà tặng rất lớn
- Với fixed mode: Dù mua 1 hay 100 áo, chi phí quà tặng luôn cố định = 1 đôi tất
- Chủ shop dễ dàng tính toán ngân sách khuyến mãi

**2. Tránh lạm dụng chương trình**
- Khách hàng không thể "farm" quà tặng bằng cách đặt số lượng lớn
- Công bằng cho tất cả khách hàng: ai mua cũng được 1 phần quà

**3. Logic đơn giản, ít lỗi**
- Không cần sync liên tục số lượng quà khi khách thay đổi số lượng áo
- Giảm số lần gọi API cập nhật cart
- Trải nghiệm mượt mà hơn cho khách

**4. Phù hợp thực tế thị trường**
- Hầu hết chương trình quà tặng trong retail (offline & online) đều giới hạn: "Mỗi khách hàng được nhận tối đa 1 phần quà"
- Shopee, Lazada, Amazon đều áp dụng mô hình này

### Tuy nhiên, hệ thống vẫn hỗ trợ "Per Item" mode

Chủ shop có thể chuyển sang chế độ "Per Item" trong Admin Settings nếu muốn:
- Mua 2 áo → Tặng 2 tất
- Mua 3 áo → Tặng 3 tất
- Có thể set `maxGiftQuantity` để giới hạn (VD: max 3 quà/đơn)

---

## Trường hợp 2: Tất (quà tặng) hết hàng → App xử lý thế nào?

### Đề xuất: Vẫn cho mua Áo Thun bình thường, không tặng quà + hiện thông báo

### Chi tiết xử lý:

```
Khách bấm "Add to Cart" (Áo Thun)
       │
       ▼
App check: Áo Thun có phải trigger? → YES
       │
       ▼
App check: Tất còn hàng không? ──── Query Shopify API
       │                              (check availableForSale)
       │
   ┌───┴───┐
   │       │
  YES     NO (hết hàng)
   │       │
   ▼       ▼
Thêm      Chỉ thêm Áo Thun
Áo + Tất  (KHÔNG thêm Tất)
           │
           ▼
        Hiện thông báo:
        "Sorry, the free gift is
         currently out of stock.
         You can still purchase
         your items normally."
```

### Lý do chọn phương án này:

**1. KHÔNG chặn doanh số**
- Nếu App báo lỗi hoặc không cho mua → khách có thể bỏ đi → **mất đơn hàng**
- Mục đích chính của khách là mua Áo Thun, quà tặng chỉ là bonus
- Không nên để quà tặng trở thành rào cản mua hàng

**2. Trải nghiệm người dùng tốt**
- Khách vẫn hoàn thành được mục tiêu chính: mua sản phẩm họ muốn
- Thông báo nhẹ nhàng, không gây khó chịu
- Minh bạch: khách biết lý do không có quà

**3. Thực tế ngành ecommerce**
- Đây là cách xử lý tiêu chuẩn của hầu hết platform lớn
- Không có shop nào chặn khách mua hàng chỉ vì quà tặng hết

### Chi tiết từng vị trí hiển thị khi quà hết hàng:

| Vị trí | Khi quà CÒN hàng | Khi quà HẾT hàng |
|--------|-------------------|-------------------|
| **Trang sản phẩm (PDP)** | Banner: "Mua SP này được tặng kèm Tất miễn phí!" | Ẩn banner quà tặng hoặc đổi thành: "Quà tặng kèm tạm thời hết hàng" |
| **Add to Cart action** | Thêm Áo + Tất ($0) vào giỏ | Chỉ thêm Áo vào giỏ |
| **Cart Drawer** | Hiển thị cả Áo và Tất (FREE GIFT) | Chỉ hiển thị Áo |
| **Toast notification** | Không cần | Hiện: "Free gift is currently out of stock" |

### Xử lý kỹ thuật:

```javascript
// Pseudo code
async function handleAddToCartWithGift(variantId) {
  // 1. Add trigger product
  await addToCart(variantId);

  // 2. Check gift availability
  const giftProduct = await getProductByHandle(config.giftProductHandle);
  const giftVariant = giftProduct.variants[0];

  if (giftVariant.availableForSale) {
    // 3a. Gift available → add gift
    await addToCart(giftVariant.id, config.fixedQuantity);
  } else {
    // 3b. Gift out of stock → show notification only
    showToast("Free gift is currently out of stock");
  }
}
```

---

## Bảng tổng hợp Logic

| # | Tình huống | Xử lý | Lý do |
|---|-----------|-------|-------|
| 1 | Mua 1 Áo | Tặng 1 Tất | Happy path |
| 2 | Mua 2 Áo (Fixed mode) | Tặng 1 Tất | Kiểm soát chi phí |
| 3 | Mua 2 Áo (Per Item mode) | Tặng 2 Tất | Theo cấu hình chủ shop |
| 4 | Mua 5 Áo (Per Item, max=3) | Tặng 3 Tất | Bị giới hạn bởi maxGiftQuantity |
| 5 | Tất hết hàng | Vẫn mua được Áo, không tặng Tất | Không chặn doanh số |
| 6 | Xóa Áo khỏi giỏ | Tự động xóa Tất | Tránh khách chỉ lấy quà |
| 7 | Giảm SL Áo (Fixed mode) | Giữ nguyên Tất nếu SL Áo > 0 | Cố định |
| 8 | Rule bị tắt (isActive=false) | Không trigger quà tặng | Chủ shop chủ động tắt |
