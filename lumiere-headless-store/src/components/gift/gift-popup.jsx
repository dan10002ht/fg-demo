"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getGiftVariantId } from "@/lib/free-gift";
import GiftPopupContent from "@/components/gift/gift-popup-content";

export default function GiftPopup({ open, onClose, gifts, onSelectGift, popupTitle, popupDescription }) {
  const [selectedId, setSelectedId] = useState(null);
  const [addingId, setAddingId] = useState(null);
  const [addedId, setAddedId] = useState(null);

  // Transform Shopify gift objects to the shared format
  const mappedGifts = (gifts || []).map((g) => ({
    id: g.id,
    title: g.title,
    imageUrl: g.images?.edges?.[0]?.node?.url || null,
    price: parseFloat(g.priceRange?.minVariantPrice?.amount || 0),
    currencyCode: g.priceRange?.minVariantPrice?.currencyCode || "USD",
    _raw: g, // keep raw ref for variant lookup
  }));

  // Auto-select first gift if none selected
  const effectiveSelected = selectedId || (mappedGifts.length === 1 ? mappedGifts[0].id : null);

  const handleConfirm = async () => {
    const gift = mappedGifts.find((g) => g.id === effectiveSelected);
    if (!gift) return;

    const variantId = getGiftVariantId(gift._raw);
    if (!variantId) return;

    setAddingId(gift.id);

    try {
      await onSelectGift(variantId, gift.title);
      setAddingId(null);
      setAddedId(gift.id);

      setTimeout(() => {
        onClose();
        setTimeout(() => {
          setAddedId(null);
          setSelectedId(null);
        }, 300);
      }, 1200);
    } catch (error) {
      console.error("Failed to add gift:", error);
      setAddingId(null);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center pointer-events-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget && !addingId && !addedId) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full max-w-lg overflow-hidden rounded-t-xl bg-white shadow-2xl sm:mx-4 sm:rounded-xl"
          >
            <GiftPopupContent
              title={popupTitle}
              description={popupDescription}
              gifts={mappedGifts}
              selectedId={effectiveSelected}
              addingId={addingId}
              addedId={addedId}
              onSelect={setSelectedId}
              onConfirm={handleConfirm}
              onClose={onClose}
              interactive
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
