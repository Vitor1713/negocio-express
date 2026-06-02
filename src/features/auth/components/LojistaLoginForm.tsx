"use client";

/** Liga o LoginForm ao fluxo de login do painel (lojista). */
import { LoginForm } from "./LoginForm";
import { loginErrorMessage, useLojistaLogin } from "../hooks";

export function LojistaLoginForm() {
  const mutation = useLojistaLogin();

  return (
    <LoginForm
      onSubmit={(values) => mutation.mutate(values)}
      loading={mutation.isPending}
      serverError={mutation.isError ? loginErrorMessage(mutation.error) : null}
      registerHref="/register"
    />
  );
}
