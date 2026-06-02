"use client";

/** Liga o LoginForm ao fluxo de login da vitrine (cliente), resolvido pelo slug. */
import { LoginForm } from "./LoginForm";
import { loginErrorMessage, useCustomerLogin } from "../hooks";

export function CustomerLoginForm({ slug }: { slug: string }) {
  const mutation = useCustomerLogin(slug);

  return (
    <LoginForm
      onSubmit={(values) => mutation.mutate(values)}
      loading={mutation.isPending}
      serverError={mutation.isError ? loginErrorMessage(mutation.error) : null}
      registerHref={`/stores/${slug}/register`}
    />
  );
}
