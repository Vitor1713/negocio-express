"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AppButton, AppCard, AppField, AppInput } from "@/components/ui";
import { cn } from "@/lib/cn";
import { COMPANY_TYPES } from "@/features/store/company-types";

function formatCNPJ(raw: string) {
  const d = raw.replace(/\D/g, "").slice(0, 14);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

function formatZip(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

const COMPANY_TYPE_KEYS = COMPANY_TYPES.map((c) => c.key) as [string, ...string[]];

const schema = z.object({
  storeCnpj: z
    .string()
    .transform((v) => v.replace(/\D/g, ""))
    .pipe(z.string().length(14, "CNPJ deve ter 14 dígitos.")),
  storeCompanyType: z.enum(COMPANY_TYPE_KEYS, {
    errorMap: () => ({ message: "Selecione o tipo de empresa." }),
  }),
  storeIncomeValue: z.coerce
    .number({ invalid_type_error: "Informe o faturamento mensal." })
    .positive("Informe o faturamento mensal."),
  storePostalCode: z
    .string()
    .transform((v) => v.replace(/\D/g, ""))
    .pipe(z.string().length(8, "CEP incompleto.")),
  storeStreet: z.string().min(1, "Logradouro obrigatório."),
  storeNumber: z.string().min(1, "Número obrigatório."),
  storeComplement: z.string().optional(),
  storeNeighborhood: z.string().min(1, "Bairro obrigatório."),
  storeCity: z.string().min(1, "Cidade obrigatória."),
  storeState: z
    .string()
    .length(2, "Use a sigla do estado (ex: SP).")
    .transform((v) => v.toUpperCase()),
});

export type Step3FiscalValues = z.infer<typeof schema>;

type RawStep3 = {
  storeCnpj: string;
  storeCompanyType: string;
  storeIncomeValue: string | number;
  storePostalCode: string;
  storeStreet: string;
  storeNumber: string;
  storeComplement?: string;
  storeNeighborhood: string;
  storeCity: string;
  storeState: string;
};

type Props = {
  defaultValues?: Partial<RawStep3>;
  onNext: (values: Step3FiscalValues) => void;
  onBack: () => void;
};

export function Step3StoreFiscal({ defaultValues, onNext, onBack }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RawStep3>({
    resolver: zodResolver(schema) as never,
    defaultValues: {
      storeCnpj: "",
      storeCompanyType: "",
      storeIncomeValue: "",
      storePostalCode: "",
      storeStreet: "",
      storeNumber: "",
      storeComplement: "",
      storeNeighborhood: "",
      storeCity: "",
      storeState: "",
      ...defaultValues,
    },
  });

  return (
    <AppCard className="mt-8 p-7">
      <form onSubmit={handleSubmit(onNext as never)} noValidate>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AppInput
              label="CNPJ"
              required
              placeholder="00.000.000/0000-00"
              icon="Building2"
              error={errors.storeCnpj?.message}
              {...register("storeCnpj", {
                onChange: (e) => {
                  e.target.value = formatCNPJ(e.target.value);
                },
              })}
            />
            <AppField label="Tipo de empresa" required error={errors.storeCompanyType?.message}>
              <select
                className={cn(
                  "w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-ink-900 focus:outline-none focus:ring-2",
                  errors.storeCompanyType
                    ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                    : "border-ink-200 focus:border-brand-600 focus:ring-brand-100",
                )}
                defaultValue=""
                {...register("storeCompanyType")}
              >
                <option value="" disabled>
                  Selecione…
                </option>
                {COMPANY_TYPES.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
            </AppField>
          </div>

          <AppInput
            label="Faturamento mensal (R$)"
            required
            type="number"
            step="0.01"
            min="0"
            placeholder="0,00"
            icon="DollarSign"
            hint={!errors.storeIncomeValue?.message ? "Faturamento médio estimado da loja." : undefined}
            error={errors.storeIncomeValue?.message}
            {...register("storeIncomeValue")}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AppInput
              label="CEP"
              required
              placeholder="00000-000"
              icon="MapPin"
              error={errors.storePostalCode?.message}
              {...register("storePostalCode", {
                onChange: (e) => {
                  e.target.value = formatZip(e.target.value);
                },
              })}
            />
            <div className="md:col-span-2">
              <AppInput
                label="Logradouro"
                required
                placeholder="Avenida Paulista"
                error={errors.storeStreet?.message}
                {...register("storeStreet")}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AppInput
              label="Número"
              required
              placeholder="1000"
              error={errors.storeNumber?.message}
              {...register("storeNumber")}
            />
            <AppInput
              label="Complemento"
              placeholder="Sala, loja, andar…"
              error={errors.storeComplement?.message}
              {...register("storeComplement")}
            />
          </div>

          <AppInput
            label="Bairro"
            required
            placeholder="Bela Vista"
            error={errors.storeNeighborhood?.message}
            {...register("storeNeighborhood")}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AppInput
              label="Cidade"
              required
              placeholder="São Paulo"
              error={errors.storeCity?.message}
              {...register("storeCity")}
            />
            <AppInput
              label="Estado (UF)"
              required
              placeholder="SP"
              maxLength={2}
              error={errors.storeState?.message}
              {...register("storeState")}
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <AppButton type="button" variant="outline" size="lg" icon="ArrowLeft" onClick={onBack}>
              Voltar
            </AppButton>
            <AppButton type="submit" fullWidth size="lg" iconRight="ArrowRight">
              Continuar
            </AppButton>
          </div>
        </div>
      </form>
    </AppCard>
  );
}
