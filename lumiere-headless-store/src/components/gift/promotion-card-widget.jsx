"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { Gift, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatPrice } from "@/lib/shopify";

const slideVariants = {
  enter: (direction) => ({ x: direction > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction) => ({ x: direction > 0 ? -80 : 80, opacity: 0 }),
};

/**
 * Shared promotion card widget used by both admin preview and storefront PDP.
 *
 * @param {string}  title          — Card heading (e.g. "EXCLUSIVE GIFTS!")
 * @param {string}  subtitle       — Secondary text (e.g. "Buy 3 items to receive gifts")
 * @param {string}  ctaText        — CTA button label
 * @param {Array}   gifts          — Array of gift objects { title, imageUrl, price, currencyCode }
 * @param {Function} onCtaClick    — Optional callback for CTA
 * @param {number}  autoSlideInterval — ms between auto-slides (default 4000, 0 to disable)
 */
export default function PromotionCardWidget({
  title = "EXCLUSIVE GIFTS!",
  subtitle = "Buy this product to receive a gift",
  ctaText = "Unlock Your Gift",
  gifts = [],
  onCtaClick,
  autoSlideInterval = 4000,
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const timerRef = useRef(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (autoSlideInterval > 0 && gifts.length > 1) {
      timerRef.current = setInterval(() => {
        setDirection(1);
        setActiveIndex((i) => (i + 1) % gifts.length);
      }, autoSlideInterval);
    }
  }, [autoSlideInterval, gifts.length]);

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [resetTimer]);

  const goNext = useCallback(() => {
    setDirection(1);
    setActiveIndex((i) => (i + 1) % gifts.length);
    resetTimer();
  }, [gifts.length, resetTimer]);

  const goPrev = useCallback(() => {
    setDirection(-1);
    setActiveIndex((i) => (i - 1 + gifts.length) % gifts.length);
    resetTimer();
  }, [gifts.length, resetTimer]);

  const goTo = useCallback((idx) => {
    setDirection(idx > activeIndex ? 1 : -1);
    setActiveIndex(idx);
    resetTimer();
  }, [activeIndex, resetTimer]);

  if (gifts.length === 0) return null;

  const activeGift = gifts[activeIndex];
  const nextGift =
    gifts.length > 1 ? gifts[(activeIndex + 1) % gifts.length] : null;

  return (
    <div className="rounded-xl border border-border bg-muted/40 p-4">
      {/* Title + Subtitle */}
      <div className="mb-3">
        <p className="text-sm font-extrabold uppercase tracking-wide text-foreground">
          {title}
        </p>
        {subtitle && (
          <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>

      {/* Carousel */}
      <div className="flex items-center gap-2">
        {/* Prev arrow */}
        {gifts.length > 1 && (
          <button
            onClick={goPrev}
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Previous gift"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}

        {/* Active gift — animated */}
        <div className="relative flex-1 overflow-hidden">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={activeIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex items-center gap-3"
            >
              <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border-2 border-foreground/80 bg-muted">
                {activeGift.imageUrl ? (
                  <Image
                    src={activeGift.imageUrl}
                    alt={activeGift.title}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Gift className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-foreground">
                  {activeGift.title}
                </p>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-foreground">
                    {formatPrice(0, activeGift.currencyCode || "USD")}
                  </span>
                  {activeGift.price > 0 && (
                    <span className="text-xs text-muted-foreground line-through">
                      {formatPrice(activeGift.price, activeGift.currencyCode || "USD")}
                    </span>
                  )}
                </div>
              </div>

              {/* Faded next gift preview */}
              {nextGift && (
                <div className="relative ml-auto h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-muted opacity-40">
                  {nextGift.imageUrl ? (
                    <Image
                      src={nextGift.imageUrl}
                      alt={nextGift.title}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Gift className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Next arrow */}
        {gifts.length > 1 && (
          <button
            onClick={goNext}
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Next gift"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Dots */}
      {gifts.length > 1 && (
        <div className="mt-3 flex items-center justify-center gap-1.5">
          {gifts.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === activeIndex
                  ? "w-4 bg-foreground"
                  : "w-1.5 bg-foreground/20"
              }`}
              aria-label={`Go to gift ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* CTA */}
      <button
        onClick={onCtaClick}
        className="mt-3 w-full rounded-full bg-foreground py-2.5 text-xs font-semibold uppercase tracking-wider text-background transition-opacity hover:opacity-90"
      >
        {ctaText}
      </button>
    </div>
  );
}
