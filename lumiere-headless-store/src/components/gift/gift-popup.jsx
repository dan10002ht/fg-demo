"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, X, ShoppingBag, Check } from "lucide-react";
import { getGiftVariantId } from "@/lib/free-gift";
import { formatPrice } from "@/lib/shopify";

export default function GiftPopup({ open, onClose, gifts, onSelectGift, popupTitle, popupDescription }) {
  const [addingId, setAddingId] = useState(null);
  const [addedId, setAddedId] = useState(null);

  const handleSelectGift = async (giftProduct) => {
    const variantId = getGiftVariantId(giftProduct);
    if (!variantId) return;

    setAddingId(giftProduct.id);

    try {
      await onSelectGift(variantId, giftProduct.title);
      setAddingId(null);
      setAddedId(giftProduct.id);

      // Show success state briefly, then close popup
      setTimeout(() => {
        onClose();
        // Reset state after exit animation
        setTimeout(() => setAddedId(null), 300);
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
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget && !addingId && !addedId) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative mx-4 w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header */}
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                <Gift className="h-6 w-6 text-emerald-600" />
              </div>
              <h2 className="font-serif text-2xl font-light tracking-wide text-foreground">
                {popupTitle || "Choose Your Free Gift!"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {popupDescription || "Select one of the gifts below to add to your order."}
              </p>
            </div>

            {/* Gift grid */}
            <div
              className={`grid gap-4 ${
                gifts?.length === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"
              }`}
            >
              {gifts?.map((gift) => {
                const image = gift.images?.edges?.[0]?.node;
                const price = gift.priceRange?.minVariantPrice;
                const isAdding = addingId === gift.id;
                const isAdded = addedId === gift.id;

                return (
                  <motion.div
                    key={gift.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="group flex flex-col overflow-hidden rounded-lg border border-border transition-colors hover:border-emerald-300"
                  >
                    {/* Product image */}
                    {image && (
                      <div className="relative aspect-square w-full overflow-hidden bg-muted">
                        <Image
                          src={image.url}
                          alt={image.altText || gift.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, 250px"
                        />
                        {/* FREE badge overlay */}
                        <div className="absolute left-2 top-2">
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                            <Gift className="h-3 w-3" />
                            FREE
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Product info */}
                    <div className="flex flex-1 flex-col p-3">
                      <h3 className="font-serif text-sm font-medium leading-tight tracking-wide">
                        {gift.title}
                      </h3>

                      <div className="mt-1.5 flex items-center gap-2">
                        {price && parseFloat(price.amount) > 0 && (
                          <span className="text-xs text-muted-foreground line-through">
                            {formatPrice(price.amount, price.currencyCode)}
                          </span>
                        )}
                        <span className="text-sm font-semibold text-emerald-600">
                          FREE
                        </span>
                      </div>

                      {/* Add to cart button */}
                      <button
                        onClick={() => handleSelectGift(gift)}
                        disabled={isAdding || isAdded || (addedId && addedId !== gift.id)}
                        className={`mt-3 flex w-full items-center justify-center gap-1.5 rounded-md px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-white transition-colors disabled:opacity-50 ${
                          isAdded
                            ? "bg-emerald-700"
                            : "bg-emerald-600 hover:bg-emerald-700"
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            Added to Cart
                          </>
                        ) : isAdding ? (
                          "Adding..."
                        ) : (
                          <>
                            <ShoppingBag className="h-3.5 w-3.5" />
                            Add to Cart
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
