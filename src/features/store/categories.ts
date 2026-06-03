import type { IconName } from "@/components/ui";

/**
 * Fonte única das categorias de loja. As `key` PRECISAM bater com a enum do
 * backend (PascalCase em inglês) — ver memória `free-string-enums-conventions`.
 * Reutilizada no onboarding (Step2) e nas Configurações da loja.
 */
export const STORE_CATEGORIES: { key: string; label: string; icon: IconName }[] = [
  { key: "Restaurant", label: "Restaurante", icon: "UtensilsCrossed" },
  { key: "Bakery", label: "Padaria", icon: "Cookie" },
  { key: "Salon", label: "Salão / Beleza", icon: "Scissors" },
  { key: "Fashion", label: "Moda & Roupas", icon: "Shirt" },
  { key: "PetShop", label: "Pet Shop", icon: "PawPrint" },
  { key: "Pharmacy", label: "Farmácia", icon: "Pill" },
  { key: "Market", label: "Mercado", icon: "ShoppingBasket" },
  { key: "Other", label: "Outros", icon: "Store" },
];

/** Rótulo PT-BR de uma categoria; cai no próprio valor se desconhecida. */
export const categoryLabel = (key?: string | null) =>
  STORE_CATEGORIES.find((c) => c.key === key)?.label ?? key ?? "—";
