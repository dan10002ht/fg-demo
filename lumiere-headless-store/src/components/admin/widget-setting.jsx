"use client";

import { useState } from "react";
import {
  Card,
  Text,
  TextField,
  RadioButton,
  Checkbox,
  BlockStack,
  Divider,
  InlineStack,
  Button,
  Modal,
} from "@shopify/polaris";
import { ViewIcon } from "@shopify/polaris-icons";
import useCampaignStore from "@/lib/campaign-store";
import PromotionBadge from "@/components/gift/promotion-badge";

/* ─── Skeleton bar helper ─── */
function Skel({ w = "100%", h = 12, r = 4 }) {
  return (
    <div
      style={{
        width: w,
        height: h,
        background: "#e5e5e5",
        borderRadius: r,
      }}
    />
  );
}

/* ─── Inline Promotion Card (immune to Polaris CSS) ─── */
function formatPreviewPrice(amount, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

function PromotionCardInline({ title, subtitle, gifts = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  if (gifts.length === 0) return null;

  const activeGift = gifts[activeIndex];
  const nextGift = gifts.length > 1 ? gifts[(activeIndex + 1) % gifts.length] : null;

  const goNext = () => setActiveIndex((i) => (i + 1) % gifts.length);
  const goPrev = () => setActiveIndex((i) => (i - 1 + gifts.length) % gifts.length);

  const arrowStyle = {
    width: 28,
    height: 28,
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    border: "none",
    background: "transparent",
    color: "#888",
    cursor: "pointer",
    padding: 0,
  };

  return (
    <div
      style={{
        border: "1px solid #e5e5e5",
        borderRadius: 12,
        background: "rgba(245,245,245,0.4)",
        padding: 16,
      }}
    >
      {/* Title + Subtitle */}
      <div style={{ marginBottom: 12 }}>
        <p
          style={{
            fontSize: 14,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "#111",
            margin: 0,
          }}
        >
          {title}
        </p>
        {subtitle && (
          <p style={{ fontSize: 12, color: "#888", marginTop: 2, margin: 0, paddingTop: 2 }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Carousel */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {gifts.length > 1 && (
          <button type="button" onClick={goPrev} style={arrowStyle} aria-label="Previous gift">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        )}

        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 12 }}>
          {/* Active gift image */}
          <div
            style={{
              position: "relative",
              width: 56,
              height: 56,
              flexShrink: 0,
              overflow: "hidden",
              borderRadius: 8,
              border: "2px solid rgba(17,17,17,0.8)",
              background: "#f0f0f0",
            }}
          >
            {activeGift.imageUrl ? (
              <img
                src={activeGift.imageUrl}
                alt={activeGift.title}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="8" width="18" height="13" rx="2" />
                  <path d="M12 8V5a3 3 0 0 0-3-3h0a3 3 0 0 0-3 3v3M18 8V5a3 3 0 0 0-3-3h0a3 3 0 0 0-3 3v3" />
                </svg>
              </div>
            )}
          </div>

          {/* Gift info */}
          <div style={{ minWidth: 0, flex: 1 }}>
            <p
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: "#111",
                margin: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {activeGift.title}
            </p>
            <div style={{ marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#111" }}>
                {formatPreviewPrice(0, activeGift.currencyCode || "USD")}
              </span>
              {activeGift.price > 0 && (
                <span style={{ fontSize: 12, color: "#888", textDecoration: "line-through" }}>
                  {formatPreviewPrice(activeGift.price, activeGift.currencyCode || "USD")}
                </span>
              )}
            </div>
          </div>

          {/* Next gift (faded) */}
          {nextGift && (
            <div
              style={{
                width: 48,
                height: 48,
                flexShrink: 0,
                overflow: "hidden",
                borderRadius: 8,
                background: "#f0f0f0",
                opacity: 0.4,
                marginLeft: "auto",
              }}
            >
              {nextGift.imageUrl ? (
                <img
                  src={nextGift.imageUrl}
                  alt={nextGift.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="8" width="18" height="13" rx="2" />
                    <path d="M12 8V5a3 3 0 0 0-3-3h0a3 3 0 0 0-3 3v3M18 8V5a3 3 0 0 0-3-3h0a3 3 0 0 0-3 3v3" />
                  </svg>
                </div>
              )}
            </div>
          )}
        </div>

        {gifts.length > 1 && (
          <button type="button" onClick={goNext} style={arrowStyle} aria-label="Next gift">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        )}
      </div>

      {/* Dots */}
      {gifts.length > 1 && (
        <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          {gifts.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              style={{
                width: idx === activeIndex ? 16 : 6,
                height: 6,
                borderRadius: 3,
                background: idx === activeIndex ? "#111" : "rgba(17,17,17,0.2)",
                border: "none",
                padding: 0,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              aria-label={`Go to gift ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* CTA */}
      <button
        type="button"
        style={{
          marginTop: 12,
          width: "100%",
          padding: "10px 0",
          borderRadius: 9999,
          background: "#111",
          color: "#fff",
          border: "none",
          fontSize: 12,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          cursor: "pointer",
        }}
      >
        Unlock Your Gift
      </button>
    </div>
  );
}

/* ─── Promotion Card Preview Modal ─── */
function PromotionCardPreview({ open, onClose, title, subtitle, gifts }) {
  const [device, setDevice] = useState("desktop");

  return (
    <Modal open={open} onClose={onClose} title="Promotion Card Preview" size="large">
      <Modal.Section>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Device toggle */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div
              style={{
                display: "inline-flex",
                border: "1px solid #ccc",
                borderRadius: 8,
                overflow: "hidden",
              }}
            >
              {["desktop", "mobile"].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDevice(d)}
                  style={{
                    padding: "6px 14px",
                    background: device === d ? "#f0f0f0" : "#fff",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  {d === "desktop" ? (
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                      <rect x="2" y="3" width="16" height="11" rx="1.5" stroke="#333" strokeWidth="1.5" />
                      <path d="M7 17h6M10 14v3" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                      <rect x="5" y="2" width="10" height="16" rx="1.5" stroke="#333" strokeWidth="1.5" />
                      <circle cx="10" cy="15.5" r="0.75" fill="#333" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* PDP mockup */}
          <div
            style={{
              ...(device === "mobile"
                ? {
                    width: 360,
                    margin: "0 auto",
                    border: "1px solid #ddd",
                    borderRadius: 16,
                    overflow: "hidden",
                  }
                : {}),
            }}
          >
          <div
            style={{
              display: "flex",
              gap: device === "desktop" ? 24 : 0,
              flexDirection: device === "desktop" ? "row" : "column",
              background: "#fff",
              padding: device === "desktop" ? 16 : 12,
            }}
          >
            {/* Left: image gallery */}
            <div
              style={{
                display: "flex",
                gap: 8,
                flexShrink: 0,
                width: device === "desktop" ? "60%" : "100%",
              }}
            >
              {/* Thumbnails */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: 48,
                      height: 48,
                      background: "#ebebeb",
                      borderRadius: 4,
                    }}
                  />
                ))}
              </div>
              {/* Main image */}
              <div
                style={{
                  flex: 1,
                  aspectRatio: "1",
                  background: "#ebebeb",
                  borderRadius: 6,
                }}
              />
            </div>

            {/* Right: product info + promotion card */}
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 14,
                paddingTop: device === "desktop" ? 0 : 16,
              }}
            >
              {/* Title + price skeleton */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Skel w="70%" h={16} />
                <Skel w={50} h={16} />
              </div>
              <Skel w={60} h={10} />

              {/* Description skeleton */}
              <Skel w="90%" h={10} />

              {/* Variant skeleton */}
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Skel w={40} h={10} />
                <Skel w="80%" h={10} />
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Skel w={40} h={10} />
                <Skel w="80%" h={10} />
              </div>
              <Skel w="100%" h={10} />
              <Skel w="100%" h={10} />

              {/* ── Promotion Card (inline styles for Polaris compat) ── */}
              <PromotionCardInline
                title={title}
                subtitle={subtitle}
                gifts={gifts}
              />
            </div>
          </div>
          </div>
        </div>
      </Modal.Section>
    </Modal>
  );
}

/* ─── Badge Product Card helper (mirrors storefront ProductCard layout) ─── */
function BadgeProductCard({ title, price, badgeText, hasBadge }) {
  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded bg-muted">
        {hasBadge && (
          <div className="absolute bottom-3 left-3 z-0">
            <PromotionBadge text={badgeText || "FREE GIFT"} />
          </div>
        )}
      </div>
      <div className="mt-3 space-y-1">
        <h3 className="font-serif text-sm font-medium leading-tight tracking-wide">
          {title}
        </h3>
        <span className="text-sm">{price}</span>
      </div>
    </div>
  );
}

/* ─── Promotion Badge Preview Modal ─── */
function PromotionBadgePreview({ open, onClose, badgeText }) {
  return (
    <Modal open={open} onClose={onClose} title="Promotion Badge Preview" size="large">
      <Modal.Section>
        <div
          style={{
            background: "#f1f1f1",
            borderRadius: 12,
            padding: 24,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 16,
            }}
          >
            <BadgeProductCard
              title="Product A"
              price="$2,630.00 USD"
              hasBadge={false}
            />
            <BadgeProductCard
              title="Product B"
              price="$630.00 USD"
              badgeText={badgeText}
              hasBadge
            />
            <BadgeProductCard
              title="Product C"
              price="$600.00 USD"
              hasBadge={false}
            />
            <BadgeProductCard
              title="Product D"
              price="$750.00 USD"
              hasBadge={false}
            />
          </div>
        </div>
      </Modal.Section>
    </Modal>
  );
}

export default function WidgetSetting() {
  const giftSelectionMethod = useCampaignStore((s) => s.giftSelectionMethod);
  const showPromotionCard = useCampaignStore((s) => s.showPromotionCard);
  const autoDisableWhenOOS = useCampaignStore((s) => s.autoDisableWhenOOS);
  const promotionBadgeEnabled = useCampaignStore((s) => s.promotionBadgeEnabled);
  const promotionBadgeText = useCampaignStore((s) => s.promotionBadgeText);
  const congratsBarTitle = useCampaignStore((s) => s.congratsBarTitle);
  const congratsBarDuration = useCampaignStore((s) => s.congratsBarDuration);
  const popupTitle = useCampaignStore((s) => s.popupTitle);
  const popupDescription = useCampaignStore((s) => s.popupDescription);
  const minimumQuantity = useCampaignStore((s) => s.minimumQuantity);
  const getProducts = useCampaignStore((s) => s.getProducts);
  const setField = useCampaignStore((s) => s.setField);

  const [cardPreviewOpen, setCardPreviewOpen] = useState(false);
  const [badgePreviewOpen, setBadgePreviewOpen] = useState(false);

  // Build gift items for the shared widget from admin config
  const previewGifts =
    getProducts?.length > 0
      ? getProducts.map((p) => ({
          title: p.title || "Gift product",
          imageUrl: p.imageUrl || null,
          price: parseFloat(p.price || 0),
          currencyCode: "USD",
        }))
      : [
          { title: "Gift product", imageUrl: null, price: 70, currencyCode: "USD" },
          { title: "Gift product 2", imageUrl: null, price: 50, currencyCode: "USD" },
        ];

  const cardTitle = promotionBadgeText || "EXCLUSIVE GIFTS!";
  const cardSubtitle =
    minimumQuantity > 1
      ? `Buy ${minimumQuantity} items to receive gifts`
      : "Buy this product to receive a gift";

  return (
    <BlockStack gap="400">
      {/* Gift Selection Method */}
      <Card>
        <BlockStack gap="400">
          <Text as="h2" variant="headingMd">
            Gift Selection Method
          </Text>
          <BlockStack gap="200">
            <RadioButton
              label="Customer chooses"
              helpText="Customer selects from available gifts"
              checked={giftSelectionMethod === "customerChooses"}
              id="giftMethod-customerChooses"
              name="giftSelectionMethod"
              onChange={() => setField("giftSelectionMethod", "customerChooses")}
            />
            <RadioButton
              label="Automatically"
              helpText="Gift added when conditions are met"
              checked={giftSelectionMethod === "automatically"}
              id="giftMethod-automatically"
              name="giftSelectionMethod"
              onChange={() => setField("giftSelectionMethod", "automatically")}
            />
          </BlockStack>
        </BlockStack>
      </Card>

      {/* Setting widget (conditional on gift selection method) */}
      <Card>
        <BlockStack gap="400">
          <Text as="h2" variant="headingMd">
            Setting widget
          </Text>

          {giftSelectionMethod === "automatically" ? (
            /* ── Congrats bar ── */
            <BlockStack gap="400">
              <Card>
                <InlineStack align="space-between" blockAlign="center">
                  <BlockStack gap="100">
                    <Text as="h3" variant="headingSm">
                      Congrats bar
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      Show a notification banner at the bottom of your website
                    </Text>
                  </BlockStack>
                </InlineStack>
              </Card>
              <TextField
                label="Title"
                value={congratsBarTitle}
                onChange={(val) => setField("congratsBarTitle", val)}
                autoComplete="off"
              />
              <TextField
                label="Auto-dismiss after (seconds)"
                type="number"
                value={String(congratsBarDuration)}
                onChange={(val) => setField("congratsBarDuration", parseInt(val) || 0)}
                min={0}
                autoComplete="off"
                helpText="Set to 0 to keep the bar visible until manually closed."
              />
            </BlockStack>
          ) : (
            /* ── Pop-up ── */
            <BlockStack gap="400">
              <Card>
                <InlineStack align="space-between" blockAlign="center">
                  <BlockStack gap="100">
                    <Text as="h3" variant="headingSm">
                      Pop-up
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      Show a customizable popup to the customer to choose a gift
                    </Text>
                  </BlockStack>
                </InlineStack>
              </Card>
              <TextField
                label="Title"
                value={popupTitle}
                onChange={(val) => setField("popupTitle", val)}
                autoComplete="off"
              />
              <TextField
                label="Description"
                value={popupDescription}
                onChange={(val) => setField("popupDescription", val)}
                autoComplete="off"
                multiline={2}
              />
            </BlockStack>
          )}
        </BlockStack>
      </Card>

      {/* Promotion Settings (Card + Badge merged) */}
      <Card>
        <BlockStack gap="400">
          <Text as="h2" variant="headingMd">
            Promotion
          </Text>

          <Checkbox
            label="Auto-disable when out of stock"
            helpText="Automatically disable the gift offer when all gift product variants are out of stock."
            checked={autoDisableWhenOOS}
            onChange={(val) => setField("autoDisableWhenOOS", val)}
          />

          <Divider />

          {/* ── Promotion Card ── */}
          <InlineStack align="space-between" blockAlign="center">
            <Text as="h3" variant="headingSm">
              Promotion Card
            </Text>
            <Button
              variant="plain"
              icon={ViewIcon}
              onClick={() => setCardPreviewOpen(true)}
            >
              Preview
            </Button>
          </InlineStack>

          <Checkbox
            label="Show promotion card"
            helpText="Display a promotion card to customers in the cart or product pages when the gift offer is active."
            checked={showPromotionCard}
            onChange={(val) => setField("showPromotionCard", val)}
          />

          <Divider />

          {/* ── Promotion Badge ── */}
          <InlineStack align="space-between" blockAlign="center">
            <Text as="h3" variant="headingSm">
              Promotion Badge
            </Text>
            <Button
              variant="plain"
              icon={ViewIcon}
              onClick={() => setBadgePreviewOpen(true)}
            >
              Preview
            </Button>
          </InlineStack>

          <Checkbox
            label="Show promotion badge"
            helpText="Display a badge on qualifying products to highlight the gift promotion."
            checked={promotionBadgeEnabled}
            onChange={(val) => setField("promotionBadgeEnabled", val)}
          />

          {promotionBadgeEnabled && (
            <TextField
              label="Badge text"
              value={promotionBadgeText}
              onChange={(val) => setField("promotionBadgeText", val)}
              autoComplete="off"
              helpText="Text displayed on the promotion badge."
            />
          )}

        </BlockStack>
      </Card>

      {/* Preview Modals */}
      <PromotionCardPreview
        open={cardPreviewOpen}
        onClose={() => setCardPreviewOpen(false)}
        title={cardTitle}
        subtitle={cardSubtitle}
        gifts={previewGifts}
      />
      <PromotionBadgePreview
        open={badgePreviewOpen}
        onClose={() => setBadgePreviewOpen(false)}
        badgeText={promotionBadgeText}
      />
    </BlockStack>
  );
}
