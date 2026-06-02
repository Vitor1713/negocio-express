import type { Metadata } from "next";
import { AccountPage } from "@/features/storefront/account/components/AccountPage";

export const metadata: Metadata = {
  title: "Minha conta",
  robots: { index: false },
};

export default async function AccountRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <AccountPage slug={slug} />;
}
