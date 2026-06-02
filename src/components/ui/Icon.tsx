/**
 * Ícone por nome (lucide-react), como no design (<Icon name="Mail" .../>).
 * Centraliza o set de ícones e os tamanhos padrão.
 */
import { icons, type LucideProps } from "lucide-react";

export type IconName = keyof typeof icons;

type IconProps = LucideProps & { name: IconName };

export function Icon({ name, size = 18, strokeWidth = 1.8, ...props }: IconProps) {
  const Glyph = icons[name];
  if (!Glyph) return null;
  return <Glyph size={size} strokeWidth={strokeWidth} aria-hidden {...props} />;
}
