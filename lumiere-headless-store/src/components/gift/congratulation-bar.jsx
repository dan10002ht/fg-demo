"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, PartyPopper } from "lucide-react";

const DEFAULT_DURATION_S = 5;

export default function CongratulationBar({ show, giftName, onClose, congratsTitle, duration }) {
  const durationS = duration || DEFAULT_DURATION_S;
  const durationMs = durationS * 1000;

  // Auto-dismiss
  useEffect(() => {
    if (!show || durationS === 0) return;

    const timer = setTimeout(() => {
      onClose();
    }, durationMs);

    return () => clearTimeout(timer);
  }, [show, onClose, durationMs, durationS]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-6 right-6 z-[60] w-80"
        >
          <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-3 shadow-xl">
            {/* Main content */}
            <div className="flex items-start gap-2.5 pr-7">
              <PartyPopper className="mt-0.5 h-5 w-5 flex-shrink-0 text-white" />
              <p className="text-sm font-medium leading-snug text-white">
                {congratsTitle ? (
                  congratsTitle.replace("{giftName}", giftName || "")
                ) : (
                  <>
                    Congratulations!{" "}
                    <span className="font-semibold">{giftName}</span> has been added
                    to your cart.
                  </>
                )}
              </p>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/20 hover:text-white"
              aria-label="Dismiss notification"
            >
              <X className="h-3.5 w-3.5" />
            </button>

            {/* Countdown progress bar */}
            {durationS > 0 && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-700/30">
                <motion.div
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: durationS, ease: "linear" }}
                  className="h-full bg-white/70"
                />
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
