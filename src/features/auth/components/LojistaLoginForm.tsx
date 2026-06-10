"use client";

/** Liga o LoginForm ao fluxo de login do painel (lojista). */
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { LoginForm } from "./LoginForm";
import { loginErrorMessage, useLojistaLogin } from "../hooks";

function LojistaLoginFormInner() {
  const mutation = useLojistaLogin();
  const justReset = useSearchParams().get("reset") === "1";

  return (
    <LoginForm
      onSubmit={(values) => mutation.mutate(values)}
      loading={mutation.isPending}
      serverError={mutation.isError ? loginErrorMessage(mutation.error) : null}
      notice={justReset ? "Senha redefinida com sucesso. Faça login com a nova senha." : null}
      registerHref="/register"
      storeField
    />
  );
}

export function LojistaLoginForm() {
  // useSearchParams exige um limite de Suspense em páginas estáticas.
  return (
    <Suspense fallback={<LoginForm onSubmit={() => {}} registerHref="/register" storeField />}>
      <LojistaLoginFormInner />
    </Suspense>
  );
}
