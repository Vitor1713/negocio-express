"use client";

import { useRouter } from "next/navigation";
import { ProductList } from "@/features/products";

export default function ProductsPage() {
  const router = useRouter();
  return (
    <ProductList
      onNew={() => router.push("/dashboard/products/new")}
      onEdit={(id) => router.push(`/dashboard/products/${id}`)}
    />
  );
}
