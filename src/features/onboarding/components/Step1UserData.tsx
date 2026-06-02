"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AppButton, AppCard, AppInput, Icon } from "@/components/ui";

const schema = z
  .object({
    name: z.string().min(2, "Informe seu nome completo."),
    email: z.string().email("E-mail inválido."),
    phone: z
      .string()
      .transform((v) => v.replace(/\D/g, ""))
      .pipe(z.string().min(10, "WhatsApp incompleto.")),
    password: z.string().min(6, "Mínimo de 6 caracteres."),
    confirmPassword: z.string(),
    terms: z.literal(true, { errorMap: () => ({ message: "Aceite os termos para continuar." }) }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

export type Step1Values = z.infer<typeof schema>;

type Props = {
  defaultValues?: Partial<Step1Values>;
  onNext: (values: Step1Values) => void;
};

function formatPhone(raw: string) {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function Step1UserData({ defaultValues, onNext }: Props) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Step1Values>({
    resolver: zodResolver(schema),
    defaultValues: { terms: undefined as unknown as true, ...defaultValues },
  });

  const termsChecked = watch("terms");

  return (
    <AppCard className="mt-8 p-7">
      <form onSubmit={handleSubmit(onNext)} noValidate>
        <div className="space-y-4">
          <AppInput
            label="Nome completo"
            required
            placeholder="Como você quer ser chamado(a)"
            icon="User"
            error={errors.name?.message}
            {...register("name")}
          />

          <AppInput
            label="E-mail"
            type="email"
            required
            placeholder="voce@exemplo.com.br"
            icon="Mail"
            error={errors.email?.message}
            {...register("email")}
          />

          <AppInput
            label="WhatsApp / Telefone"
            required
            placeholder="(11) 98765-4321"
            icon="Phone"
            hint={!errors.phone?.message ? "Usamos para notificações de pedidos." : undefined}
            error={errors.phone?.message}
            {...register("phone", {
              onChange: (e) => {
                e.target.value = formatPhone(e.target.value);
              },
            })}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AppInput
              label="Senha"
              type="password"
              required
              placeholder="Mín. 6 caracteres"
              icon="Lock"
              error={errors.password?.message}
              {...register("password")}
            />
            <AppInput
              label="Confirmar senha"
              type="password"
              required
              placeholder="Repita a senha"
              icon="Lock"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />
          </div>

          <div className="pt-1">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 accent-brand-600 cursor-pointer"
                checked={termsChecked === true}
                onChange={(e) =>
                  setValue("terms", e.target.checked as true, { shouldValidate: true })
                }
              />
              <span className="text-sm text-ink-700 leading-relaxed">
                Li e aceito os{" "}
                <a className="text-brand-700 font-medium hover:underline">Termos de Uso</a> e a{" "}
                <a className="text-brand-700 font-medium hover:underline">Política de Privacidade</a>.
              </span>
            </label>
            {errors.terms?.message && (
              <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                <Icon name="CircleAlert" size={13} />
                {errors.terms.message}
              </p>
            )}
          </div>

          <AppButton type="submit" fullWidth size="lg" iconRight="ArrowRight">
            Continuar
          </AppButton>
        </div>
      </form>
    </AppCard>
  );
}
