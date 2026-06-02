import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui";

type Props = {
  steps: string[];
  current: number;
};

export function StepIndicator({ steps, current }: Props) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((label, i) => {
        const num = i + 1;
        const done = num < current;
        const active = num === current;
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5 min-w-[64px]">
              <div
                className={cn(
                  "h-9 w-9 rounded-full grid place-items-center text-sm font-bold transition-all",
                  done && "bg-brand-600 text-white",
                  active && "bg-brand-600 text-white ring-4 ring-brand-100",
                  !done && !active && "bg-ink-100 text-ink-400",
                )}
              >
                {done ? <Icon name="Check" size={16} strokeWidth={2.5} /> : num}
              </div>
              <span
                className={cn(
                  "text-[11.5px] font-medium text-center leading-tight hidden sm:block",
                  active ? "text-brand-700" : done ? "text-ink-500" : "text-ink-400",
                )}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "h-0.5 flex-1 mb-5 mx-1 transition-colors",
                  num < current ? "bg-brand-500" : "bg-ink-200",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
