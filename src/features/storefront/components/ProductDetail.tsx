"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AppBadge, AppButton, Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { storeBRL, fmtReviewDate } from "../format";
import { useCart } from "../cart-context";
import type { CatalogProductDetail } from "../service";
import { StarRating } from "./StarRating";
import { StoreFooter } from "./StoreFooter";

type Props = {
  slug: string;
  storeName: string;
  product: CatalogProductDetail;
};

export function ProductDetail({ slug, storeName, product }: Props) {
  const { addItem, count } = useCart();
  const variants = product.variants ?? [];
  const images = [...(product.images ?? [])].sort(
    (a, b) => Number(a.displayOrder ?? 0) - Number(b.displayOrder ?? 0),
  );
  const reviews = product.reviews ?? [];

  const firstAvailable = variants.find((v) => Number(v.stock ?? 0) > 0) ?? variants[0];
  const [variantId, setVariantId] = useState<string | undefined>(firstAvailable?.id);
  const [imgIdx, setImgIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const selected = variants.find((v) => v.id === variantId) ?? firstAvailable;
  const stock = Number(selected?.stock ?? 0);
  const price = Number(selected?.finalPrice ?? product.basePrice ?? 0);
  const avg = product.averageRating != null ? Number(product.averageRating) : null;
  const cover = images[imgIdx]?.url ?? images.find((i) => i.isCover)?.url ?? images[0]?.url;
  const canAdd = stock > 0 && !!selected;

  function handleAddToCart() {
    if (!selected || !canAdd) return;
    addItem(
      {
        variantId: selected.id!,
        productName: product.name ?? "",
        variantName: selected.name ?? "",
        finalPrice: price,
        stock,
      },
      qty,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="min-h-screen w-full bg-ink-50/60 flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-ink-200">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-3.5 flex items-center gap-3">
          <Link
            href={`/stores/${slug}`}
            className="inline-flex items-center gap-1.5 text-sm text-ink-700 hover:text-ink-900 transition-colors"
          >
            <Icon name="ArrowLeft" size={16} /> Voltar à loja
          </Link>
          <span className="mx-1 text-ink-300">/</span>
          <span className="font-display font-semibold text-ink-900 truncate">{storeName}</span>
        </div>
      </header>

      <main className="flex-1 max-w-[1100px] w-full mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white border border-ink-200 rounded-2xl shadow-soft p-5 sm:p-6">
          {/* Galeria */}
          <div>
            <div className="relative aspect-square rounded-xl bg-gradient-to-br from-brand-50 to-brand-100 grid place-items-center overflow-hidden">
              {cover ? (
                <Image
                  src={cover}
                  alt={product.name ?? ""}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              ) : (
                <span className="h-28 w-28 rounded-3xl bg-white/70 backdrop-blur-sm grid place-items-center shadow-soft">
                  <Icon name="Package" size={52} className="text-brand-700" strokeWidth={1.4} />
                </span>
              )}
              {avg != null && (
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur rounded-full px-2.5 py-1 shadow-soft">
                  <StarRating value={avg} size={12} showValue />
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {images.slice(0, 4).map((img, i) => (
                  <button
                    key={img.id ?? i}
                    onClick={() => setImgIdx(i)}
                    className={cn(
                      "relative aspect-square rounded-lg overflow-hidden border-2 transition-all",
                      imgIdx === i ? "border-brand-600" : "border-transparent opacity-60 hover:opacity-100",
                    )}
                  >
                    <Image src={img.url ?? ""} alt="" fill sizes="120px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <h1 className="font-display font-extrabold text-2xl text-ink-900 tracking-tight">
              {product.name}
            </h1>
            {avg != null && (
              <div className="mt-1.5">
                <StarRating value={avg} size={15} showValue count={reviews.length} />
              </div>
            )}
            {product.description && (
              <p className="mt-3 text-sm text-ink-600 leading-relaxed">{product.description}</p>
            )}

            <div className="mt-4 font-display font-extrabold text-3xl text-brand-700 tabular-nums">
              {storeBRL(price)}
            </div>

            {/* Variações */}
            {variants.length > 1 && (
              <div className="mt-4">
                <div className="text-sm font-medium text-ink-700 mb-2">Escolha a opção</div>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v) => {
                    const out = Number(v.stock ?? 0) === 0;
                    const active = v.id === variantId;
                    return (
                      <button
                        key={v.id}
                        disabled={out}
                        onClick={() => setVariantId(v.id)}
                        className={cn(
                          "px-3 py-2 rounded-lg border text-sm font-medium transition-all",
                          active
                            ? "border-brand-600 bg-brand-50 text-brand-800 ring-2 ring-brand-100"
                            : out
                              ? "border-ink-200 text-ink-300 line-through cursor-not-allowed"
                              : "border-ink-200 text-ink-700 hover:bg-ink-50",
                        )}
                      >
                        {v.name}
                        <span className={cn("ml-1.5 text-xs", active ? "text-brand-600" : "text-ink-400")}>
                          {storeBRL(v.finalPrice)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Estoque */}
            <div className="mt-3 text-xs">
              {stock === 0 ? (
                <span className="text-red-600 font-medium inline-flex items-center gap-1">
                  <Icon name="CircleX" size={13} /> Esgotado
                </span>
              ) : stock <= 5 ? (
                <span className="text-amber-600 font-medium inline-flex items-center gap-1">
                  <Icon name="CircleAlert" size={13} /> Últimas {stock} unidades
                </span>
              ) : (
                <span className="text-brand-700 font-medium inline-flex items-center gap-1">
                  <Icon name="Check" size={13} /> Em estoque
                </span>
              )}
            </div>

            {/* CTA */}
            <div className="mt-auto pt-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center border border-ink-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="h-11 w-11 grid place-items-center hover:bg-ink-100 text-ink-700"
                  >
                    <Icon name="Minus" size={16} />
                  </button>
                  <span className="w-10 text-center font-semibold tabular-nums">{qty}</span>
                  <button
                    onClick={() => setQty((q) => Math.min(stock, q + 1))}
                    disabled={qty >= stock}
                    className="h-11 w-11 grid place-items-center hover:bg-ink-100 text-ink-700 disabled:text-ink-300"
                  >
                    <Icon name="Plus" size={16} />
                  </button>
                </div>
                <AppButton
                  fullWidth
                  icon={added ? "Check" : "ShoppingCart"}
                  disabled={!canAdd}
                  onClick={handleAddToCart}
                  variant={added ? "secondary" : "primary"}
                >
                  {added ? "Adicionado!" : `Adicionar · ${storeBRL(price * qty)}`}
                </AppButton>
              </div>

              {count > 0 && (
                <Link
                  href={`/stores/${slug}/checkout`}
                  className="w-full h-10 rounded-lg border border-brand-600 text-brand-700 font-medium text-sm inline-flex items-center justify-center gap-2 hover:bg-brand-50 transition-colors"
                >
                  <Icon name="ShoppingCart" size={16} /> Ver carrinho ({count})
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Avaliações */}
        <div className="mt-6 bg-white border border-ink-200 rounded-2xl shadow-soft p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-lg text-ink-900">Avaliações</h2>
            {avg != null && <StarRating value={avg} size={15} showValue count={reviews.length} />}
          </div>
          {reviews.length === 0 ? (
            <p className="text-sm text-ink-500">Este produto ainda não tem avaliações.</p>
          ) : (
            <div className="space-y-3">
              {reviews.map((r, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-xl border border-ink-200">
                  <span className="h-9 w-9 rounded-full bg-brand-100 text-brand-700 grid place-items-center shrink-0">
                    <Icon name="User" size={16} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[13.5px] font-medium text-ink-900">Cliente verificado</span>
                      <span className="text-[11.5px] text-ink-400">{fmtReviewDate(r.createdAt)}</span>
                    </div>
                    <div className="mt-0.5">
                      <StarRating value={Number(r.rating ?? 0)} size={12} />
                    </div>
                    {r.comment && (
                      <p className="mt-1 text-[13px] text-ink-600 leading-snug">{r.comment}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <StoreFooter storeName={storeName} />
    </div>
  );
}
