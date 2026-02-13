"use server";

import { getProducts } from "@/lib/shopify";

export async function loadMoreProducts(cursor) {
  const data = await getProducts({ first: 12, after: cursor });
  return {
    products: data.products,
    pageInfo: data.pageInfo,
  };
}
