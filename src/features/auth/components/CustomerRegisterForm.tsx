"use client";

/**
 * Cadastro do cliente na vitrine (RF-F05 / multi-tenant pelo slug).
 * Reusa AppInput/AppButton e segue o padrão de form do onboarding
 * (react-hook-form + Zod). Ao concluir, faz login automático e volta à loja.
 */
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { AppButton, AppInput, Icon } from "@/components/ui";
import { customerRegisterSchema, type CustomerRegisterValues } from "../schema";
import { registerErrorMessage, useCustomerRegister } from "../hooks";

function formatPhone(raw: string) {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function CustomerRegisterForm({ slug }: { slug: string }) {
  const mutation = useCustomerRegister(slug);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerRegisterValues>({ resolver: zodResolver(customerRegisterSchema) });

  const serverError = mutation.isError ? registerErrorMessage(mutation.error) : null;

  function onSubmit(values: CustomerRegisterValues) {
    mutation.mutate({
      name: values.name,
      email: values.email,
      phone: values.phone,
      password: values.password,
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 space-y-4">
      {serverError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700"
        >
          <Icon name="CircleAlert" size={17} className="mt-0.5 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <AppInput
        label="Nome completo"
        required
        icon="User"
        placeholder="Como você quer ser chamado(a)"
        autoComplete="name"
        error={errors.name?.message}
        disabled={mutation.isPending}
        {...register("name")}
      />

      <AppInput
        label="E-mail"
        type="email"
        required
        icon="Mail"
        placeholder="voce@exemplo.com.br"
        autoComplete="email"
        error={errors.email?.message}
        disabled={mutation.isPending}
        {...register("email")}
      />

      <AppInput
        label="WhatsApp / Telefone"
        required
        icon="Phone"
        placeholder="(11) 98765-4321"
        autoComplete="tel"
        error={errors.phone?.message}
        disabled={mutation.isPending}
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
          icon="Lock"
          placeholder="Mín. 6 caracteres"
          autoComplete="new-password"
          error={errors.password?.message}
          disabled={mutation.isPending}
          {...register("password")}
        />
        <AppInput
          label="Confirmar senha"
          type="password"
          required
          icon="Lock"
          placeholder="Repita a senha"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          disabled={mutation.isPending}
          {...register("confirmPassword")}
        />
      </div>

      <AppButton type="submit" size="lg" fullWidth loading={mutation.isPending} iconRight="ArrowRight">
        Criar conta
      </AppButton>

      <p className="pt-2 text-center text-sm text-ink-500">
        Já tem conta?{" "}
        <Link
          href={`/stores/${slug}/login`}
          className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
        >
          Entrar
        </Link>
      </p>
    </form>
  );
}
