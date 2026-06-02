"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProductForm, useCategories, useProduct, useDeleteProduct } from "@/features/products";
import {
  updateProduct,
  addVariant,
  updateVariant,
  deleteVariant,
  addImage,
  deleteImage,
} from "@/features/products/service";
import { useQueryClient } from "@tanstack/react-query";
import { PRODUCTS_KEY } from "@/features/products/hooks";
import type { ProductFormValues } from "@/features/products/components/ProductForm";
import { AppSpinner, AppErrorState } from "@/components/ui";
import { ApiError } from "@/lib/api";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();

  const { data: product, isLoading: prodLoading, isError: prodError } = useProduct(params.id);
  const { data: categories = [], isLoading: catsLoading } = useCategories();
  const deleteProductMutation = useDeleteProduct();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  if (prodLoading || catsLoading) {
    return (
      <div className="flex justify-center py-16">
        <AppSpinner className="h-10 w-10" />
      </div>
    );
  }

  if (prodError || !product) {
    return <AppErrorState title="Produto não encontrado" error={null} />;
  }

  async function handleSave(values: ProductFormValues) {
    setSaving(true);
    setSaveError(null);
    try {
      await updateProduct(params.id, {
        name: values.name,
        slug: values.slug,
        description: values.description ?? "",
        basePrice: values.basePrice,
        categoryId: values.categoryId ?? null,
        isActive: values.isActive,
      });

      const existingVariants = product!.variants ?? [];
      const formVariants = values.variants;

      // Atualiza variações existentes, cria novas
      for (const v of formVariants) {
        if (v.id) {
          await updateVariant(v.id, {
            name: v.name,
            sku: v.sku ?? null,
            stock: v.stock,
            additionalPrice: v.additionalPrice,
            isActive: v.isActive,
          });
        } else {
          await addVariant(params.id, {
            name: v.name,
            sku: v.sku ?? null,
            stock: v.stock,
            additionalPrice: v.additionalPrice,
            isActive: v.isActive,
          });
        }
      }

      // Remove variações que foram deletadas no form
      const keptIds = new Set(formVariants.map((v) => v.id).filter(Boolean));
      for (const ev of existingVariants) {
        if (ev.id && !keptIds.has(ev.id)) {
          await deleteVariant(ev.id);
        }
      }

      // Imagem: se fornecida e diferente da atual, troca
      const currentImageUrl = product!.images?.[0]?.url ?? "";
      if (values.imageUrl && values.imageUrl !== currentImageUrl) {
        // Remove imagens existentes
        for (const img of product!.images ?? []) {
          if (img.id) await deleteImage(img.id);
        }
        await addImage(params.id, { url: values.imageUrl, displayOrder: 0, isCover: true });
      }

      qc.invalidateQueries({ queryKey: PRODUCTS_KEY });
      router.push("/dashboard/products");
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.messages[0] : "Erro ao salvar produto.");
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Excluir este produto? Esta ação não pode ser desfeita.")) return;
    await deleteProductMutation.mutateAsync(params.id);
    router.push("/dashboard/products");
  }

  return (
    <>
      {saveError && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {saveError}
        </div>
      )}
      <ProductForm
        product={product}
        categories={categories}
        saving={saving}
        onSave={handleSave}
        onDelete={handleDelete}
        onCancel={() => router.push("/dashboard/products")}
      />
    </>
  );
}
