import { Icon } from "@/components/ui";
import { storeBRL } from "../format";
import type { PublicStore } from "../service";

export function StoreFooter({
  storeName,
  store,
}: {
  storeName: string;
  /** Dados públicos da loja (contato, categoria, entrega). Opcional: ausente em fallback. */
  store?: PublicStore | null;
}) {
  const phone = store?.phone?.trim();
  const email = store?.email?.trim();
  const category = store?.category?.trim();

  // Resumo de entrega (quando os dados públicos estão disponíveis).
  const deliveryInfo = store
    ? [
        Number(store.deliveryFee ?? 0) > 0
          ? `Entrega ${storeBRL(store.deliveryFee)}`
          : "Entrega grátis",
        Number(store.minOrderAmount ?? 0) > 0 ? `Pedido mín. ${storeBRL(store.minOrderAmount)}` : null,
        Number(store.estimatedDeliveryMinutes ?? 0) > 0
          ? `Entrega em ~${store.estimatedDeliveryMinutes} min`
          : null,
      ].filter(Boolean)
    : [];

  return (
    <footer className="border-t border-ink-200 bg-white mt-10">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-8 flex flex-col md:flex-row items-start justify-between gap-8">
        {/* Identidade + categoria */}
        <div className="flex items-center gap-3">
          <span className="h-11 w-11 rounded-xl overflow-hidden bg-gradient-to-br from-brand-500 to-brand-700 text-white grid place-items-center shadow-soft">
            {store?.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={store.logoUrl} alt={storeName} className="h-full w-full object-cover" />
            ) : (
              <Icon name="Store" size={20} />
            )}
          </span>
          <div>
            <div className="font-display font-extrabold text-ink-900">{storeName}</div>
            {category && (
              <div className="text-xs text-ink-500 inline-flex items-center gap-1 mt-0.5">
                <Icon name="Tag" size={12} />
                {category}
              </div>
            )}
          </div>
        </div>

        {/* Contato */}
        {(phone || email) && (
          <div className="flex flex-col gap-2 text-sm">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">
              Contato
            </div>
            {phone && (
              <a
                href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                className="inline-flex items-center gap-2 text-ink-700 hover:text-brand-700 transition-colors"
              >
                <Icon name="Phone" size={15} />
                {phone}
              </a>
            )}
            {email && (
              <a
                href={`mailto:${email}`}
                className="inline-flex items-center gap-2 text-ink-700 hover:text-brand-700 transition-colors"
              >
                <Icon name="Mail" size={15} />
                {email}
              </a>
            )}
          </div>
        )}

        {/* Entrega */}
        {deliveryInfo.length > 0 && (
          <div className="flex flex-col gap-2 text-sm">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">
              Entrega
            </div>
            {deliveryInfo.map((info) => (
              <div key={info as string} className="inline-flex items-center gap-2 text-ink-700">
                <Icon name="Truck" size={15} />
                {info}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-ink-100">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-4 flex items-center justify-end">
          <div className="text-xs text-ink-400 inline-flex items-center gap-1.5">
            Powered by <span className="text-ink-700 font-display font-semibold">Negócio Express</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
