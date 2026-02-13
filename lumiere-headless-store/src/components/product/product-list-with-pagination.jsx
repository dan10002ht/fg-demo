"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductGrid from "./product-grid";
import { loadMoreProducts } from "@/app/(store)/products/actions";

export default function ProductListWithPagination({
  initialProducts,
  initialPageInfo,
}) {
  const [products, setProducts] = useState(initialProducts);
  const [pageInfo, setPageInfo] = useState(initialPageInfo);
  const [isPending, startTransition] = useTransition();

  const handleLoadMore = () => {
    startTransition(async () => {
      const data = await loadMoreProducts(pageInfo.endCursor);
      setProducts((prev) => [...prev, ...data.products]);
      setPageInfo(data.pageInfo);
    });
  };

  return (
    <>
      <ProductGrid products={products} />

      {pageInfo.hasNextPage && (
        <div className="mt-12 text-center">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={isPending}
            className="h-11 px-8 text-xs uppercase tracking-wider"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More"
            )}
          </Button>
        </div>
      )}
    </>
  );
}
