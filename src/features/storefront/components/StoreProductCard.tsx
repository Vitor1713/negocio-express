import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui";
import { storeBRL } from "../format";
import type { CatalogProduct } from "../service";

type Props = {
  slug: string;
  product: CatalogProduct;
};

export function StoreProductCard({ slug, product }: Props) {
  return (
    <Link
      href={`/stores/${slug}/${product.slug}`}
      className="bg-white border border-ink-200 rounded-xl shadow-soft overflow-hidden flex flex-col group transition-all hover:border-ink-300 hover:shadow-pop"
    >
      <div className="relative aspect-[5/4] bg-gradient-to-br from-brand-50 to-brand-100 overflow-hidden">
        {product.coverImageUrl ? (
          <Image
            src={product.coverImageUrl}
            alt={product.name ?? ""}
            fill
            sizes="(max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="absolute inset-0 grid place-items-center">
            <span className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-white/70 backdrop-blur-sm grid place-items-center shadow-soft">
              <Icon name="Package" size={32} className="text-brand-700" strokeWidth={1.6} />
            </span>
          </span>
        )}
      </div>

      <div className="p-3 sm:p-4 flex-1 flex flex-col">
        <h4 className="font-display font-semibold text-[14px] sm:text-[15px] text-ink-900 leading-snug line-clamp-2">
          {product.name}
        </h4>
        {product.description && (
          <p className="mt-1 text-xs text-ink-500 line-clamp-2 leading-snug">{product.description}</p>
        )}
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-[11px] text-ink-500">a partir de</span>
          <span className="font-display font-extrabold text-brand-700 text-lg sm:text-xl tabular-nums">
            {storeBRL(product.basePrice)}
          </span>
        </div>
        <div className="mt-3 sm:mt-4 pt-1">
          <span className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg border border-brand-600 text-brand-700 font-semibold text-sm transition-all group-hover:bg-brand-600 group-hover:text-white">
            <Icon name="Eye" size={16} /> Ver produto
          </span>
        </div>
      </div>
    </Link>
  );
}
