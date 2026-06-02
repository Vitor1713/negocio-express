import { Icon } from "@/components/ui";

export function StoreFooter({ storeName }: { storeName: string }) {
  return (
    <footer className="border-t border-ink-200 bg-white mt-10">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <span className="h-11 w-11 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white grid place-items-center shadow-soft">
            <Icon name="Store" size={20} />
          </span>
          <div className="font-display font-extrabold text-ink-900">{storeName}</div>
        </div>
        <div className="text-xs text-ink-400 inline-flex items-center gap-1.5">
          Powered by <span className="text-ink-700 font-display font-semibold">Negócio Express</span>
        </div>
      </div>
    </footer>
  );
}
