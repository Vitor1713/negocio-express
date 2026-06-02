"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProductForm, useCategories } from "@/features/products";
import { createProduct, addVariant, addImage } from "@/features/products/service";
import { useQueryClient } from "@tanstack/react-query";
import { PRODUCTS_KEY } from "@/features/products/hooks";
import type { ProductFormValues } from "@/features/products/components/ProductForm";
import { AppSpinner, AppErrorState } from "@/components/ui";
import { ApiError } from "@/lib/api";

export default function NewProductPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const { data: categories = [], isLoading: catsLoading, isError: catsError } = useCategories();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  if (catsLoading) {
    return (
      <div className="flex justify-center py-16">
        <AppSpinner className="h-10 w-10" />
      </div>
    );
  }

  if (catsError) {
    return <AppErrorState title="Erro ao carregar categorias" error={null} />;
  }

  async function handleSave(values: ProductFormValues) {
    setSaving(true);
    setSaveError(null);
    try {
      const product = await createProduct({
        name: values.name,
        slug: values.slug,
        description: values.description ?? "",
        basePrice: values.basePrice,
        categoryId: values.categoryId ?? null,
        isActive: values.isActive,
      });

      const productId = product.id!;

      for (const v of values.variants) {
        await addVariant(productId, {
          name: v.name,
          sku: v.sku ?? null,
          stock: v.stock,
          additionalPrice: v.additionalPrice,
          isActive: v.isActive,
        });
      }

      if (values.imageUrl) {
        await addImage(productId, { url: values.imageUrl, displayOrder: 0, isCover: true });
      }

      qc.invalidateQueries({ queryKey: PRODUCTS_KEY });
      router.push("/dashboard/products");
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.messages[0] : "Erro ao salvar produto.");
      setSaving(false);
    }
  }

  return (
    <>
      {saveError && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {saveError}
        </div>
      )}
      <ProductForm
        categories={categories}
        saving={saving}
        onSave={handleSave}
        onCancel={() => router.push("/dashboard/products")}
      />
    </>
  );
}
