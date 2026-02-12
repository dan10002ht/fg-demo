"use client";

import { Gift } from "lucide-react";

/**
 * Shared promotion badge used on product cards (admin preview + storefront).
 *
 * @param {string} text — Badge label (e.g. "FREE GIFT")
 */
export default function PromotionBadge({ text = "FREE GIFT" }) {
  return (
    <span className="inline-flex items-center gap-1 rounded bg-emerald-600 px-2 py-1 text-[10px] font-bold uppercase leading-none tracking-wider text-white shadow-sm">
      <Gift className="h-3 w-3" />
      {text}
    </span>
  );
}
