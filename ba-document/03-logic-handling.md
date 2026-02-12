# Nhiệm vụ 3: Xử lý tình huống (Logic)

## Trường hợp 1: Khách mua 2 cái Áo → Tặng bao nhiêu quà?

### Phụ thuộc vào 2 cấu hình: `minimumQuantity` và `multiApply`

#### Khi Multi-apply = OFF (mặc định)

Chỉ tặng **1 lần** khi khách mua đủ `minimumQuantity`:

| Min Qty | Khách mua | Kết quả |
|---------|-----------|---------|
| 1 | 1 item | Tặng 1 lần (đủ điều kiện) |
| 1 | 2 items | Tặng 1 lần (vẫn chỉ 1 lần) |
| 2 | 1 item | Không tặng (chưa đủ) |
| 2 | 2 items | Tặng 1 lần |
| 2 | 5 items | Tặng 1 lần |

**Lý do chọn mặc định OFF:**
1. Kiểm soát chi phí cho chủ shop
2. Tránh lạm dụng chương trình
3. Phù hợp với hầu hết use case promotion

#### Khi Multi-apply = ON

Tặng theo **bội số** của `minimumQuantity`:

| Min Qty | Khách mua | Bội số | Kết quả |
|---------|-----------|--------|---------|
| 2 | 2 items | 1x | Tặng 1 lần |
| 2 | 4 items | 2x | Tặng 2 lần |
| 2 | 5 items | 2x (floor) | Tặng 2 lần (5÷2=2.5→floor=2) |
| 2 | 6 items | 3x | Tặng 3 lần |
| 3 | 7 items | 2x (floor) | Tặng 2 lần (7÷3=2.33→floor=2) |

**Công thức:**
```
giftMultiplier = floor(triggerQuantity / minimumQuantity)
totalGiftQty = giftMultiplier × giftProduct.giftQuantity
```

**Ví dụ thực tế:**
- Config: min qty = 2, gift qty = 1, multi-apply ON
- Khách mua 6 items → 6÷2 = 3 → tặng 3 quà
- Placeholder đã mô tả: "Buy 4 get 2, Buy 6 get 3"

---

## Trường hợp 2: Quà tặng hết hàng → App xử lý thế nào?

### Đề xuất: Vẫn cho mua sản phẩm bình thường + xử lý theo cấu hình Widget

### Luồng xử lý:

```
Khách mua đủ điều kiện
        │
        ▼
Check gift products availability
        │
    ┌───┴───────────────┐
    │                   │
  Có gift          Tất cả gifts
  còn hàng         hết hàng
    │                   │
    ▼                   ▼
  Trigger gift     autoDisableWhenOOS?
  bình thường          │
                   ┌───┴───┐
                  YES     NO
                   │       │
                   ▼       ▼
              Tắt promo  Ẩn SP hết hàng
              card,      khỏi popup,
              không      SP khác vẫn
              trigger    hiển thị
```

### Chi tiết theo Widget mode:

#### Mode: Customer Chooses

| Tình huống | Xử lý |
|-----------|-------|
| Tất cả gifts còn hàng | Popup hiển thị đầy đủ danh sách gifts |
| Một số gifts hết hàng | Ẩn SP hết hàng khỏi popup, SP còn hàng vẫn chọn được |
| Tất cả gifts hết hàng + autoDisable ON | Không hiện popup, ẩn promotion card |
| Tất cả gifts hết hàng + autoDisable OFF | Popup hiện nhưng rỗng, thông báo "Gifts are currently out of stock" |

#### Mode: Automatically

| Tình huống | Xử lý |
|-----------|-------|
| Gift còn hàng | Tự động thêm gift + Congratulation bar |
| Gift hết hàng + autoDisable ON | Không thêm gift, ẩn promotion card |
| Gift hết hàng + autoDisable OFF | Không thêm gift, toast "Gift currently out of stock" |

### Lý do:
1. **Không bao giờ chặn doanh số** — Khách vẫn mua được sản phẩm bình thường
2. **Minh bạch** — Thông báo rõ ràng khi quà hết
3. **Linh hoạt** — Chủ shop tự quyết: auto-disable hay vẫn hiện promotion

---

## Trường hợp 3: Multi-apply + Thay đổi số lượng trong giỏ

| Hành động | Multi-apply OFF | Multi-apply ON |
|-----------|----------------|----------------|
| Mua 2 (min=2) | Tặng 1 lần | Tặng 1 lần (2÷2=1) |
| Tăng lên 4 | Giữ nguyên 1 lần | Tặng 2 lần (4÷2=2) |
| Tăng lên 6 | Giữ nguyên 1 lần | Tặng 3 lần (6÷2=3) |
| Giảm về 3 | Giữ nguyên 1 lần | Giảm về 1 lần (3÷2=1) |
| Giảm về 1 (dưới min) | **Xóa gift** | **Xóa gift** |
| Xóa hết trigger | **Xóa gift** | **Xóa gift** |

---

## Trường hợp 4: Schedule & Campaign status

| Tình huống | Xử lý |
|-----------|-------|
| Trước startDate | Campaign inactive → không trigger gift, ẩn promotion |
| Trong khoảng start-end | Campaign active → trigger gift bình thường |
| Sau endDate | Campaign inactive → không trigger gift, ẩn promotion |
| hasEndDate = false | Campaign chạy vô thời hạn (chỉ dừng khi admin tắt) |
| Admin tắt campaign thủ công | Inactive ngay lập tức |

### Xử lý giỏ hàng đã có gift khi campaign hết hạn:

Nếu campaign hết hạn/bị tắt **SAU KHI** khách đã có gift trong giỏ:
- Gift vẫn giữ trong giỏ (đã được thêm hợp lệ)
- Discount code vẫn hoạt động (Shopify discount có schedule riêng)
- Không thêm gift mới cho lần add to cart tiếp theo

---

## Trường hợp 5: Discount Code & Combinations

### Discount xung đột:

| Discount type campaign | Khách có discount khác | Combinations OFF | Combinations ON |
|----------------------|----------------------|-----------------|----------------|
| Free (100%) | Product discount -20% | Chỉ áp dụng 1 discount (ưu tiên giá trị cao hơn) | Áp dụng cả 2 |
| Percentage 50% | Order discount -₫100 | Chỉ áp dụng 1 | Áp dụng cả 2 |
| Fixed ₫50 | Shipping discount | Chỉ áp dụng 1 | Áp dụng cả 2 |

### Auto-generated Discount Code:
- Format: `GIFT-{random 6 chars}` (VD: GIFT-A1B2C3)
- Admin có thể sửa lại tên code
- Code hiển thị cho khách trong cart (label ghi rõ)
- Code được auto-apply khi gift thêm vào cart

---

## Trường hợp 6: Customer Eligibility

| Eligibility | Khách đủ điều kiện | Khách không đủ |
|-------------|-------------------|----------------|
| All customers | Tất cả đều nhận quà | N/A |
| Customer segment | Khách thuộc segment → nhận quà | Không hiển thị promotion, không trigger gift |
| Specific link | Khách vào qua link cụ thể → nhận quà | Không trigger |
| Customer location | Khách ở location đúng → nhận quà | Không trigger |

> Note: Customer eligibility sẽ được mô tả chi tiết sau (theo yêu cầu của PO).

---

## Bảng tổng hợp Logic

| # | Tình huống | Xử lý |
|---|-----------|-------|
| 1 | Mua đủ min qty (multi OFF) | Tặng 1 lần |
| 2 | Mua đủ min qty (multi ON) | Tặng theo bội số |
| 3 | Mua chưa đủ min qty | Không tặng, hiện progress |
| 4 | Tất cả gifts hết hàng + autoDisable ON | Tắt promotion, không tặng |
| 5 | Tất cả gifts hết hàng + autoDisable OFF | Thông báo hết, không tặng |
| 6 | Một số gifts hết hàng | Ẩn SP hết, SP khác vẫn available |
| 7 | Xóa trigger product | Xóa gift khỏi giỏ |
| 8 | Giảm trigger dưới min qty | Xóa gift khỏi giỏ |
| 9 | Campaign hết hạn | Không trigger mới, gift cũ giữ nguyên |
| 10 | Discount code xung đột | Theo cấu hình Combinations |
| 11 | Customer không đủ eligibility | Không hiện promotion, không trigger |
| 12 | Mode "Customer chooses" | Mở popup chọn gift |
| 13 | Mode "Automatically" | Tự thêm gift + Congrats bar 5s |
