import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ApiError } from "@/lib/api";
import {
  ProductDetail,
  getStore,
  getStoreProduct,
  storeNameFromSlug,
  type CatalogProductDetail,
} from "@/features/storefront";

type Params = { params: Promise<{ slug: string; prodSlug: string }> };

/** Nome real da loja (GET /stores/{slug}), com fallback no nome derivado do slug. */
async function resolveStoreName(slug: string): Promise<string> {
  try {
    return (await getStore(slug)).name ?? storeNameFromSlug(slug);
  } catch {
    return storeNameFromSlug(slug);
  }
}

async function fetchProduct(slug: string, prodSlug: string): Promise<CatalogProductDetail> {
  try {
    return await getStoreProduct(slug, prodSlug);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug, prodSlug } = await params;
  const storeName = await resolveStoreName(slug);
  try {
    const product = await getStoreProduct(slug, prodSlug);
    const desc = product.description?.slice(0, 160) || `Compre ${product.name} em ${storeName}.`;
    return {
      title: `${product.name} — ${storeName}`,
      description: desc,
      openGraph: {
        title: product.name ?? storeName,
        description: desc,
        images: product.images?.find((i) => i.isCover)?.url
          ? [{ url: product.images.find((i) => i.isCover)!.url! }]
          : undefined,
        type: "website",
      },
    };
  } catch {
    return { title: storeName };
  }
}

export default async function StoreProductPage({ params }: Params) {
  const { slug, prodSlug } = await params;
  const [product, storeName] = await Promise.all([
    fetchProduct(slug, prodSlug),
    resolveStoreName(slug),
  ]);
  return <ProductDetail slug={slug} storeName={storeName} product={product} />;
}
