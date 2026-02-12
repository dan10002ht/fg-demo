"use client";

import { AppProvider } from "@shopify/polaris";
import en from "@shopify/polaris/locales/en.json";

export default function PolarisProvider({ children }) {
  return <AppProvider i18n={en}>{children}</AppProvider>;
}
