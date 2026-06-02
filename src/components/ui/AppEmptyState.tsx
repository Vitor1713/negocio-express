/** Estado VAZIO padronizado (toda lista que consome API deve usá-lo). */
import { type ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

export type AppEmptyStateProps = {
  icon?: IconName;
  title: string;
  desc?: string;
  action?: ReactNode;
};

export function AppEmptyState({ icon = "Inbox", title, desc, action }: AppEmptyStateProps) {
  return (
    <div className="rounded-xl border border-ink-200 bg-white p-10 text-center sm:p-14">
      <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-ink-100 text-ink-400">
        <Icon name={icon} size={22} />
      </div>
      <p className="font-medium text-ink-900">{title}</p>
      {desc && <p className="mx-auto mt-1 max-w-sm text-sm text-ink-500">{desc}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}
