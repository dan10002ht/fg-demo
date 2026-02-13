"use client";

/**
 * Shared gift popup inner content — used by both admin preview and storefront.
 * Uses inline styles only so it works inside Polaris (admin) and Tailwind (storefront).
 *
 * @param {string}   title         — Popup heading
 * @param {string}   description   — Popup subtext
 * @param {Array}    gifts         — [{ id, title, imageUrl, price, currencyCode }]
 * @param {string|null} selectedId — Currently selected gift id
 * @param {string|null} addingId   — Gift id being added (loading state)
 * @param {string|null} addedId    — Gift id that was just added (success state)
 * @param {Function} onSelect      — (giftId) => void
 * @param {Function} onConfirm     — () => void  (CTA click)
 * @param {Function} onClose       — () => void
 * @param {boolean}  interactive   — true for storefront, false for static preview
 */
export default function GiftPopupContent({
  title,
  description,
  gifts = [],
  selectedId = null,
  addingId = null,
  addedId = null,
  onSelect,
  onConfirm,
  onClose,
  interactive = true,
}) {
  const selectedCount = selectedId ? 1 : 0;
  const isLoading = !!addingId;
  const isDone = !!addedId;

  return (
    <div
      style={{
        background: "#fff",
        borderTop: "1px solid #eee",
        padding: "16px 14px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#222" }}>
            {title || "Choose Your Free Gift!"}
          </div>
          <div style={{ fontSize: 11, color: "#666", marginTop: 4, lineHeight: "15px" }}>
            {description || "Select one of the gifts below to add to your order."}
          </div>
        </div>
        {interactive && onClose && (
          <button
            type="button"
            onClick={onClose}
            style={{
              fontSize: 14,
              color: "#999",
              cursor: "pointer",
              flexShrink: 0,
              marginLeft: 8,
              background: "none",
              border: "none",
              padding: 2,
            }}
          >
            &times;
          </button>
        )}
        {!interactive && (
          <span style={{ fontSize: 14, color: "#999", cursor: "default", flexShrink: 0, marginLeft: 8 }}>
            &times;
          </span>
        )}
      </div>

      {/* Gift cards */}
      {gifts.map((gift, i) => {
        const isSelected = selectedId === gift.id;
        const isThisAdded = addedId === gift.id;

        return (
          <div
            key={gift.id || i}
            onClick={() => interactive && onSelect && onSelect(gift.id)}
            style={{
              border: `1px solid ${isSelected || isThisAdded ? "#222" : "#e0e0e0"}`,
              borderRadius: 10,
              padding: 10,
              display: "flex",
              alignItems: "center",
              gap: 10,
              cursor: interactive ? "pointer" : "default",
              transition: "border-color 0.15s",
            }}
          >
            {/* Product image */}
            <div
              style={{
                width: 52,
                height: 52,
                background: "#e8e8e8",
                borderRadius: 6,
                flexShrink: 0,
                position: "relative",
              }}
            >
              {gift.imageUrl ? (
                <img
                  src={gift.imageUrl}
                  alt={gift.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", borderRadius: 6 }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#bbb",
                    fontSize: 20,
                  }}
                >
                  🎁
                </div>
              )}
              {/* Quantity badge */}
              <span
                style={{
                  position: "absolute",
                  top: -4,
                  left: -4,
                  width: 16,
                  height: 16,
                  borderRadius: 4,
                  background: "#2e7d32",
                  color: "#fff",
                  fontSize: 8,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                1
              </span>
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#222",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {gift.title}
              </div>
              <div style={{ fontSize: 11, marginTop: 2 }}>
                <span style={{ fontWeight: 600 }}>
                  {formatInlinePrice(0, gift.currencyCode)}
                </span>{" "}
                {gift.price > 0 && (
                  <span style={{ color: "#999", textDecoration: "line-through" }}>
                    {formatInlinePrice(gift.price, gift.currencyCode)}
                  </span>
                )}
              </div>
            </div>

            {/* Checkbox */}
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: 4,
                background: isSelected || isThisAdded ? "#222" : "#fff",
                border: isSelected || isThisAdded ? "none" : "1.5px solid #ccc",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "background 0.15s",
              }}
            >
              {(isSelected || isThisAdded) && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 6L5 8.5L9.5 3.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          </div>
        );
      })}

      {/* CTA */}
      <button
        type="button"
        onClick={interactive ? onConfirm : undefined}
        disabled={interactive && (!selectedId || isLoading)}
        style={{
          width: "100%",
          padding: "11px 0",
          background: (!interactive || selectedId) ? "#222" : "#999",
          color: "#fff",
          border: "none",
          borderRadius: 24,
          fontSize: 13,
          fontWeight: 600,
          cursor: interactive && selectedId && !isLoading ? "pointer" : "default",
          opacity: interactive && !selectedId && !isDone ? 0.5 : 1,
          transition: "background 0.15s, opacity 0.15s",
        }}
      >
        {isDone ? "✓ Added to cart" : isLoading ? "Adding..." : `Add to cart${selectedCount > 0 ? ` (${selectedCount})` : ""}`}
      </button>

      {/* Continue shopping */}
      {interactive && onClose && !isDone && (
        <div
          onClick={onClose}
          style={{
            textAlign: "center",
            fontSize: 12,
            color: "#2e7d32",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Continue shopping
        </div>
      )}
      {!interactive && (
        <div style={{ textAlign: "center", fontSize: 12, color: "#2e7d32", fontWeight: 500 }}>
          Continue shopping
        </div>
      )}
    </div>
  );
}

function formatInlinePrice(amount, currencyCode = "USD") {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
    }).format(amount);
  } catch {
    return `$${Number(amount).toFixed(2)}`;
  }
}
