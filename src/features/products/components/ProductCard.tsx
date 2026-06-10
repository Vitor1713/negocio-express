"use client";

import Image from "next/image";
import { AppBadge, AppCard, Icon } from "@/components/ui";
import type { ProductShort } from "../service";

type Props = {
  product: ProductShort;
  onClick: () => void;
};

export function ProductCard({ product, onClick }: Props) {
  const price = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(product.basePrice ?? 0));

  return (
    <AppCard
      hoverable
      className="overflow-hidden flex flex-col cursor-pointer"
      onClick={onClick}
    >
      <div className="flex gap-3 p-4">
        <div className="relative h-16 w-16 rounded-xl bg-gradient-to-br from-brand-50 to-brand-100 grid place-items-center shrink-0 overflow-hidden">
          {product.coverImageUrl ? (
            <Image
              src={product.coverImageUrl}
              alt={product.name ?? ""}
              fill
              sizes="64px"
              className="object-cover"
            />
          ) : (
            <Icon name="Package" size={26} className="text-brand-700" strokeWidth={1.6} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-display font-semibold text-[15px] text-ink-900 leading-snug line-clamp-1">
            {product.name}
          </h4>
          <div className="mt-1.5 font-display font-bold text-brand-700 tabular-nums text-sm">
            {price}
          </div>
        </div>
      </div>
      <div className="px-4 py-3 border-t border-ink-100 flex items-center justify-between bg-ink-50/40">
        <div className="flex items-center gap-1.5 text-[12.5px] text-ink-500">
          <Icon name="Tag" size={13} />
          <span className="truncate max-w-[140px]">{product.slug}</span>
        </div>
        {product.isActive ? (
          <AppBadge tone="success" size="sm">Ativo</AppBadge>
        ) : (
          <AppBadge tone="neutral" size="sm">Inativo</AppBadge>
        )}
      </div>
    </AppCard>
  );
}
