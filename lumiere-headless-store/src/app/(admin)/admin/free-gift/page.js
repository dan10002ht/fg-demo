"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Page,
  Tabs,
  Button,
  Banner,
  BlockStack,
  InlineStack,
  Text,
  Box,
  Card,
  Badge,
  IndexTable,
  EmptyState,
  Popover,
  ActionList,
} from "@shopify/polaris";
import { EditIcon, DeleteIcon } from "@shopify/polaris-icons";
import "@shopify/polaris/build/esm/styles.css";
import PolarisProvider from "@/components/admin/polaris-provider";
import ShopifyAdminShell from "@/components/admin/shopify-admin-shell";
import CampaignSetting from "@/components/admin/campaign-setting";
import CampaignSummary from "@/components/admin/campaign-summary";
import WidgetSetting from "@/components/admin/widget-setting";
import OfferTitleModal from "@/components/admin/offer-title-modal";
import useCampaignStore from "@/lib/campaign-store";
import GiftPopupContent from "@/components/gift/gift-popup-content";

/* ─── Toast notification ─── */
function Toast({ message, onDismiss }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        background: "#1a1a1a",
        color: "#fff",
        padding: "10px 20px",
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 500,
        zIndex: 500,
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        display: "flex",
        alignItems: "center",
        gap: 8,
        animation: "toast-in 0.25s ease-out",
      }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
        <circle cx="8" cy="8" r="7" fill="#2e7d32" />
        <path d="M5 8L7 10L11 6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {message}
      <button
        onClick={onDismiss}
        style={{
          background: "none",
          border: "none",
          color: "#999",
          cursor: "pointer",
          padding: 2,
          marginLeft: 4,
          display: "flex",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M4 4L10 10M10 4L4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      <style>{`@keyframes toast-in { from { opacity: 0; transform: translateX(-50%) translateY(10px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }`}</style>
    </div>
  );
}

/* ─── Skeleton bar for preview ─── */
function PSkel({ w = "100%", h = 10, r = 4 }) {
  return (
    <div style={{ width: w, height: h, background: "#ddd", borderRadius: r }} />
  );
}

/* ─── Phone store header ─── */
function StoreHeader() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 14px",
        background: "#f5f5f5",
      }}
    >
      <div style={{ width: 28, height: 28, background: "#ccc", borderRadius: 14 }} />
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        {/* Search */}
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
          <circle cx="9" cy="9" r="6" stroke="#666" strokeWidth="1.5" />
          <path d="M13.5 13.5L17 17" stroke="#666" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        {/* Account */}
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="7" r="3.5" stroke="#666" strokeWidth="1.5" />
          <path d="M3 17.5C3 14 6 12 10 12C14 12 17 14 17 17.5" stroke="#666" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        {/* Cart with badge */}
        <div style={{ position: "relative" }}>
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path d="M4 4H5.5L7.5 14H15" stroke="#666" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="8.5" cy="17" r="1.2" fill="#666" />
            <circle cx="14" cy="17" r="1.2" fill="#666" />
            <path d="M6 6.5H16.5L15 12H7.5" stroke="#666" strokeWidth="1.5" />
          </svg>
          <span
            style={{
              position: "absolute",
              top: -4,
              right: -6,
              width: 14,
              height: 14,
              borderRadius: 7,
              background: "#222",
              color: "#fff",
              fontSize: 8,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            2
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── PDP skeleton content ─── */
function PDPSkeleton() {
  return (
    <div style={{ padding: "0 14px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Main image */}
      <div style={{ width: "100%", aspectRatio: "4/3", background: "#e5e5e5", borderRadius: 8 }} />
      {/* Title + price */}
      <PSkel w="75%" h={14} />
      <PSkel w={50} h={10} />
      {/* Qty selector */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            border: "1px solid #ccc",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            color: "#666",
          }}
        >
          -
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#333" }}>1</span>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            border: "1px solid #ccc",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            color: "#666",
          }}
        >
          +
        </div>
      </div>
    </div>
  );
}

/* ─── Customer Chooses Preview ─── */
function CustomerChoosesPreview() {
  const popupTitle = useCampaignStore((s) => s.popupTitle);
  const popupDescription = useCampaignStore((s) => s.popupDescription);
  const getProducts = useCampaignStore((s) => s.getProducts);

  const previewGifts = getProducts?.length > 0
    ? getProducts.map((p) => ({
        id: p.productId || p.title,
        title: p.title || "Gift Product",
        imageUrl: p.imageUrl || null,
        price: parseFloat(p.price || 0),
        currencyCode: "USD",
      }))
    : [{ id: "preview-1", title: "Gift Product", imageUrl: null, price: 786, currencyCode: "USD" }];

  return (
    <div style={{ position: "relative" }}>
      <StoreHeader />
      <PDPSkeleton />
      <GiftPopupContent
        title={popupTitle}
        description={popupDescription}
        gifts={previewGifts}
        selectedId={previewGifts[0]?.id}
        interactive={false}
      />
    </div>
  );
}

/* ─── Automatically Preview ─── */
function AutomaticallyPreview() {
  const congratsBarTitle = useCampaignStore((s) => s.congratsBarTitle);

  return (
    <div style={{ position: "relative" }}>
      <StoreHeader />
      <PDPSkeleton />

      {/* Extra description skeleton area */}
      <div style={{ padding: "0 14px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ width: "100%", height: 80, background: "#e5e5e5", borderRadius: 8 }} />
        <PSkel w="90%" h={10} />
        <PSkel w="60%" h={10} />
      </div>

      {/* Spacer to push bar to bottom */}
      <div style={{ height: 40 }} />

      {/* Congratulation bar */}
      <div
        style={{
          margin: "0 10px 12px",
          padding: "12px 14px",
          background: "#ffe0e0",
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        {/* Gift icon */}
        <span style={{ fontSize: 20, flexShrink: 0 }}>{"\uD83C\uDF81"}</span>
        <div style={{ flex: 1, fontSize: 11, color: "#8b0000", fontWeight: 600, lineHeight: "15px" }}>
          {congratsBarTitle}
        </div>
        <span style={{ fontSize: 13, color: "#8b0000", cursor: "default", flexShrink: 0 }}>&times;</span>
      </div>
    </div>
  );
}

/* ─── Widget Preview Sidebar ─── */
function WidgetPreview() {
  const giftSelectionMethod = useCampaignStore((s) => s.giftSelectionMethod);

  return (
    <Card>
      <BlockStack gap="400">
        <InlineStack align="space-between" blockAlign="center">
          <Text as="h2" variant="headingMd">
            Preview
          </Text>
          {/* Device icon */}
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <rect x="5" y="2" width="10" height="16" rx="1.5" stroke="#666" strokeWidth="1.5" />
            <circle cx="10" cy="15.5" r="0.75" fill="#666" />
          </svg>
        </InlineStack>

        {/* Phone frame */}
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: 16,
            overflow: "hidden",
            background: "#fff",
          }}
        >
          {giftSelectionMethod === "customerChooses" ? (
            <CustomerChoosesPreview />
          ) : (
            <AutomaticallyPreview />
          )}
        </div>
      </BlockStack>
    </Card>
  );
}

/* ─── Shopify discount sync helpers ─── */
async function syncToggleActive(campaign) {
  if (!campaign.shopifyDiscountId) return;
  try {
    await fetch("/api/discount", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: campaign.isActive ? "deactivate" : "activate",
        discountId: campaign.shopifyDiscountId,
      }),
    });
  } catch (err) {
    console.error("Failed to sync discount status:", err);
  }
}

async function syncDeleteDiscount(campaign) {
  if (!campaign.shopifyDiscountId) return;
  try {
    await fetch("/api/discount", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "delete",
        discountId: campaign.shopifyDiscountId,
      }),
    });
  } catch (err) {
    console.error("Failed to delete discount on Shopify:", err);
  }
}

/* ─── Campaigns List View ─── */
function CampaignsList({ onCreateCampaign, onEditCampaign }) {
  const campaigns = useCampaignStore((s) => s.campaigns);
  const toggleCampaignActive = useCampaignStore((s) => s.toggleCampaignActive);
  const deleteCampaign = useCampaignStore((s) => s.deleteCampaign);

  const getDiscountLabel = (type) => {
    if (type === "free") return "Free";
    if (type === "percentage") return "Percentage";
    return "Fixed amount";
  };

  const getScheduleLabel = (c) => {
    if (c.hasEndDate && c.endDate) return `${c.startDate} → ${c.endDate}`;
    return `From ${c.startDate}`;
  };

  const handleToggleActive = useCallback((campaign) => {
    syncToggleActive(campaign);
    toggleCampaignActive(campaign.id);
  }, [toggleCampaignActive]);

  const handleDelete = useCallback((campaign) => {
    syncDeleteDiscount(campaign);
    deleteCampaign(campaign.id);
  }, [deleteCampaign]);

  return (
    <Page
      title="Campaigns"
      subtitle="Manage your Buy X Get Y free gift campaigns"
      primaryAction={{
        content: "Create campaign",
        onAction: onCreateCampaign,
      }}
    >
      {campaigns.length === 0 ? (
        <Card>
          <EmptyState
            heading="Create your first campaign"
            image={null}
            action={{
              content: "Create campaign",
              onAction: onCreateCampaign,
            }}
          >
            <p>
              Set up a Buy X Get Y free gift campaign to boost your sales.
            </p>
          </EmptyState>
        </Card>
      ) : (
        <Card padding="0">
          <IndexTable
            itemCount={campaigns.length}
            headings={[
              { title: "Campaign" },
              { title: "Status" },
              { title: "Trigger products" },
              { title: "Gift products" },
              { title: "Discount" },
              { title: "Schedule" },
              { title: "" },
            ]}
            selectable={false}
          >
            {campaigns.map((campaign, index) => (
              <IndexTable.Row key={campaign.id} id={campaign.id} position={index}>
                <IndexTable.Cell>
                  <Text as="span" variant="bodyMd" fontWeight="semibold">
                    {campaign.offerTitle}
                  </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>
                  <Badge tone={campaign.isActive ? "success" : undefined}>
                    {campaign.isActive ? "Active" : "Inactive"}
                  </Badge>
                </IndexTable.Cell>
                <IndexTable.Cell>
                  <Text as="span" variant="bodySm">
                    {campaign.buyProducts?.length ?? 0} product
                    {(campaign.buyProducts?.length ?? 0) !== 1 ? "s" : ""}
                  </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>
                  <Text as="span" variant="bodySm">
                    {campaign.getProducts?.length ?? 0} product
                    {(campaign.getProducts?.length ?? 0) !== 1 ? "s" : ""}
                  </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>
                  <Text as="span" variant="bodySm">
                    {getDiscountLabel(campaign.discountType)}
                  </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>
                  <Text as="span" variant="bodySm" tone="subdued">
                    {getScheduleLabel(campaign)}
                  </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>
                  <InlineStack gap="200">
                    <Button
                      size="slim"
                      onClick={() => onEditCampaign(campaign.id)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="slim"
                      variant="plain"
                      tone={campaign.isActive ? "critical" : undefined}
                      onClick={() => handleToggleActive(campaign)}
                    >
                      {campaign.isActive ? "Disable" : "Enable"}
                    </Button>
                    <Button
                      size="slim"
                      variant="plain"
                      tone="critical"
                      icon={DeleteIcon}
                      onClick={() => handleDelete(campaign)}
                      accessibilityLabel={`Delete ${campaign.offerTitle}`}
                    />
                  </InlineStack>
                </IndexTable.Cell>
              </IndexTable.Row>
            ))}
          </IndexTable>
        </Card>
      )}

      {campaigns.length > 0 && (
        <Box paddingBlockStart="400">
          <Banner tone="info">
            <p>
              Only one campaign per type can be active at a time. Enabling a
              campaign will automatically disable other campaigns of the same
              type.
            </p>
          </Banner>
        </Box>
      )}
    </Page>
  );
}

/* ─── Contextual Save Bar (full-width, fixed below topbar) ─── */
function SaveBar({ dirty, saving, onSave, onDiscard }) {
  if (!dirty) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 200,
        background: "#1a1a1a",
        padding: "10px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        boxShadow: "0 2px 6px rgba(0,0,0,.2)",
      }}
    >
      <span style={{ fontSize: 13, color: "#e0e0e0" }}>
        Unsaved changes
      </span>
      <div style={{ display: "flex", gap: 8, marginLeft: 8 }}>
        <Button onClick={onDiscard} size="slim">
          Discard
        </Button>
        <Button variant="primary" onClick={onSave} size="slim" loading={saving}>
          Save
        </Button>
      </div>
    </div>
  );
}

/* ─── Campaign Editor View (with Campaign Setting / Widget Setting tabs) ─── */
function CampaignEditor({ onBack }) {
  const [selectedTab, setSelectedTab] = useState(0);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [offerTitleModalOpen, setOfferTitleModalOpen] = useState(false);
  const [popoverActive, setPopoverActive] = useState(false);
  const saveCampaign = useCampaignStore((s) => s.saveCampaign);
  const offerTitle = useCampaignStore((s) => s.offerTitle);
  const editingCampaignId = useCampaignStore((s) => s.editingCampaignId);
  const isActive = useCampaignStore((s) => s.isActive);
  const setField = useCampaignStore((s) => s.setField);

  // Track dirty state — subscribe to store changes
  useEffect(() => {
    const unsub = useCampaignStore.subscribe(() => {
      setDirty(true);
    });
    return unsub;
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaveError(null);

    // 1. Save to localStorage first
    saveCampaign();

    // 2. Sync discount to Shopify Admin API
    try {
      const state = useCampaignStore.getState();
      const campaignData = {
        offerTitle: state.offerTitle,
        discountCode: state.discountCode,
        discountType: state.discountType,
        discountValue: state.discountValue,
        startDate: state.startDate,
        startTime: state.startTime,
        hasEndDate: state.hasEndDate,
        endDate: state.endDate,
        endTime: state.endTime,
        minimumQuantity: state.minimumQuantity,
        buyConditionType: state.buyConditionType,
        buyProducts: state.buyProducts,
        buyCollections: state.buyCollections,
        getProducts: state.getProducts,
        multiApply: state.multiApply,
        combineProductDiscounts: state.combineProductDiscounts,
        combineOrderDiscounts: state.combineOrderDiscounts,
        combineShippingDiscounts: state.combineShippingDiscounts,
      };

      const currentDiscountId = state.shopifyDiscountId;

      const res = await fetch("/api/discount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: currentDiscountId ? "update" : "create",
          campaign: campaignData,
          discountId: currentDiscountId || undefined,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to sync discount");
      }

      // Store the Shopify discount ID back
      if (result.discountId && result.discountId !== currentDiscountId) {
        setField("shopifyDiscountId", result.discountId);
        // Re-save to persist the new discount ID
        useCampaignStore.getState().saveCampaign();
      }

      setDirty(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Discount sync error:", err);
      setSaveError(err.message);
      // Still mark as saved locally even if Shopify sync fails
      setDirty(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 5000);
    } finally {
      setSaving(false);
    }
  }, [saveCampaign, setField]);

  const handleDiscard = useCallback(() => {
    if (editingCampaignId) {
      // Re-load the original campaign data
      useCampaignStore.getState().editCampaign(editingCampaignId);
    } else {
      useCampaignStore.getState().createNewCampaign();
    }
    setDirty(false);
  }, [editingCampaignId]);

  const tabs = [
    { id: "campaign-setting", content: "Campaign Setting" },
    { id: "widget-setting", content: "Widget Setting" },
  ];

  return (
    <>
      <SaveBar
        dirty={dirty}
        saving={saving}
        onSave={handleSave}
        onDiscard={handleDiscard}
      />
      <Page
        title={offerTitle}
        titleMetadata={
          <InlineStack gap="200" blockAlign="center">
            <Button
              variant="plain"
              icon={EditIcon}
              onClick={() => setOfferTitleModalOpen(true)}
              accessibilityLabel="Edit offer title"
            />
            <Badge tone={isActive ? "success" : "critical"}>
              {isActive ? "Active" : "Inactive"}
            </Badge>
          </InlineStack>
        }
        subtitle={
          editingCampaignId
            ? "Edit your Buy X Get Y free gift promotion"
            : "Create a new Buy X Get Y free gift promotion"
        }
        backAction={{ content: "Campaigns", onAction: onBack }}
        secondaryActions={
          <Popover
            active={popoverActive}
            activator={
              <Button
                onClick={() => setPopoverActive((v) => !v)}
                disclosure
                accessibilityLabel="Change status"
              >
                  {isActive ? "Active" : "Inactive"}
              </Button>
            }
            onClose={() => setPopoverActive(false)}
          >
            <ActionList
              items={[
                {
                  content: "Set as active",
                  active: isActive,
                  onAction: () => {
                    setField("isActive", true);
                    setPopoverActive(false);
                  },
                },
                {
                  content: "Set as inactive",
                  active: !isActive,
                  onAction: () => {
                    setField("isActive", false);
                    setPopoverActive(false);
                  },
                },
              ]}
            />
          </Popover>
        }
      >
        <BlockStack gap="400">
          {saved && !saveError && (
            <Toast
              message="Campaign saved and synced to Shopify"
              onDismiss={() => setSaved(false)}
            />
          )}
          {saveError && (
            <Banner
              title="Saved locally, but Shopify sync failed"
              tone="warning"
              onDismiss={() => setSaveError(null)}
            >
              <p>{saveError}</p>
            </Banner>
          )}

          <Tabs tabs={tabs} selected={selectedTab} onSelect={setSelectedTab}>
            <Box paddingBlockStart="400">
              {selectedTab === 0 && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr",
                    gap: "16px",
                    alignItems: "start",
                  }}
                >
                  <CampaignSetting />
                  <CampaignSummary />
                </div>
              )}

              {selectedTab === 1 && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr",
                    gap: "16px",
                    alignItems: "start",
                  }}
                >
                  <WidgetSetting />
                  <WidgetPreview />
                </div>
              )}
            </Box>
          </Tabs>
        </BlockStack>

        <OfferTitleModal
          open={offerTitleModalOpen}
          onClose={() => setOfferTitleModalOpen(false)}
        />
      </Page>
    </>
  );
}

/* ─── Main Page ─── */
export default function FreeGiftAdminPage() {
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState("list"); // "list" | "editor"

  const loadCampaigns = useCampaignStore((s) => s.loadCampaigns);
  const createNewCampaign = useCampaignStore((s) => s.createNewCampaign);
  const editCampaign = useCampaignStore((s) => s.editCampaign);

  useEffect(() => {
    loadCampaigns();
    setMounted(true);
  }, [loadCampaigns]);

  const handleCreate = useCallback(() => {
    createNewCampaign();
    setView("editor");
  }, [createNewCampaign]);

  const handleEdit = useCallback(
    (id) => {
      editCampaign(id);
      setView("editor");
    },
    [editCampaign]
  );

  const handleBack = useCallback(() => {
    loadCampaigns();
    setView("list");
  }, [loadCampaigns]);

  if (!mounted) return null;

  return (
    <PolarisProvider>
      <ShopifyAdminShell activePage={view === "list" ? "app" : "campaigns"}>
        {view === "list" ? (
          <CampaignsList
            onCreateCampaign={handleCreate}
            onEditCampaign={handleEdit}
          />
        ) : (
          <CampaignEditor onBack={handleBack} />
        )}
      </ShopifyAdminShell>
    </PolarisProvider>
  );
}
