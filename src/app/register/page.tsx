"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo, Icon } from "@/components/ui";
import {
  StepIndicator,
  Step1UserData,
  Step2StoreData,
  Step3StoreFiscal,
  Step4Plan,
  useRegister,
  type Step1Values,
  type Step2Values,
  type Step3FiscalValues,
} from "@/features/onboarding";
import { useAuth } from "@/features/auth";
import { ApiError } from "@/lib/api";

const STEPS = ["Dados pessoais", "Dados da loja", "Endereço & dados fiscais", "Plano"];

type WizardData = {
  step1?: Step1Values;
  step2?: Step2Values;
  step3?: Step3FiscalValues;
};

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const registerMutation = useRegister();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardData>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  function handleStep1(values: Step1Values) {
    setData((d) => ({ ...d, step1: values }));
    setStep(2);
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function handleStep2(values: Step2Values) {
    setData((d) => ({ ...d, step2: values }));
    setStep(3);
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function handleStep3(values: Step3FiscalValues) {
    setData((d) => ({ ...d, step3: values }));
    setStep(4);
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  async function handlePlanConfirm(planId: string) {
    if (!data.step1 || !data.step2 || !data.step3) return;
    setSubmitError(null);

    try {
      const result = await registerMutation.mutateAsync({
        name: data.step1.name,
        email: data.step1.email,
        password: data.step1.password,
        storeName: data.step2.storeName,
        storeSlug: data.step2.storeSlug,
        storeEmail: data.step2.storeEmail,
        storePhone: data.step2.storePhone,
        storeCategory: data.step2.storeCategory,
        // Dados fiscais/endereço (já normalizados pelo schema do passo 3:
        // CNPJ/CEP só dígitos, UF maiúscula, faturamento numérico).
        storeCnpj: data.step3.storeCnpj,
        storeCompanyType: data.step3.storeCompanyType,
        storeIncomeValue: data.step3.storeIncomeValue,
        storePostalCode: data.step3.storePostalCode,
        storeStreet: data.step3.storeStreet,
        storeNumber: data.step3.storeNumber,
        storeComplement: data.step3.storeComplement || undefined,
        storeNeighborhood: data.step3.storeNeighborhood,
        storeCity: data.step3.storeCity,
        storeState: data.step3.storeState,
        planId,
      });

      if (result.token) {
        login(result.token);
        router.push("/dashboard");
      }
    } catch (err) {
      setSubmitError(
        err instanceof ApiError ? err.messages[0] : "Erro ao criar conta. Tente novamente.",
      );
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }

  const titles = [
    "Crie sua conta grátis",
    "Dados da sua loja",
    "Endereço & dados fiscais",
    "Escolha seu plano",
  ];
  const subtitles = [
    "Comece em 2 minutos. Sem cartão de crédito.",
    "Essas informações aparecem na vitrine pública da sua loja.",
    "Usamos esses dados para habilitar os pagamentos da sua loja.",
    "Comece grátis e faça upgrade quando quiser.",
  ];

  return (
    <div className="min-h-screen w-full bg-white">
      {/* Header */}
      <header className="w-full px-6 py-6 flex items-center justify-between border-b border-ink-100">
        <Link href="/">
          <Logo size="md" />
        </Link>
        <Link
          href="/login"
          className="text-sm text-ink-500 hover:text-ink-900 transition-colors inline-flex items-center gap-1.5"
        >
          <Icon name="ArrowLeft" size={15} /> Voltar para o login
        </Link>
      </header>

      <main className="w-full px-6 pb-16">
        <div className={`mx-auto pt-8 ${step === 4 ? "max-w-[1040px]" : "max-w-[540px]"}`}>
          {/* Erro de submissão */}
          {submitError && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
              <Icon name="CircleAlert" size={16} className="shrink-0" />
              {submitError}
            </div>
          )}

          {/* Título */}
          <div className="text-center">
            <h1 className="font-display font-extrabold text-[32px] leading-tight tracking-tight text-ink-900">
              {titles[step - 1]}
            </h1>
            {step < 4 && (
              <p className="mt-2 text-ink-500 text-[15px]">{subtitles[step - 1]}</p>
            )}
          </div>

          {/* Step indicator (centralizado e estreito mesmo no passo largo do plano) */}
          <div className="mt-8 mx-auto max-w-[560px]">
            <StepIndicator steps={STEPS} current={step} />
          </div>

          {/* Etapas */}
          {step === 1 && (
            <Step1UserData
              defaultValues={
                data.step1
                  ? { ...data.step1, phone: data.step1.phone }
                  : undefined
              }
              onNext={handleStep1}
            />
          )}

          {step === 2 && (
            <Step2StoreData
              defaultValues={data.step2}
              prefillEmail={data.step1?.email}
              prefillPhone={data.step1?.phone}
              onNext={handleStep2}
              onBack={() => {
                setStep(1);
                window.scrollTo({ top: 0, behavior: "instant" });
              }}
            />
          )}

          {step === 3 && (
            <Step3StoreFiscal
              defaultValues={data.step3}
              onNext={handleStep3}
              onBack={() => {
                setStep(2);
                window.scrollTo({ top: 0, behavior: "instant" });
              }}
            />
          )}

          {step === 4 && (
            <Step4Plan
              submitting={registerMutation.isPending}
              onConfirm={handlePlanConfirm}
              onBack={() => {
                setStep(3);
                window.scrollTo({ top: 0, behavior: "instant" });
              }}
            />
          )}

          {step < 4 && (
            <p className="mt-8 text-center text-sm text-ink-500">
              Já tem conta?{" "}
              <Link
                href="/login"
                className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
              >
                Entrar
              </Link>
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
