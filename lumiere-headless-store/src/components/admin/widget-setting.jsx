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
import PromotionCardWidget from "@/components/gift/promotion-card-widget";
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

              {/* ── Shared Promotion Card Widget ── */}
              <PromotionCardWidget
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
