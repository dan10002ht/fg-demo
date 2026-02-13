import Link from "next/link";
import {
  ArrowRight,
  Shirt,
  Package,
  Heart,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductGrid from "@/components/product/product-grid";
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
} from "@/components/motion/motion-wrapper";
import ScrollIndicator from "@/components/motion/scroll-indicator";
import { getProducts } from "@/lib/shopify";

export default async function HomePage() {
  let products = [];

  try {
    const productData = await getProducts({ first: 8 });
    products = productData.products;
  } catch (e) {
    console.error("Failed to fetch products:", e);
  }

  return (
    <>
      {/* Hero Section */}
      <section className="relative flex min-h-[80vh] items-center justify-center overflow-hidden px-4">
        {/* Layered background */}
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/40 via-background to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(196,168,130,0.08),transparent_70%)]" />

        <div className="relative mx-auto max-w-3xl text-center">
          <FadeIn delay={0.1}>
            <p className="mb-4 text-xs uppercase tracking-[0.4em] text-muted-foreground">
              Premium Fashion & Apparel
            </p>
          </FadeIn>

          {/* Decorative ornament */}
          <FadeIn delay={0.2}>
            <div className="mx-auto mb-6 flex items-center justify-center gap-3">
              <div className="h-px w-12 bg-warm/50" />
              <div className="h-1.5 w-1.5 rotate-45 bg-warm/50" />
              <div className="h-px w-12 bg-warm/50" />
            </div>
          </FadeIn>

          <FadeIn delay={0.3}>
            <h2 className="font-serif text-5xl font-light leading-tight tracking-wide sm:text-6xl lg:text-7xl">
              Elevate
              <br />
              Your Style
            </h2>
          </FadeIn>

          <FadeIn delay={0.5}>
            <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-muted-foreground">
              Discover our curated collection of premium clothing and
              accessories, designed for the modern lifestyle.
            </p>
          </FadeIn>

          <FadeIn delay={0.6}>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button
                asChild
                size="lg"
                className="h-12 bg-foreground px-10 text-xs uppercase tracking-wider text-background hover:bg-foreground/90"
              >
                <Link href="/products">Shop Now</Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="lg"
                className="h-12 px-10 text-xs uppercase tracking-wider hover:bg-warm/10 hover:text-warm"
              >
                <Link href="/products">New Arrivals</Link>
              </Button>
            </div>
          </FadeIn>
        </div>

        {/* Scroll indicator */}
        <FadeIn delay={1} className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <ScrollIndicator />
        </FadeIn>
      </section>

      {/* How It Works */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <FadeIn>
          <h2 className="text-center font-serif text-3xl font-light tracking-wide">
            How It Works
          </h2>
          <p className="mx-auto mt-3 max-w-md text-center text-sm text-muted-foreground">
            Your perfect outfit, in three simple steps.
          </p>
        </FadeIn>

        <StaggerContainer className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-3" stagger={0.15}>
          {[
            {
              icon: Shirt,
              num: "01",
              title: "Browse & Choose",
              description:
                "Explore our curated collection and pick your favorites, from everyday essentials to statement pieces.",
            },
            {
              icon: Package,
              num: "02",
              title: "Fast Delivery",
              description:
                "Your order is carefully packaged and delivered straight to your doorstep with free shipping.",
            },
            {
              icon: Heart,
              num: "03",
              title: "Wear & Love",
              description:
                "Step out in style and confidence with premium quality clothing designed for comfort and elegance.",
            },
          ].map((step, index) => (
            <StaggerItem key={index}>
              <div className="text-center">
                <p className="font-serif text-3xl font-light text-warm/40">
                  {step.num}
                </p>
                <div className="mx-auto mt-4 flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
                  <step.icon className="h-6 w-6 text-warm" />
                </div>
                <h3 className="mt-5 font-serif text-lg font-light tracking-wide">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* Featured Products */}
      {products.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="flex items-end justify-between">
              <div>
                <h2 className="font-serif text-3xl font-light tracking-wide">
                  Best Sellers
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Our most loved pieces, handpicked for you.
                </p>
              </div>
              <Link
                href="/products"
                className="group hidden items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground sm:flex"
              >
                View All{" "}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </FadeIn>

          <div className="mt-10">
            <ProductGrid products={products} />
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Button asChild variant="outline">
              <Link href="/products">View All Products</Link>
            </Button>
          </div>
        </section>
      )}

      {/* Subscription CTA Banner */}
      <section className="relative overflow-hidden bg-foreground text-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(196,168,130,0.1),transparent_60%)]" />
        <div className="h-px bg-gradient-to-r from-transparent via-warm/30 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <FadeIn>
            <p className="text-xs uppercase tracking-[0.4em] text-warm-light">
              Exclusive Membership
            </p>
            <h2 className="mt-4 font-serif text-3xl font-light tracking-wide sm:text-4xl">
              Always Dressed in the Latest Styles
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-background/60">
              Subscribe and save. Get early access to new collections,
              exclusive discounts, and curated outfit picks delivered monthly.
            </p>
            <Button
              asChild
              size="lg"
              className="btn-shimmer mt-10 h-12 border-0 px-10 text-xs uppercase tracking-wider text-white"
            >
              <Link href="/products">Start Your Subscription</Link>
            </Button>
          </FadeIn>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-warm/30 to-transparent" />
      </section>

    </>
  );
}
