"use client";

import { useState, useCallback } from "react";
import {
  Card,
  Text,
  TextField,
  Select,
  Checkbox,
  Button,
  InlineStack,
  BlockStack,
  Divider,
  Thumbnail,
  Icon,
} from "@shopify/polaris";
import { DeleteIcon, PlusIcon } from "@shopify/polaris-icons";
import useCampaignStore from "@/lib/campaign-store";
import { formatPrice } from "@/lib/shopify";
import OfferTitleModal from "./offer-title-modal";
import BrowseProductsModal from "./browse-products-modal";

export default function CampaignSetting() {
  const [offerTitleModalOpen, setOfferTitleModalOpen] = useState(false);
  const [browseModalOpen, setBrowseModalOpen] = useState(false);
  const [browseMode, setBrowseMode] = useState("buy");

  const offerTitle = useCampaignStore((s) => s.offerTitle);
  const startDate = useCampaignStore((s) => s.startDate);
  const startTime = useCampaignStore((s) => s.startTime);
  const hasEndDate = useCampaignStore((s) => s.hasEndDate);
  const endDate = useCampaignStore((s) => s.endDate);
  const endTime = useCampaignStore((s) => s.endTime);
  const minimumQuantity = useCampaignStore((s) => s.minimumQuantity);
  const buyConditionType = useCampaignStore((s) => s.buyConditionType);
  const buyProducts = useCampaignStore((s) => s.buyProducts);
  const buyCollections = useCampaignStore((s) => s.buyCollections);
  const getProducts = useCampaignStore((s) => s.getProducts);
  const multiApply = useCampaignStore((s) => s.multiApply);
  const discountCode = useCampaignStore((s) => s.discountCode);
  const discountType = useCampaignStore((s) => s.discountType);
  const discountValue = useCampaignStore((s) => s.discountValue);
  const combineProductDiscounts = useCampaignStore((s) => s.combineProductDiscounts);
  const combineOrderDiscounts = useCampaignStore((s) => s.combineOrderDiscounts);
  const combineShippingDiscounts = useCampaignStore((s) => s.combineShippingDiscounts);
  const customerEligibility = useCampaignStore((s) => s.customerEligibility);
  const setField = useCampaignStore((s) => s.setField);
  const removeBuyProduct = useCampaignStore((s) => s.removeBuyProduct);
  const removeBuyCollection = useCampaignStore((s) => s.removeBuyCollection);
  const removeGetProduct = useCampaignStore((s) => s.removeGetProduct);
  const updateGetProductQuantity = useCampaignStore((s) => s.updateGetProductQuantity);

  const openBrowseModal = useCallback((mode) => {
    setBrowseMode(mode);
    setBrowseModalOpen(true);
  }, []);

  const handleBrowseConfirm = useCallback(
    (selectedItems) => {
      if (browseMode === "buy") {
        if (buyConditionType === "specificCollections") {
          setField("buyCollections", selectedItems);
        } else {
          setField("buyProducts", selectedItems);
        }
      } else {
        // Preserve existing giftQuantity for products that were already selected
        const existingQtyMap = new Map(getProducts.map((p) => [p.productId, p.giftQuantity]));
        const merged = selectedItems.map((p) => ({
          ...p,
          giftQuantity: existingQtyMap.get(p.productId) ?? 1,
        }));
        setField("getProducts", merged);
      }
    },
    [browseMode, buyConditionType, getProducts, setField]
  );

  const browseButtonLabel =
    buyConditionType === "specificCollections"
      ? "Browse collections"
      : "Browse products";

  return (
    <BlockStack gap="400">
      {/* ── Schedule ── */}
      <Card>
        <BlockStack gap="400">
          <Text as="h2" variant="headingMd">
            Schedule
          </Text>
          <InlineStack gap="400" wrap={false}>
            <div style={{ flex: 1 }}>
              <TextField
                label="Start date"
                type="date"
                value={startDate}
                onChange={(val) => setField("startDate", val)}
                autoComplete="off"
              />
            </div>
            <div style={{ flex: 1 }}>
              <TextField
                label="Start time"
                type="time"
                value={startTime}
                onChange={(val) => setField("startTime", val)}
                autoComplete="off"
              />
            </div>
          </InlineStack>
          <Checkbox
            label="Set end date"
            checked={hasEndDate}
            onChange={(val) => setField("hasEndDate", val)}
          />
          {hasEndDate && (
            <InlineStack gap="400" wrap={false}>
              <div style={{ flex: 1 }}>
                <TextField
                  label="End date"
                  type="date"
                  value={endDate}
                  onChange={(val) => setField("endDate", val)}
                  autoComplete="off"
                />
              </div>
              <div style={{ flex: 1 }}>
                <TextField
                  label="End time"
                  type="time"
                  value={endTime}
                  onChange={(val) => setField("endTime", val)}
                  autoComplete="off"
                />
              </div>
            </InlineStack>
          )}
        </BlockStack>
      </Card>

      {/* ── Offer Conditions (Customer Buys + Customer Gets + Multi-apply) ── */}
      <Card>
        <BlockStack gap="400">
          <Text as="h2" variant="headingMd">
            Offer conditions
          </Text>

          {/* Customer Buys */}
          <BlockStack gap="300">
            <Text as="h3" variant="headingSm">
              Customer buys
            </Text>
            <InlineStack gap="400" wrap={false}>
              <div style={{ flex: 1 }}>
                <TextField
                  label="Minimum quantity"
                  type="number"
                  value={String(minimumQuantity)}
                  onChange={(val) => setField("minimumQuantity", parseInt(val) || 1)}
                  min={1}
                  autoComplete="off"
                />
              </div>
              <div style={{ flex: 1 }}>
                <Select
                  label="Condition type"
                  options={[
                    { label: "Specific products", value: "specificProducts" },
                    { label: "Specific collections", value: "specificCollections" },
                  ]}
                  value={buyConditionType}
                  onChange={(val) => setField("buyConditionType", val)}
                />
              </div>
            </InlineStack>
            <Button icon={PlusIcon} onClick={() => openBrowseModal("buy")}>
              {browseButtonLabel}
            </Button>

            {buyConditionType === "specificCollections"
              ? buyCollections.length > 0 && (
                  <div style={{ border: "1px solid var(--p-color-border)", borderRadius: "var(--p-border-radius-300)", overflow: "hidden" }}>
                    {buyCollections.map((collection, i) => (
                      <div key={collection.collectionId}>
                        {i > 0 && <Divider />}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            padding: "8px 12px",
                          }}
                        >
                          {collection.imageUrl ? (
                            <Thumbnail
                              source={collection.imageUrl}
                              alt={collection.title}
                              size="small"
                            />
                          ) : (
                            <div
                              style={{
                                width: 40,
                                height: 40,
                                background: "#f0f0f0",
                                borderRadius: 4,
                              }}
                            />
                          )}
                          <div style={{ flex: 1 }}>
                            <Text as="span" variant="bodyMd" fontWeight="semibold">
                              {collection.title}
                            </Text>
                          </div>
                          <Button
                            variant="plain"
                            tone="critical"
                            icon={DeleteIcon}
                            onClick={() => removeBuyCollection(collection.collectionId)}
                            accessibilityLabel={`Remove ${collection.title}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )
              : buyProducts.length > 0 && (
                  <div style={{ border: "1px solid var(--p-color-border)", borderRadius: "var(--p-border-radius-300)", overflow: "hidden" }}>
                    {buyProducts.map((product, i) => {
                      const minPrice = product.priceRange?.minVariantPrice;
                      return (
                        <div key={product.productId}>
                          {i > 0 && <Divider />}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                              padding: "8px 12px",
                            }}
                          >
                            {product.imageUrl ? (
                              <Thumbnail
                                source={product.imageUrl}
                                alt={product.title}
                                size="small"
                              />
                            ) : (
                              <div
                                style={{
                                  width: 40,
                                  height: 40,
                                  background: "#f0f0f0",
                                  borderRadius: 4,
                                }}
                              />
                            )}
                            <div style={{ flex: 1 }}>
                              <Text as="span" variant="bodyMd" fontWeight="semibold">
                                {product.title}
                              </Text>
                              <Text as="p" variant="bodySm" tone="subdued">
                                {product.variants?.length ?? 0} of {product.totalVariants ?? 0}{" "}
                                variant{(product.totalVariants ?? 0) !== 1 ? "s" : ""} selected
                                {minPrice &&
                                  ` \u00B7 From ${formatPrice(minPrice.amount, "VND")}`}
                              </Text>
                            </div>
                            <Button
                              variant="plain"
                              tone="critical"
                              icon={DeleteIcon}
                              onClick={() => removeBuyProduct(product.productId)}
                              accessibilityLabel={`Remove ${product.title}`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
          </BlockStack>

          <Divider />

          {/* Customer Gets */}
          <BlockStack gap="300">
            <Text as="h3" variant="headingSm">
              Customer gets
            </Text>
            <Button icon={PlusIcon} onClick={() => openBrowseModal("gift")}>
              Browse products
            </Button>

            {getProducts.length > 0 && (
              <div style={{ border: "1px solid var(--p-color-border)", borderRadius: "var(--p-border-radius-300)", overflow: "hidden" }}>
                {getProducts.map((product, i) => {
                  const selectedCount = product.variants?.length ?? 0;
                  const totalCount = product.totalVariants ?? 0;
                  const variantLabel =
                    selectedCount === totalCount
                      ? "All variants"
                      : `${selectedCount} of ${totalCount} variants`;

                  return (
                    <div key={product.productId}>
                      {i > 0 && <Divider />}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "8px 12px",
                        }}
                      >
                        {product.imageUrl ? (
                          <Thumbnail
                            source={product.imageUrl}
                            alt={product.title}
                            size="small"
                          />
                        ) : (
                          <div
                            style={{
                              width: 40,
                              height: 40,
                              background: "#f0f0f0",
                              borderRadius: 4,
                            }}
                          />
                        )}
                        <div style={{ flex: 1 }}>
                          <Text as="span" variant="bodyMd" fontWeight="semibold">
                            {product.title}
                          </Text>
                          <Text as="p" variant="bodySm" tone="subdued">
                            {variantLabel}
                          </Text>
                        </div>
                        <div style={{ width: 80 }}>
                          <TextField
                            label="Qty"
                            labelHidden
                            type="number"
                            value={String(product.giftQuantity ?? 1)}
                            onChange={(val) =>
                              updateGetProductQuantity(
                                product.productId,
                                parseInt(val) || 1
                              )
                            }
                            min={1}
                            autoComplete="off"
                          />
                        </div>
                        <Button
                          variant="plain"
                          tone="critical"
                          icon={DeleteIcon}
                          onClick={() => removeGetProduct(product.productId)}
                          accessibilityLabel={`Remove ${product.title}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </BlockStack>

          <Divider />

          {/* Multi-apply */}
          <Checkbox
            label="Multi-apply"
            helpText="Allow this offer to apply multiple times when the customer meets the conditions more than once. For example, if the customer buys 4 items and the minimum is 2, they will receive the gift twice."
            checked={multiApply}
            onChange={(val) => setField("multiApply", val)}
          />
        </BlockStack>
      </Card>

      {/* ── Settings (Discount + Combinations + Customer Eligibility) ── */}
      <Card>
        <BlockStack gap="400">
          <Text as="h2" variant="headingMd">
            Settings
          </Text>

          {/* Discount Code */}
          <TextField
            label="Discount code"
            value={discountCode}
            onChange={(val) => setField("discountCode", val)}
            autoComplete="off"
            helpText="This code will be visible to customers in the cart."
          />

          <Divider />

          {/* Discount Type & Value */}
          <InlineStack gap="400" wrap={false}>
            <div style={{ flex: 1 }}>
              <Select
                label="Discount type"
                options={[
                  { label: "Free", value: "free" },
                  { label: "Percentage", value: "percentage" },
                  { label: "Fixed amount", value: "fixedAmount" },
                ]}
                value={discountType}
                onChange={(val) => setField("discountType", val)}
              />
            </div>
            {discountType !== "free" && (
              <div style={{ flex: 1 }}>
                <TextField
                  label={
                    discountType === "percentage"
                      ? "Discount percentage"
                      : "Discount amount"
                  }
                  type="number"
                  value={String(discountValue ?? "")}
                  onChange={(val) =>
                    setField("discountValue", val === "" ? null : parseFloat(val))
                  }
                  suffix={discountType === "percentage" ? "%" : "VND"}
                  autoComplete="off"
                />
              </div>
            )}
          </InlineStack>

          <Divider />

          {/* Combinations */}
          <BlockStack gap="200">
            <Text as="span" variant="bodyMd" fontWeight="semibold">
              Combinations
            </Text>
            <Checkbox
              label="Combine with product discounts"
              checked={combineProductDiscounts}
              onChange={(val) => setField("combineProductDiscounts", val)}
            />
            <Checkbox
              label="Combine with order discounts"
              checked={combineOrderDiscounts}
              onChange={(val) => setField("combineOrderDiscounts", val)}
            />
            <Checkbox
              label="Combine with shipping discounts"
              checked={combineShippingDiscounts}
              onChange={(val) => setField("combineShippingDiscounts", val)}
            />
          </BlockStack>

          <Divider />

          {/* Customer Eligibility */}
          <Select
          disabled
            label="Customer eligibility"
            options={[
              { label: "All customers", value: "allCustomers" },
              { label: "Customer segment", value: "customerSegment" },
              { label: "Specific link", value: "specificLink" },
              { label: "Customer location", value: "customerLocation" },
            ]}
            value={customerEligibility}
            onChange={(val) => setField("customerEligibility", val)}
          />
        </BlockStack>
      </Card>

      {/* Modals */}
      <OfferTitleModal
        open={offerTitleModalOpen}
        onClose={() => setOfferTitleModalOpen(false)}
      />

      <BrowseProductsModal
        open={browseModalOpen}
        onClose={() => setBrowseModalOpen(false)}
        onConfirm={handleBrowseConfirm}
        mode={browseMode}
        browseType={browseMode === "buy" && buyConditionType === "specificCollections" ? "collections" : "products"}
        initialSelected={
          browseMode === "buy"
            ? buyConditionType === "specificCollections"
              ? buyCollections
              : buyProducts
            : getProducts
        }
      />
    </BlockStack>
  );
}
