"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getFreeGiftConfig,
  isCampaignActive,
  isProductInBuyCondition,
  getAvailableGifts,
} from "@/lib/free-gift";
import useCartStore from "@/store/cart-store";
import PromotionCardWidget from "@/components/gift/promotion-card-widget";

export default function PromotionCard({ product }) {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState(null);
  const [gifts, setGifts] = useState([]);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    let cancelled = false;

    async function checkPromotion() {
      const cfg = getFreeGiftConfig();

      if (!isCampaignActive(cfg)) {
        setVisible(false);
        return;
      }

      if (!isProductInBuyCondition(product, cfg)) {
        setVisible(false);
        return;
      }

      if (!cfg.showPromotionCard) {
        setVisible(false);
        return;
      }

      const availableGifts = await getAvailableGifts(cfg);
      if (cancelled) return;

      if (availableGifts.length === 0) {
        setVisible(false);
        return;
      }

      setConfig(cfg);
      setGifts(
        availableGifts.map((g) => ({
          title: g.title,
          imageUrl: g.images?.edges?.[0]?.node?.url || null,
          price: parseFloat(g.priceRange?.minVariantPrice?.amount || 0),
          currencyCode: g.priceRange?.minVariantPrice?.currencyCode || "USD",
        }))
      );
      setVisible(true);
    }

    checkPromotion();
    return () => {
      cancelled = true;
    };
  }, [product]);

  const title = config?.promotionBadgeText || "EXCLUSIVE GIFTS!";
  const subtitle =
    config?.minimumQuantity > 1
      ? `Buy ${config.minimumQuantity} items to receive gifts`
      : "Buy this product to receive a gift";

  const handleCta = () => {
    // Add trigger product to cart (first variant) — triggers gift flow
    const firstVariantId = product?.variants?.edges?.[0]?.node?.id;
    if (firstVariantId) {
      addItem(firstVariantId);
    }
  };

  return (
    <AnimatePresence>
      {visible && gifts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <PromotionCardWidget
            title={title}
            subtitle={subtitle}
            gifts={gifts}
            ctaText="Unlock Your Gift"
            onCtaClick={handleCta}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
