"use client";

import { useState, useEffect } from "react";
import { Modal, TextField } from "@shopify/polaris";
import useCampaignStore from "@/lib/campaign-store";

export default function OfferTitleModal({ open, onClose }) {
  const offerTitle = useCampaignStore((s) => s.offerTitle);
  const setField = useCampaignStore((s) => s.setField);
  const [title, setTitle] = useState(offerTitle);

  useEffect(() => {
    if (open) {
      setTitle(offerTitle);
    }
  }, [open, offerTitle]);

  const handleSave = () => {
    setField("offerTitle", title);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit Offer Title"
      primaryAction={{
        content: "Save",
        onAction: handleSave,
      }}
      secondaryActions={[
        {
          content: "Cancel",
          onAction: onClose,
        },
      ]}
    >
      <Modal.Section>
        <TextField
          label="Offer Title"
          value={title}
          onChange={setTitle}
          autoComplete="off"
          autoFocus
        />
      </Modal.Section>
    </Modal>
  );
}
