import { NextResponse } from "next/server";
import {
  createDiscountBxGy,
  updateDiscountBxGy,
  deleteDiscount,
  activateDiscount,
  deactivateDiscount,
} from "@/lib/shopify-admin";

/**
 * POST /api/discount
 *
 * Actions:
 *   - create: Create a new BxGy discount code on Shopify
 *   - update: Update an existing discount
 *   - delete: Delete a discount
 *   - activate: Activate a discount
 *   - deactivate: Deactivate a discount
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { action, campaign, discountId } = body;

    switch (action) {
      case "create": {
        if (!campaign) {
          return NextResponse.json(
            { error: "Campaign data is required" },
            { status: 400 }
          );
        }
        const result = await createDiscountBxGy(campaign);
        return NextResponse.json({
          success: true,
          discountId: result.id,
          discount: result,
        });
      }

      case "update": {
        if (!discountId || !campaign) {
          return NextResponse.json(
            { error: "discountId and campaign data are required" },
            { status: 400 }
          );
        }
        const result = await updateDiscountBxGy(discountId, campaign);
        return NextResponse.json({
          success: true,
          discountId: result.id,
          discount: result,
        });
      }

      case "delete": {
        if (!discountId) {
          return NextResponse.json(
            { error: "discountId is required" },
            { status: 400 }
          );
        }
        await deleteDiscount(discountId);
        return NextResponse.json({ success: true });
      }

      case "activate": {
        if (!discountId) {
          return NextResponse.json(
            { error: "discountId is required" },
            { status: 400 }
          );
        }
        await activateDiscount(discountId);
        return NextResponse.json({ success: true });
      }

      case "deactivate": {
        if (!discountId) {
          return NextResponse.json(
            { error: "discountId is required" },
            { status: 400 }
          );
        }
        await deactivateDiscount(discountId);
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (err) {
    console.error("Discount API error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
