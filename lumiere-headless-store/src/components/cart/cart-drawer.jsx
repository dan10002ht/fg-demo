"use client";

import { useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, Trash2, Flame, Gift, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import useCartStore, { isGiftLine } from "@/store/cart-store";
import { formatPrice } from "@/lib/shopify";
import GiftPopup from "@/components/gift/gift-popup";
import CongratulationBar from "@/components/gift/congratulation-bar";

const FREE_SHIPPING_THRESHOLD = 75;

export default function CartDrawer() {
  const {
    isOpen,
    closeCart,
    loading,
    getCartLines,
    getCartTotal,
    getCartCurrency,
    getCheckoutUrl,
    updateItemQuantity,
    removeItem,
    giftNotification,
    clearGiftNotification,
    showGiftPopup,
    closeGiftPopup,
    availableGifts,
    showCongratBar,
    congratGiftName,
    closeCongratBar,
    addGiftItem,
    giftConfig,
  } = useCartStore();

  const lines = getCartLines();
  const total = getCartTotal();
  const currency = getCartCurrency();
  const checkoutUrl = getCheckoutUrl();
  const totalNum = parseFloat(total);
  const progress = Math.min((totalNum / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const remaining = FREE_SHIPPING_THRESHOLD - totalNum;

  // Auto-dismiss gift notification after 4 seconds
  useEffect(() => {
    if (giftNotification) {
      const timer = setTimeout(clearGiftNotification, 4000);
      return () => clearTimeout(timer);
    }
  }, [giftNotification, clearGiftNotification]);

  // Sort lines: regular items first, gift items last
  const sortedLines = [...lines].sort((a, b) => {
    const aIsGift = isGiftLine(a);
    const bIsGift = isGiftLine(b);
    if (aIsGift && !bIsGift) return 1;
    if (!aIsGift && bIsGift) return -1;
    return 0;
  });

  return (
    <>
      {/* Congratulation Bar */}
      <CongratulationBar
        show={showCongratBar}
        giftName={congratGiftName}
        onClose={closeCongratBar}
        congratsTitle={giftConfig?.congratsBarTitle}
        duration={giftConfig?.congratsBarDuration}
      />

      {/* Gift Selection Popup */}
      <GiftPopup
        open={showGiftPopup}
        onClose={closeGiftPopup}
        gifts={availableGifts}
        onSelectGift={addGiftItem}
        popupTitle={giftConfig?.popupTitle}
        popupDescription={giftConfig?.popupDescription}
      />

      <Sheet open={isOpen} onOpenChange={closeCart}>
        <SheetContent className="flex w-full flex-col px-6 sm:max-w-lg">
          <SheetHeader className="px-0">
            <SheetTitle className="text-left font-serif text-xl font-light tracking-wider">
              Your Cart
            </SheetTitle>
          </SheetHeader>

          {/* Gift notification toast */}
          <AnimatePresence>
            {giftNotification && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="overflow-hidden"
              >
                <div
                  className={`mb-2 flex items-center justify-between rounded-lg px-3 py-2 text-xs ${
                    giftNotification.type === "added"
                      ? "bg-emerald-50 text-emerald-700"
                      : giftNotification.type === "outOfStock"
                      ? "bg-amber-50 text-amber-700"
                      : "bg-stone-100 text-stone-600"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Gift className="h-3.5 w-3.5" />
                    {giftNotification.message}
                  </span>
                  <button
                    onClick={clearGiftNotification}
                    className="ml-2 opacity-60 hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Free shipping progress */}
          {totalNum > 0 && (
            <div className="pb-2">
              {remaining > 0 ? (
                <p className="mb-2 text-center text-xs text-muted-foreground">
                  You&apos;re{" "}
                  <span className="font-medium text-warm">
                    {formatPrice(remaining, currency)}
                  </span>{" "}
                  away from free shipping
                </p>
              ) : (
                <p className="mb-2 text-center text-xs text-warm">
                  You&apos;ve earned free shipping!
                </p>
              )}
              <div className="h-1 w-full overflow-hidden rounded-full bg-secondary">
                <motion.div
                  className="h-full rounded-full bg-warm"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>
          )}

          {lines.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                <Flame className="h-7 w-7 text-warm/50" />
              </div>
              <div className="text-center">
                <p className="font-serif text-lg font-light">
                  Your cart is empty
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Discover our handcrafted candles and fill your space with
                  warmth.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={closeCart}
                className="mt-2 text-xs uppercase tracking-wider"
              >
                Continue Shopping
              </Button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto py-4">
                <AnimatePresence initial={false}>
                  {sortedLines.map((line) => (
                    <motion.div
                      key={line.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{
                        opacity: 0,
                        height: 0,
                        transition: { duration: 0.2 },
                      }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      {isGiftLine(line) ? (
                        <GiftCartItem line={line} />
                      ) : (
                        <CartItem
                          line={line}
                          loading={loading}
                          onUpdateQuantity={updateItemQuantity}
                          onRemove={removeItem}
                        />
                      )}
                      <div className="my-3 h-px bg-border/50" />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="border-t pb-6 pt-4">
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">
                    Subtotal
                  </span>
                  <span className="font-serif text-lg">
                    {formatPrice(total, currency)}
                  </span>
                </div>
                <p className="mb-4 text-xs text-muted-foreground">
                  Shipping and taxes calculated at checkout.
                </p>
                <Button
                  className="btn-shimmer w-full border-0 text-xs uppercase tracking-wider text-white h-12"
                  size="lg"
                  disabled={loading}
                  onClick={() => {
                    if (checkoutUrl) window.location.href = checkoutUrl;
                  }}
                >
                  Checkout
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

function CartItem({ line, loading, onUpdateQuantity, onRemove }) {
  const { merchandise, quantity, cost } = line;
  const image = merchandise.image;

  return (
    <div className="flex gap-4">
      {image && (
        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded bg-muted">
          <Image
            src={image.url}
            alt={image.altText || merchandise.product.title}
            fill
            className="object-cover"
            sizes="80px"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <h3 className="font-serif text-sm font-medium leading-tight tracking-wide">
            {merchandise.product.title}
          </h3>
          {merchandise.title !== "Default Title" && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {merchandise.title}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onUpdateQuantity(line.id, quantity - 1)}
              disabled={loading}
              className="flex h-7 w-7 items-center justify-center rounded-full border text-muted-foreground transition-colors hover:border-warm hover:text-foreground disabled:opacity-50"
              aria-label="Decrease quantity"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-6 text-center text-sm">{quantity}</span>
            <button
              onClick={() => onUpdateQuantity(line.id, quantity + 1)}
              disabled={loading}
              className="flex h-7 w-7 items-center justify-center rounded-full border text-muted-foreground transition-colors hover:border-warm hover:text-foreground disabled:opacity-50"
              aria-label="Increase quantity"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm">
              {formatPrice(
                cost.totalAmount.amount,
                cost.totalAmount.currencyCode
              )}
            </span>
            <button
              onClick={() => onRemove(line.id)}
              disabled={loading}
              className="text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
              aria-label="Remove item"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function GiftCartItem({ line }) {
  const { merchandise, quantity } = line;
  const image = merchandise.image;
  const originalPrice = merchandise.price;

  const giftLabel =
    line.attributes?.find((a) => a.key === "_giftLabel")?.value || "Free Gift";

  return (
    <div className="flex gap-4 rounded-lg border border-dashed border-emerald-300/60 bg-emerald-50/30 p-3">
      {image && (
        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded bg-muted">
          <Image
            src={image.url}
            alt={image.altText || merchandise.product.title}
            fill
            className="object-cover"
            sizes="80px"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <div className="mb-1 flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
              <Gift className="h-3 w-3" />
              {giftLabel}
            </span>
          </div>
          <h3 className="font-serif text-sm font-medium leading-tight tracking-wide">
            {merchandise.product.title}
          </h3>
          {merchandise.title !== "Default Title" && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {merchandise.title}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Qty: {quantity}
          </span>
          <div className="flex items-center gap-2">
            {parseFloat(originalPrice.amount) > 0 && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(originalPrice.amount, originalPrice.currencyCode)}
              </span>
            )}
            <span className="text-sm font-medium text-emerald-600">FREE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
