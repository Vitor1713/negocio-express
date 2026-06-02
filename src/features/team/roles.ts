import type { AppBadgeProps } from "@/components/ui";

type Tone = NonNullable<AppBadgeProps["tone"]>;

/**
 * Funções de membro de equipe. O contrato trata `role` como string livre;
 * estes são os valores oferecidos no convite (Owner não é convidável aqui).
 */
export const TEAM_ROLES: Record<string, { label: string; tone: Tone }> = {
  Owner: { label: "Dono", tone: "brand" },
  Manager: { label: "Gerente", tone: "success" },
  Staff: { label: "Atendente", tone: "neutral" },
};

/** Funções que podem ser atribuídas via convite. */
export const INVITABLE_ROLES = ["Manager", "Staff"] as const;

export function roleInfo(role?: string) {
  return (role && TEAM_ROLES[role]) || { label: role ?? "—", tone: "neutral" as Tone };
}
