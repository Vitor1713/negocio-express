import { CartProvider } from "@/features/storefront/cart-context";
import { OrdersProvider } from "@/features/storefront/orders-context";

export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <CartProvider slug={slug}>
      <OrdersProvider>{children}</OrdersProvider>
    </CartProvider>
  );
}
