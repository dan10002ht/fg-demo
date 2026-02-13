"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Modal,
  TextField,
  Spinner,
  Text,
  InlineStack,
  BlockStack,
  Checkbox,
  Thumbnail,
  Icon,
} from "@shopify/polaris";
import { SearchIcon } from "@shopify/polaris-icons";
import { getProducts, getCollections, formatPrice } from "@/lib/shopify";

/* ─── Variant Sub-Item Row ─── */
function VariantRow({ variant, checked, onToggle }) {
  const qty = variant.quantityAvailable;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "6px 0",
      }}
    >
      <InlineStack gap="200" blockAlign="center">
        <Checkbox
          label=""
          labelHidden
          checked={checked}
          onChange={onToggle}
        />
        <Text as="span" variant="bodySm">
          {variant.title}
        </Text>
        {qty != null && (
          <Text as="span" variant="bodySm" tone={qty === 0 ? "critical" : "subdued"}>
            {qty === 0 ? "Out of stock" : `${qty} available`}
          </Text>
        )}
      </InlineStack>
      <Text as="span" variant="bodySm">
        {formatPrice(variant.price.amount, "VND")}
      </Text>
    </div>
  );
}

/**
 * @param {Object} props
 * @param {boolean} props.open
 * @param {Function} props.onClose
 * @param {Function} props.onConfirm
 * @param {"buy"|"gift"} props.mode
 * @param {"products"|"collections"} props.browseType - what to browse
 */
export default function BrowseProductsModal({ open, onClose, onConfirm, mode, browseType = "products", initialSelected = [] }) {
  const isCollections = browseType === "collections";

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState({});

  useEffect(() => {
    if (open) {
      setSearchQuery("");
      if (isCollections) {
        fetchCollections();
      } else {
        fetchProducts();
      }
    }
  }, [open, isCollections]);

  const buildInitialProductSelection = (fetched) => {
    if (initialSelected.length === 0) return {};
    const initialMap = new Map(initialSelected.map((p) => [p.productId, p]));
    const preSelected = {};
    fetched.forEach((product) => {
      const init = initialMap.get(product.id);
      if (init) {
        preSelected[product.id] = {
          product,
          selectedVariants: new Set(init.variants?.map((v) => v.id) || []),
        };
      }
    });
    return preSelected;
  };

  const buildInitialCollectionSelection = (fetched) => {
    if (initialSelected.length === 0) return {};
    const initialIds = new Set(initialSelected.map((c) => c.collectionId));
    const preSelected = {};
    fetched.forEach((collection) => {
      if (initialIds.has(collection.id)) {
        preSelected[collection.id] = { collection };
      }
    });
    return preSelected;
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { products: fetched } = await getProducts({ first: 50 });
      setItems(fetched);
      setSelectedItems(buildInitialProductSelection(fetched));
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setItems([]);
      setSelectedItems({});
    } finally {
      setLoading(false);
    }
  };

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const fetched = await getCollections(50);
      setItems(fetched);
      setSelectedItems(buildInitialCollectionSelection(fetched));
    } catch (err) {
      console.error("Failed to fetch collections:", err);
      setItems([]);
      setSelectedItems({});
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter((item) => item.title.toLowerCase().includes(q));
  }, [items, searchQuery]);

  /* ── Product selection logic ── */
  const toggleProduct = useCallback((product) => {
    setSelectedItems((prev) => {
      const existing = prev[product.id];
      if (existing) {
        const { [product.id]: _, ...rest } = prev;
        return rest;
      }
      const availableVariants = product.variants.edges
        .filter((e) => e.node.availableForSale)
        .map((e) => e.node.id);
      return {
        ...prev,
        [product.id]: {
          product,
          selectedVariants: new Set(availableVariants),
        },
      };
    });
  }, []);

  const toggleVariant = useCallback((product, variantId) => {
    setSelectedItems((prev) => {
      const existing = prev[product.id];
      if (!existing) {
        return {
          ...prev,
          [product.id]: {
            product,
            selectedVariants: new Set([variantId]),
          },
        };
      }
      const newVariants = new Set(existing.selectedVariants);
      if (newVariants.has(variantId)) {
        newVariants.delete(variantId);
      } else {
        newVariants.add(variantId);
      }
      if (newVariants.size === 0) {
        const { [product.id]: _, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [product.id]: {
          ...existing,
          selectedVariants: newVariants,
        },
      };
    });
  }, []);

  /* ── Collection selection logic ── */
  const toggleCollection = useCallback((collection) => {
    setSelectedItems((prev) => {
      if (prev[collection.id]) {
        const { [collection.id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [collection.id]: { collection } };
    });
  }, []);

  const selectedCount = Object.keys(selectedItems).length;

  const handleConfirm = () => {
    if (isCollections) {
      const result = Object.values(selectedItems).map(({ collection }) => ({
        collectionId: collection.id,
        title: collection.title,
        handle: collection.handle,
        imageUrl: collection.image?.url || null,
      }));
      onConfirm(result);
    } else {
      const result = Object.values(selectedItems).map(({ product, selectedVariants }) => {
        const allVariants = product.variants.edges.map((e) => e.node);
        const selected = allVariants.filter((v) => selectedVariants.has(v.id));
        const imageUrl =
          product.images.edges.length > 0 ? product.images.edges[0].node.url : null;
        return {
          productId: product.id,
          title: product.title,
          handle: product.handle,
          imageUrl,
          variants: selected,
          totalVariants: allVariants.length,
          priceRange: product.priceRange,
        };
      });
      onConfirm(result);
    }
    onClose();
  };

  /* ── Render a product row ── */
  const renderProductItem = (product, index) => {
    const isSelected = !!selectedItems[product.id];
    const variants = product.variants.edges.map((e) => e.node);
    const isSingleVariant = variants.length === 1;
    const imageUrl =
      product.images.edges.length > 0 ? product.images.edges[0].node.url : null;
    const selectedVariantCount = selectedItems[product.id]?.selectedVariants?.size ?? 0;
    const minPrice = product.priceRange?.minVariantPrice;

    // Single-variant: show price & stock inline on the product row
    const singleVariant = isSingleVariant ? variants[0] : null;
    const singleQty = singleVariant?.quantityAvailable;

    return (
      <div
        key={product.id}
        style={{
          borderBottom:
            index < filteredItems.length - 1
              ? "1px solid var(--p-color-border)"
              : "none",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 16px",
            cursor: "pointer",
          }}
          onClick={() => toggleProduct(product)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <Checkbox
              label=""
              labelHidden
              checked={isSelected}
              onChange={() => toggleProduct(product)}
            />
          </div>
          {imageUrl ? (
            <Thumbnail
              source={imageUrl}
              alt={product.title}
              size="small"
            />
          ) : (
            <div style={{ width: 40, height: 40, background: "#f0f0f0", borderRadius: 4 }} />
          )}
          <div style={{ flex: 1 }}>
            <Text as="span" variant="bodyMd" fontWeight="semibold">
              {product.title}
            </Text>
            {isSingleVariant ? (
              <InlineStack gap="100" blockAlign="center">
                <Text as="span" variant="bodySm">
                  {formatPrice(singleVariant.price.amount, "VND")}
                </Text>
                {singleQty != null && (
                  <Text as="span" variant="bodySm" tone={singleQty === 0 ? "critical" : "subdued"}>
                    · {singleQty === 0 ? "Out of stock" : `${singleQty} available`}
                  </Text>
                )}
              </InlineStack>
            ) : (
              <Text as="p" variant="bodySm" tone="subdued">
                {isSelected
                  ? `${selectedVariantCount} of ${variants.length} variants selected`
                  : `${variants.length} variants`}
                {minPrice && ` · From ${formatPrice(minPrice.amount, "VND")}`}
              </Text>
            )}
          </div>
        </div>

        {/* Only show variant sub-items for multi-variant products */}
        {!isSingleVariant && (
          <div
            style={{
              borderTop: "1px solid var(--p-color-border-secondary)",
              background: "var(--p-color-bg-surface-secondary)",
              paddingLeft: 76,
              paddingRight: 16,
              paddingBottom: 8,
              paddingTop: 4,
            }}
          >
            {variants.map((variant) => {
              const variantChecked =
                selectedItems[product.id]?.selectedVariants?.has(variant.id) ?? false;
              return (
                <VariantRow
                  key={variant.id}
                  variant={variant}
                  checked={variantChecked}
                  onToggle={() => toggleVariant(product, variant.id)}
                />
              );
            })}
          </div>
        )}
      </div>
    );
  };

  /* ── Render a collection row ── */
  const renderCollectionItem = (collection, index) => {
    const isSelected = !!selectedItems[collection.id];
    const imageUrl = collection.image?.url || null;

    return (
      <div
        key={collection.id}
        style={{
          borderBottom:
            index < filteredItems.length - 1
              ? "1px solid var(--p-color-border)"
              : "none",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 16px",
            cursor: "pointer",
          }}
          onClick={() => toggleCollection(collection)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <Checkbox
              label=""
              labelHidden
              checked={isSelected}
              onChange={() => toggleCollection(collection)}
            />
          </div>
          {imageUrl ? (
            <Thumbnail source={imageUrl} alt={collection.title} size="small" />
          ) : (
            <div
              style={{
                width: 40,
                height: 40,
                background: "#f0f0f0",
                borderRadius: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="4" width="16" height="12" rx="2" stroke="#999" strokeWidth="1.5" />
                <path d="M2 12l4-3 3 2 4-4 5 5" stroke="#999" strokeWidth="1.2" />
              </svg>
            </div>
          )}
          <div style={{ flex: 1 }}>
            <Text as="span" variant="bodyMd" fontWeight="semibold">
              {collection.title}
            </Text>
            {collection.description && (
              <Text as="p" variant="bodySm" tone="subdued">
                {collection.description.length > 60
                  ? collection.description.slice(0, 60) + "..."
                  : collection.description}
              </Text>
            )}
          </div>
        </div>
      </div>
    );
  };

  const entityLabel = isCollections ? "collection" : "product";
  const title = isCollections
    ? "Browse Collections"
    : mode === "gift"
      ? "Browse Gift Products"
      : "Browse Products";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      primaryAction={{
        content: `Add${selectedCount > 0 ? ` (${selectedCount})` : ""}`,
        onAction: handleConfirm,
        disabled: selectedCount === 0,
      }}
      secondaryActions={[
        {
          content: "Cancel",
          onAction: onClose,
        },
      ]}
      large
    >
      <Modal.Section>
        <BlockStack gap="400">
          <TextField
            placeholder={`Search ${isCollections ? "collections" : "products"}...`}
            value={searchQuery}
            onChange={setSearchQuery}
            prefix={<Icon source={SearchIcon} />}
            autoComplete="off"
            clearButton
            onClearButtonClick={() => setSearchQuery("")}
          />

          {selectedCount > 0 && (
            <Text as="p" variant="bodySm" tone="subdued">
              {selectedCount} {entityLabel}{selectedCount !== 1 ? "s" : ""} selected
            </Text>
          )}

          {loading ? (
            <InlineStack align="center">
              <Spinner size="large" />
            </InlineStack>
          ) : filteredItems.length === 0 ? (
            <Text as="p" tone="subdued">
              No {isCollections ? "collections" : "products"} found.
            </Text>
          ) : (
            <div
              style={{
                border: "1px solid var(--p-color-border)",
                borderRadius: "var(--p-border-radius-200)",
                overflow: "hidden",
              }}
            >
              {filteredItems.map((item, index) =>
                isCollections
                  ? renderCollectionItem(item, index)
                  : renderProductItem(item, index)
              )}
            </div>
          )}
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}
