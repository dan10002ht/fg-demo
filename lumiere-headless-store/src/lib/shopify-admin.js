/**
 * Shopify Admin API client (server-side only)
 * Used for discount management via Admin GraphQL API
 */

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const adminAccessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

const API_VERSION = "2024-01";

async function adminFetch({ query, variables = {} }) {
  if (!adminAccessToken || adminAccessToken === "your_admin_api_access_token_here") {
    throw new Error(
      "SHOPIFY_ADMIN_ACCESS_TOKEN is not configured. " +
      "Go to Shopify Admin > Settings > Apps > Develop apps to create one."
    );
  }

  const url = `https://${domain}/admin/api/${API_VERSION}/graphql.json`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": adminAccessToken,
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = await response.json();

  if (json.errors) {
    console.error("Shopify Admin API Error:", json.errors);
    throw new Error(json.errors[0]?.message || "Shopify Admin API error");
  }

  return json.data;
}

/* ── Discount Code BxGy (Buy X Get Y) ── */

const DISCOUNT_CODE_BXGY_FRAGMENT = `
  fragment DiscountCodeBxGyFields on DiscountCodeNode {
    id
    codeDiscount {
      ... on DiscountCodeBxgy {
        title
        status
        startsAt
        endsAt
        usesPerOrderLimit
        codes(first: 1) {
          edges {
            node {
              code
            }
          }
        }
        customerBuys {
          value {
            ... on DiscountQuantity {
              quantity
            }
          }
          items {
            ... on AllDiscountItems {
              allItems
            }
            ... on DiscountProducts {
              products(first: 50) {
                edges {
                  node {
                    id
                  }
                }
              }
            }
            ... on DiscountCollections {
              collections(first: 50) {
                edges {
                  node {
                    id
                  }
                }
              }
            }
          }
        }
        customerGets {
          items {
            ... on DiscountProducts {
              products(first: 50) {
                edges {
                  node {
                    id
                  }
                }
              }
            }
          }
          value {
            ... on DiscountOnQuantity {
              quantity {
                quantity
              }
              effect {
                ... on DiscountPercentage {
                  percentage
                }
              }
            }
            ... on DiscountAmount {
              amount {
                amount
                currencyCode
              }
            }
            ... on DiscountPercentage {
              percentage
            }
          }
        }
        combinesWith {
          productDiscounts
          orderDiscounts
          shippingDiscounts
        }
      }
    }
  }
`;

/**
 * Build the Admin API input from campaign data
 */
function buildBxGyInput(campaign) {
  // Customer buys items
  let customerBuysItems;
  if (campaign.buyConditionType === "specificCollections" && campaign.buyCollections?.length > 0) {
    customerBuysItems = {
      collections: {
        add: campaign.buyCollections.map((c) => c.collectionId),
      },
    };
  } else if (campaign.buyProducts?.length > 0) {
    customerBuysItems = {
      products: {
        productsToAdd: campaign.buyProducts.map((p) => p.productId),
      },
    };
  } else {
    customerBuysItems = { all: true };
  }

  // Customer gets items
  let customerGetsItems;
  if (campaign.getProducts?.length > 0) {
    customerGetsItems = {
      products: {
        productsToAdd: campaign.getProducts.map((p) => p.productId),
      },
    };
  } else {
    customerGetsItems = { all: true };
  }

  // Gift quantity (sum of all gift product quantities)
  const giftQuantity = campaign.getProducts?.reduce(
    (sum, p) => sum + (p.giftQuantity || 1),
    0
  ) || 1;

  // Discount value — BxGy uses discountOnQuantity (quantity + effect)
  let customerGetsValue;
  if (campaign.discountType === "free") {
    customerGetsValue = {
      discountOnQuantity: {
        quantity: String(giftQuantity),
        effect: { percentage: 1.0 }, // 100% off = free
      },
    };
  } else if (campaign.discountType === "percentage") {
    customerGetsValue = {
      discountOnQuantity: {
        quantity: String(giftQuantity),
        effect: { percentage: (campaign.discountValue || 0) / 100 },
      },
    };
  } else {
    // fixedAmount
    customerGetsValue = {
      discountAmount: {
        amount: campaign.discountValue || 0,
        appliesOnEachItem: true,
      },
    };
  }

  // Schedule
  const startsAt = campaign.startDate
    ? new Date(`${campaign.startDate}T${campaign.startTime || "00:00"}:00`).toISOString()
    : new Date().toISOString();

  const endsAt =
    campaign.hasEndDate && campaign.endDate
      ? new Date(`${campaign.endDate}T${campaign.endTime || "23:59"}:00`).toISOString()
      : null;

  return {
    title: campaign.offerTitle || "Buy X Get Y",
    code: campaign.discountCode,
    startsAt,
    endsAt,
    usesPerOrderLimit: campaign.multiApply ? null : 1,
    customerSelection: { all: true },
    customerBuys: {
      value: {
        quantity: String(campaign.minimumQuantity || 1),
      },
      items: customerBuysItems,
    },
    customerGets: {
      items: customerGetsItems,
      value: customerGetsValue,
    },
    combinesWith: {
      productDiscounts: campaign.combineProductDiscounts ?? false,
      orderDiscounts: campaign.combineOrderDiscounts ?? false,
      shippingDiscounts: campaign.combineShippingDiscounts ?? false,
    },
  };
}

/**
 * Create a new discount code BxGy
 */
export async function createDiscountBxGy(campaign) {
  const input = buildBxGyInput(campaign);

  const query = `
    ${DISCOUNT_CODE_BXGY_FRAGMENT}
    mutation discountCodeBxgyCreate($bxgyCodeDiscount: DiscountCodeBxgyInput!) {
      discountCodeBxgyCreate(bxgyCodeDiscount: $bxgyCodeDiscount) {
        codeDiscountNode {
          ...DiscountCodeBxGyFields
        }
        userErrors {
          field
          message
          code
        }
      }
    }
  `;

  const data = await adminFetch({
    query,
    variables: { bxgyCodeDiscount: input },
  });

  const result = data.discountCodeBxgyCreate;
  if (result.userErrors?.length > 0) {
    const errorMsg = result.userErrors.map((e) => `${e.field}: ${e.message}`).join("; ");
    throw new Error(`Discount creation failed: ${errorMsg}`);
  }

  return result.codeDiscountNode;
}

/**
 * Update an existing discount code BxGy
 */
export async function updateDiscountBxGy(discountId, campaign) {
  const input = buildBxGyInput(campaign);

  // For updates, keep productsToAdd and add productsToRemove
  if (input.customerBuys.items.products) {
    input.customerBuys.items.products = {
      productsToAdd: input.customerBuys.items.products.productsToAdd,
      productsToRemove: [],
    };
  }
  if (input.customerBuys.items.collections) {
    input.customerBuys.items.collections = {
      add: input.customerBuys.items.collections.add,
      remove: [],
    };
  }
  if (input.customerGets.items.products) {
    input.customerGets.items.products = {
      productsToAdd: input.customerGets.items.products.productsToAdd,
      productsToRemove: [],
    };
  }

  const query = `
    ${DISCOUNT_CODE_BXGY_FRAGMENT}
    mutation discountCodeBxgyUpdate($id: ID!, $bxgyCodeDiscount: DiscountCodeBxgyInput!) {
      discountCodeBxgyUpdate(id: $id, bxgyCodeDiscount: $bxgyCodeDiscount) {
        codeDiscountNode {
          ...DiscountCodeBxGyFields
        }
        userErrors {
          field
          message
          code
        }
      }
    }
  `;

  const data = await adminFetch({
    query,
    variables: { id: discountId, bxgyCodeDiscount: input },
  });

  const result = data.discountCodeBxgyUpdate;
  if (result.userErrors?.length > 0) {
    const errorMsg = result.userErrors.map((e) => `${e.field}: ${e.message}`).join("; ");
    throw new Error(`Discount update failed: ${errorMsg}`);
  }

  return result.codeDiscountNode;
}

/**
 * Delete a discount code
 */
export async function deleteDiscount(discountId) {
  const query = `
    mutation discountCodeDelete($id: ID!) {
      discountCodeDelete(id: $id) {
        deletedCodeDiscountId
        userErrors {
          field
          message
          code
        }
      }
    }
  `;

  const data = await adminFetch({
    query,
    variables: { id: discountId },
  });

  const result = data.discountCodeDelete;
  if (result.userErrors?.length > 0) {
    const errorMsg = result.userErrors.map((e) => `${e.field}: ${e.message}`).join("; ");
    throw new Error(`Discount deletion failed: ${errorMsg}`);
  }

  return result.deletedCodeDiscountId;
}

/**
 * Activate / deactivate a discount code
 */
export async function activateDiscount(discountId) {
  const query = `
    mutation discountCodeActivate($id: ID!) {
      discountCodeActivate(id: $id) {
        codeDiscountNode {
          id
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const data = await adminFetch({ query, variables: { id: discountId } });
  if (data.discountCodeActivate.userErrors?.length > 0) {
    throw new Error(data.discountCodeActivate.userErrors[0].message);
  }
  return data.discountCodeActivate.codeDiscountNode;
}

export async function deactivateDiscount(discountId) {
  const query = `
    mutation discountCodeDeactivate($id: ID!) {
      discountCodeDeactivate(id: $id) {
        codeDiscountNode {
          id
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const data = await adminFetch({ query, variables: { id: discountId } });
  if (data.discountCodeDeactivate.userErrors?.length > 0) {
    throw new Error(data.discountCodeDeactivate.userErrors[0].message);
  }
  return data.discountCodeDeactivate.codeDiscountNode;
}
