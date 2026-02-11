"use client";

import { useState, useEffect, useCallback } from "react";
import {
  AppProvider,
  Page,
  Layout,
  Card,
  FormLayout,
  TextField,
  Select,
  Checkbox,
  Button,
  Banner,
  Badge,
  Text,
  InlineStack,
  BlockStack,
  Divider,
  ChoiceList,
  Box,
} from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";
import defaultConfig from "@/config/free-gift.json";
import { saveFreeGiftConfig, getFreeGiftConfig } from "@/lib/free-gift";

export default function FreeGiftAdminPage() {
  const [config, setConfig] = useState(defaultConfig);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setConfig(getFreeGiftConfig());
  }, []);

  const updateField = useCallback((field, value) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
    setDirty(true);
    setSaved(false);
  }, []);

  const handleSave = useCallback(() => {
    saveFreeGiftConfig(config);
    setSaved(true);
    setDirty(false);
    setTimeout(() => setSaved(false), 3000);
  }, [config]);

  const handleReset = useCallback(() => {
    saveFreeGiftConfig(defaultConfig);
    setConfig(defaultConfig);
    setDirty(false);
    setSaved(false);
  }, []);

  if (!mounted) return null;

  return (
    <AppProvider i18n={{}}>
      <Page
        title="Free Gift Configuration"
        subtitle="Configure automatic free gift rules for your store"
        backAction={{ content: "Back to Store", url: "/" }}
        primaryAction={{
          content: saved ? "Saved!" : "Save",
          onAction: handleSave,
          disabled: !dirty,
          loading: false,
        }}
        secondaryActions={[
          {
            content: "Reset to Defaults",
            onAction: handleReset,
            destructive: true,
          },
        ]}
      >
        <Layout>
          {/* Success banner */}
          {saved && (
            <Layout.Section>
              <Banner
                title="Configuration saved successfully"
                tone="success"
                onDismiss={() => setSaved(false)}
              />
            </Layout.Section>
          )}

          {/* Rule Status */}
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="h2" variant="headingMd">
                    Rule Status
                  </Text>
                  <Badge tone={config.isActive ? "success" : "critical"}>
                    {config.isActive ? "Active" : "Inactive"}
                  </Badge>
                </InlineStack>
                <Checkbox
                  label="Enable free gift rule"
                  helpText="When active, customers will automatically receive a free gift when they add a qualifying product to cart"
                  checked={config.isActive}
                  onChange={(val) => updateField("isActive", val)}
                />
              </BlockStack>
            </Card>
          </Layout.Section>

          {/* Trigger Product + Gift Product side by side */}
          <Layout.Section>
            <Layout>
              <Layout.Section variant="oneHalf">
                <Card>
                  <BlockStack gap="400">
                    <Text as="h2" variant="headingMd">
                      Trigger Product
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      Define which products will trigger the free gift
                    </Text>
                    <ChoiceList
                      title="Match by"
                      choices={[
                        {
                          label: "Product Type",
                          value: "productType",
                          helpText: 'e.g. "T-Shirt"',
                        },
                        {
                          label: "Product Tag",
                          value: "tag",
                          helpText: 'e.g. "gift-trigger"',
                        },
                        {
                          label: "Specific Product (handle)",
                          value: "specificProduct",
                          helpText: 'e.g. "classic-tshirt"',
                        },
                      ]}
                      selected={[config.triggerType]}
                      onChange={([val]) => updateField("triggerType", val)}
                    />
                    <TextField
                      label="Trigger Value"
                      value={config.triggerValue}
                      onChange={(val) => updateField("triggerValue", val)}
                      placeholder={
                        config.triggerType === "productType"
                          ? "T-Shirt"
                          : config.triggerType === "tag"
                          ? "gift-trigger"
                          : "classic-tshirt"
                      }
                      helpText="The value to match against the selected trigger type"
                      autoComplete="off"
                    />
                  </BlockStack>
                </Card>
              </Layout.Section>

              <Layout.Section variant="oneHalf">
                <Card>
                  <BlockStack gap="400">
                    <Text as="h2" variant="headingMd">
                      Gift Product
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      Select the product to give as a free gift
                    </Text>
                    <TextField
                      label="Gift Product Handle"
                      value={config.giftProductHandle}
                      onChange={(val) => updateField("giftProductHandle", val)}
                      placeholder="classic-socks"
                      helpText="The URL handle of the gift product on Shopify"
                      autoComplete="off"
                    />
                    <TextField
                      label="Gift Variant ID"
                      value={config.giftVariantId || ""}
                      onChange={(val) =>
                        updateField("giftVariantId", val || null)
                      }
                      placeholder="Leave empty for first available variant"
                      helpText="Specific variant to use as gift (optional)"
                      autoComplete="off"
                    />
                  </BlockStack>
                </Card>
              </Layout.Section>
            </Layout>
          </Layout.Section>

          {/* Gift Rules */}
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Gift Rules
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  Configure how gift quantities are calculated
                </Text>

                <ChoiceList
                  title="Quantity Mode"
                  choices={[
                    {
                      label: "Fixed",
                      value: "fixed",
                      helpText:
                        "Always give the same number of gifts regardless of trigger quantity",
                    },
                    {
                      label: "Per Item",
                      value: "perItem",
                      helpText:
                        "Give 1 gift for each trigger product (e.g. buy 3 T-Shirts → get 3 Socks)",
                    },
                  ]}
                  selected={[config.quantityMode]}
                  onChange={([val]) => updateField("quantityMode", val)}
                />

                <FormLayout>
                  <FormLayout.Group>
                    <TextField
                      label="Fixed Quantity"
                      type="number"
                      min={1}
                      value={String(config.fixedQuantity)}
                      onChange={(val) =>
                        updateField("fixedQuantity", parseInt(val) || 1)
                      }
                      helpText="Number of gifts when using Fixed mode"
                      autoComplete="off"
                    />
                    <TextField
                      label="Max Gift Quantity"
                      type="number"
                      min={1}
                      value={String(config.maxGiftQuantity)}
                      onChange={(val) =>
                        updateField("maxGiftQuantity", parseInt(val) || 1)
                      }
                      helpText="Maximum gifts a customer can receive"
                      autoComplete="off"
                    />
                  </FormLayout.Group>
                </FormLayout>
              </BlockStack>
            </Card>
          </Layout.Section>

          {/* Display Settings */}
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Display Settings
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  Customize how the gift promotion appears to customers
                </Text>

                <FormLayout>
                  <TextField
                    label="Gift Label"
                    value={config.giftLabel}
                    onChange={(val) => updateField("giftLabel", val)}
                    placeholder="Free Gift"
                    helpText="Label shown on the gift item badge in cart"
                    autoComplete="off"
                  />
                  <TextField
                    label="Banner Text"
                    value={config.bannerText}
                    onChange={(val) => updateField("bannerText", val)}
                    placeholder="Buy this product and get a free gift!"
                    helpText="Promotional text on the product detail page"
                    autoComplete="off"
                  />
                  <Checkbox
                    label="Show banner on Product Detail Page"
                    helpText="Display the gift promotion banner on qualifying product pages"
                    checked={config.showBannerOnPDP}
                    onChange={(val) => updateField("showBannerOnPDP", val)}
                  />
                </FormLayout>
              </BlockStack>
            </Card>
          </Layout.Section>

          {/* Preview */}
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Preview
                </Text>
                <Banner tone="info" title={config.bannerText || "Buy this product and get a free gift!"}>
                  <p>
                    Gift product: <strong>{config.giftProductHandle || "..."}</strong>
                    {" | "}
                    Mode: <strong>{config.quantityMode}</strong>
                    {" | "}
                    Max qty: <strong>{config.maxGiftQuantity}</strong>
                  </p>
                </Banner>
                <Text as="p" variant="bodySm" tone="subdued">
                  This is how the promotion banner will appear on qualifying product pages.
                </Text>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    </AppProvider>
  );
}
