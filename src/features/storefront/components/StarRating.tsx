import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui";

type Props = {
  value?: number;
  size?: number;
  showValue?: boolean;
  count?: number;
};

export function StarRating({ value = 0, size = 14, showValue = false, count }: Props) {
  const full = Math.round(value);
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Icon
            key={i}
            name="Star"
            size={size}
            strokeWidth={2.5}
            className={cn(i <= full ? "text-amber-500" : "text-ink-200")}
          />
        ))}
      </span>
      {showValue && <span className="text-ink-900 font-semibold text-sm tabular-nums">{value.toFixed(1)}</span>}
      {typeof count === "number" && <span className="text-ink-500 text-xs">({count})</span>}
    </span>
  );
}
