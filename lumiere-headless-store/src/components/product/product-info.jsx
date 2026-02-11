"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Truck, Leaf, Hand, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import useCartStore from "@/store/cart-store";
import { formatPrice } from "@/lib/shopify";
import SubscriptionWidget from "@/components/subscription/subscription-widget";
import ProductBundleWidget from "@/components/subscription/product-bundle-widget";
import {
  getFreeGiftConfig,
  isGiftTriggerProduct,
  getGiftProduct,
  isGiftAvailable,
} from "@/lib/free-gift";

export default function ProductInfo({ product }) {
  const variants = product.variants.edges.map((edge) => edge.node);
  const [selectedVariant, setSelectedVariant] = useState(variants[0]);
  const { addItem, loading } = useCartStore();
  const [justAdded, setJustAdded] = useState(false);
  const [subscriptionSelection, setSubscriptionSelection] = useState(null);
  const [giftBanner, setGiftBanner] = useState(null);

  // Check if this product triggers a free gift
  useEffect(() => {
    let cancelled = false;

    async function checkGiftBanner() {
      const config = getFreeGiftConfig();
      if (!config.isActive || !config.showBannerOnPDP) {
        setGiftBanner(null);
        return;
      }

      if (!isGiftTriggerProduct(product, config)) {
        setGiftBanner(null);
        return;
      }

      // Fetch gift product to check availability
      const giftProd = await getGiftProduct(config);
      if (cancelled) return;

      if (giftProd && isGiftAvailable(giftProd, config)) {
        setGiftBanner({
          text: config.bannerText,
          giftTitle: giftProd.title,
          giftImage: giftProd.images?.edges?.[0]?.node?.url || null,
        });
      } else {
        setGiftBanner(null);
      }
    }

    checkGiftBanner();
    return () => { cancelled = true; };
  }, [product]);

  const optionNames = [
    ...new Set(
      variants.flatMap((v) => v.selectedOptions.map((o) => o.name))
    ),
  ].filter((name) => name !== "Title");

  const optionValues = {};
  optionNames.forEach((name) => {
    optionValues[name] = [
      ...new Set(
        variants
          .flatMap((v) => v.selectedOptions)
          .filter((o) => o.name === name)
          .map((o) => o.value)
      ),
    ];
  });

  const [selectedOptions, setSelectedOptions] = useState(() => {
    const initial = {};
    selectedVariant.selectedOptions.forEach((o) => {
      if (o.name !== "Title") initial[o.name] = o.value;
    });
    return initial;
  });

  const handleOptionChange = (name, value) => {
    const newOptions = { ...selectedOptions, [name]: value };
    setSelectedOptions(newOptions);

    const match = variants.find((v) =>
      v.selectedOptions.every(
        (o) => o.name === "Title" || newOptions[o.name] === o.value
      )
    );
    if (match) setSelectedVariant(match);
  };

  const handlePlanSelect = useCallback((data) => {
    setSubscriptionSelection(data);
  }, []);

  const handleAddToCart = () => {
    if (!selectedVariant?.availableForSale) return;

    const variantId =
      subscriptionSelection?.variantId || selectedVariant.id;
    const sellingPlanId = subscriptionSelection?.sellingPlanId || null;

    addItem(variantId, 1, sellingPlanId);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  const price = selectedVariant.price;
  const compareAtPrice = selectedVariant.compareAtPrice;
  const hasDiscount =
    compareAtPrice &&
    parseFloat(compareAtPrice.amount) > parseFloat(price.amount);

  const isSubscription = !!subscriptionSelection?.sellingPlanId;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-light tracking-wide lg:text-4xl">
          {product.title}
        </h1>
        <div className="mt-3 flex items-center gap-3">
          <span className="font-serif text-2xl">
            {formatPrice(price.amount, price.currencyCode)}
          </span>
          {hasDiscount && (
            <span className="text-base text-muted-foreground line-through">
              {formatPrice(compareAtPrice.amount, compareAtPrice.currencyCode)}
            </span>
          )}
        </div>
      </div>

      <Separator />

      {/* Free Gift Banner */}
      <AnimatePresence>
        {giftBanner && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50/60 px-4 py-3"
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100">
              <Gift className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-emerald-800">
                {giftBanner.text}
              </p>
              <p className="mt-0.5 text-xs text-emerald-600">
                {giftBanner.giftTitle}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Variant options */}
      {optionNames.length > 0 && (
        <div className="space-y-5">
          {optionNames.map((name) => (
            <div key={name}>
              <label className="mb-3 block text-sm font-medium">
                {name}
              </label>
              <div className="flex flex-wrap gap-2">
                {optionValues[name].map((value) => (
                  <button
                    key={value}
                    onClick={() => handleOptionChange(name, value)}
                    className={`rounded-full border px-5 py-2 text-sm transition-all duration-200 ${
                      selectedOptions[name] === value
                        ? "border-warm bg-warm/10 text-foreground"
                        : "border-border hover:border-warm/50"
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Subscription Widget */}
      <SubscriptionWidget
        productHandle={product.handle}
        variantId={selectedVariant?.id}
        onPlanSelect={handlePlanSelect}
      />

      {/* Add to cart */}
      <Button
        onClick={handleAddToCart}
        disabled={loading || !selectedVariant?.availableForSale}
        className="w-full bg-foreground text-background hover:bg-foreground/90 h-12 text-xs uppercase tracking-wider"
        size="lg"
      >
        <AnimatePresence mode="wait">
          {justAdded ? (
            <motion.span
              key="added"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-1.5"
            >
              <Check className="h-4 w-4" /> Added to Cart
            </motion.span>
          ) : (
            <motion.span
              key="add"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {!selectedVariant?.availableForSale
                ? "Sold Out"
                : loading
                ? "Adding..."
                : isSubscription
                ? "Subscribe"
                : "Add to Cart"}
            </motion.span>
          )}
        </AnimatePresence>
      </Button>

      {/* Trust signals */}
      <div className="flex items-center justify-center gap-6 pt-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Truck className="h-3.5 w-3.5" /> Free Shipping
        </span>
        <span className="flex items-center gap-1.5">
          <Leaf className="h-3.5 w-3.5" /> Natural Soy
        </span>
        <span className="flex items-center gap-1.5">
          <Hand className="h-3.5 w-3.5" /> Handcrafted
        </span>
      </div>

      {/* Product Bundle Widget */}
      <ProductBundleWidget productHandle={product.handle} />

      {/* Description */}
      {product.descriptionHtml && (
        <div>
          <Separator className="mb-6" />
          <div
            className="prose prose-sm max-w-none text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
          />
        </div>
      )}
    </div>
  );
}
