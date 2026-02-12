"use client";

import { Card, Text, Badge, BlockStack, InlineStack, Divider } from "@shopify/polaris";
import useCampaignStore from "@/lib/campaign-store";

export default function CampaignSummary() {
  const isActive = useCampaignStore((s) => s.isActive);
  const startDate = useCampaignStore((s) => s.startDate);
  const startTime = useCampaignStore((s) => s.startTime);
  const hasEndDate = useCampaignStore((s) => s.hasEndDate);
  const endDate = useCampaignStore((s) => s.endDate);
  const endTime = useCampaignStore((s) => s.endTime);
  const minimumQuantity = useCampaignStore((s) => s.minimumQuantity);
  const buyProducts = useCampaignStore((s) => s.buyProducts);
  const getProducts = useCampaignStore((s) => s.getProducts);
  const discountCode = useCampaignStore((s) => s.discountCode);
  const discountType = useCampaignStore((s) => s.discountType);
  const discountValue = useCampaignStore((s) => s.discountValue);
  const customerEligibility = useCampaignStore((s) => s.customerEligibility);
  const promotionBadgeEnabled = useCampaignStore((s) => s.promotionBadgeEnabled);
  const promotionBadgeText = useCampaignStore((s) => s.promotionBadgeText);

  const discountLabel = (() => {
    if (discountType === "free") return "Free";
    if (discountType === "percentage") return `${discountValue ?? 0}% off`;
    if (discountType === "fixedAmount") return `${discountValue ?? 0} VND off`;
    return discountType;
  })();

  const eligibilityLabel = (() => {
    switch (customerEligibility) {
      case "allCustomers":
        return "All customers";
      case "customerSegment":
        return "Customer segment";
      case "specificLink":
        return "Specific link";
      case "customerLocation":
        return "Customer location";
      default:
        return customerEligibility;
    }
  })();

  const formatSchedule = () => {
    let schedule = `Starts: ${startDate} at ${startTime}`;
    if (hasEndDate && endDate) {
      schedule += ` | Ends: ${endDate} at ${endTime}`;
    } else {
      schedule += " | No end date";
    }
    return schedule;
  };

  return (
    <Card>
      <BlockStack gap="400">
        <InlineStack align="space-between" blockAlign="center">
          <Text as="h2" variant="headingMd">
            Summary
          </Text>
          <Badge tone={isActive ? "success" : "critical"}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
        </InlineStack>

        <Divider />

        {/* Schedule */}
        <BlockStack gap="100">
          <Text as="span" variant="bodySm" fontWeight="semibold">
            Schedule
          </Text>
          <Text as="p" variant="bodySm" tone="subdued">
            {formatSchedule()}
          </Text>
        </BlockStack>

        <Divider />

        {/* Customer Buys */}
        <BlockStack gap="100">
          <Text as="span" variant="bodySm" fontWeight="semibold">
            Customer buys
          </Text>
          <Text as="p" variant="bodySm" tone="subdued">
            Minimum {minimumQuantity} item{minimumQuantity !== 1 ? "s" : ""} of:
          </Text>
          {buyProducts.length > 0 ? (
            <BlockStack gap="100">
              {buyProducts.map((p) => (
                <Text key={p.productId} as="p" variant="bodySm">
                  {p.title}
                </Text>
              ))}
            </BlockStack>
          ) : (
            <Text as="p" variant="bodySm" tone="subdued">
              No products selected
            </Text>
          )}
        </BlockStack>

        <Divider />

        {/* Customer Gets */}
        <BlockStack gap="100">
          <Text as="span" variant="bodySm" fontWeight="semibold">
            Customer gets
          </Text>
          {getProducts.length > 0 ? (
            <BlockStack gap="100">
              {getProducts.map((p) => (
                <Text key={p.productId} as="p" variant="bodySm">
                  {p.title} x{p.giftQuantity ?? 1}
                </Text>
              ))}
            </BlockStack>
          ) : (
            <Text as="p" variant="bodySm" tone="subdued">
              No gift products selected
            </Text>
          )}
        </BlockStack>

        <Divider />

        {/* Discount */}
        <BlockStack gap="100">
          <Text as="span" variant="bodySm" fontWeight="semibold">
            Discount
          </Text>
          <Text as="p" variant="bodySm" tone="subdued">
            {discountLabel} &middot; Code: {discountCode}
          </Text>
        </BlockStack>

        <Divider />

        {/* Eligibility */}
        <BlockStack gap="100">
          <Text as="span" variant="bodySm" fontWeight="semibold">
            Eligibility
          </Text>
          <Text as="p" variant="bodySm" tone="subdued">
            {eligibilityLabel}
          </Text>
        </BlockStack>

        <Divider />

        {/* Promotion Badge */}
        <BlockStack gap="100">
          <Text as="span" variant="bodySm" fontWeight="semibold">
            Promotion Badge
          </Text>
          <Text as="p" variant="bodySm" tone="subdued">
            {promotionBadgeEnabled ? promotionBadgeText || "Enabled" : "Disabled"}
          </Text>
        </BlockStack>
      </BlockStack>
    </Card>
  );
}
