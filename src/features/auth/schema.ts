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

/** Cadastro do cliente na vitrine (RequestRegisterCustomer + confirmação de senha). */
export const customerRegisterSchema = z
  .object({
    name: z.string().min(2, "Informe seu nome completo."),
    email: z.string().min(1, "Informe seu e-mail.").email("Informe um e-mail válido."),
    phone: z
      .string()
      .transform((v) => v.replace(/\D/g, ""))
      .pipe(z.string().min(10, "Telefone incompleto.")),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

export type CustomerRegisterValues = z.infer<typeof customerRegisterSchema>;

/** Solicitação de recuperação de senha. */
export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Informe seu e-mail.").email("Informe um e-mail válido."),
});

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

/** Redefinição de senha (o token vem do link recebido por e-mail). */
export const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
