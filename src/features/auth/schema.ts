/**
 * Schema de validação do formulário de login (Zod).
 * Validação acontece no front antes de chamar a API. Mensagens em pt-BR.
 */
import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Informe seu e-mail.")
    .email("Informe um e-mail válido."),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
});

export type LoginValues = z.infer<typeof loginSchema>;
