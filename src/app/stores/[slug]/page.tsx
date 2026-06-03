import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ApiError } from "@/lib/api";
import {
  StoreCatalog,
  getStore,
  listStoreProducts,
  listStoreCategories,
  storeNameFromSlug,
  type CatalogProduct,
  type PublicStore,
  type StoreCategory,
} from "@/features/storefront";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  let name = storeNameFromSlug(slug);
  try {
    name = (await getStore(slug)).name ?? name;
  } catch {
    // Sem dados da loja: usa o nome derivado do slug como fallback de SEO.
  }
  return {
    title: `${name} — Loja online`,
    description: `Confira os produtos de ${name} e faça seu pedido online.`,
    openGraph: { title: name, type: "website" },
  };
}

export default async function StorePage({ params }: Params) {
  const { slug } = await params;

  let store: PublicStore | null = null;
  try {
    store = await getStore(slug);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    // Outros erros: segue com o nome derivado do slug.
  }
  const storeName = store?.name ?? storeNameFromSlug(slug);

  let products: CatalogProduct[];
  try {
    products = await listStoreProducts(slug);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  let categories: StoreCategory[] = [];
  try {
    categories = await listStoreCategories(slug);
  } catch {
    // Categorias são opcionais para a navegação; segue sem o filtro.
  }

  return (
    <StoreCatalog
      slug={slug}
      storeName={storeName}
      store={store}
      initialProducts={products}
      categories={categories}
    />
  );
}
