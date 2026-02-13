"use client";

import { useEffect } from "react";
import useCampaignStore from "@/lib/campaign-store";

export default function CampaignInitializer() {
  const loadCampaigns = useCampaignStore((s) => s.loadCampaigns);
  const syncDefaultCampaignDiscount = useCampaignStore((s) => s.syncDefaultCampaignDiscount);

  useEffect(() => {
    loadCampaigns();
    syncDefaultCampaignDiscount();
  }, [loadCampaigns, syncDefaultCampaignDiscount]);

  return null;
}
