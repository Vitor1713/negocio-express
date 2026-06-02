import type { Metadata } from "next";
import { CheckoutPage } from "@/features/storefront/checkout/components/CheckoutPage";

export const metadata: Metadata = {
  title: "Finalizar pedido",
  robots: { index: false },
};

export default async function CheckoutRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <CheckoutPage slug={slug} />;
}
